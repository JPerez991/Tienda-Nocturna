import type { Prisma } from "@prisma/client";
import { buildProductWhere, productRepository } from "./product.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { sortBySize } from "../../shared/sizes.js";
import type { ListProductsQuery } from "./product.schemas.js";
import type { FichaTecnica } from "./product.admin.schemas.js";

// Ordenar por valoración exige el promedio de reseñas, que solo existe como
// agregado: se calcula en memoria sobre el catálogo completo (tope por
// rendimiento; Nocturna maneja cientos, no miles, de productos).
const RATING_SORT_MAX = 500;

type ProductListItem = Awaited<ReturnType<typeof productRepository.findMany>>[number];
type ReviewAggregate = Awaited<ReturnType<typeof productRepository.reviewAggregates>>[number];
type DetailProduct = NonNullable<Awaited<ReturnType<typeof productRepository.findBySlug>>>;

// La ficha se persiste como Json validado por el DTO; si viniera de otra vía
// con un shape distinto, se devuelve null en vez de filtrar campos arbitrarios.
function mapFichaTecnica(value: DetailProduct["fichaTecnica"]): FichaTecnica | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as unknown as FichaTecnica;
}

// Redondea un promedio a 1 decimal (ej: 4.75 → 4.8).
function roundRating(value: number | null | undefined): number {
  if (!value) return 0;
  return Math.round(value * 10) / 10;
}

function mapListItem(
  product: ProductListItem,
  aggregate?: ReviewAggregate,
  options: { includeActive?: boolean } = {},
) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    images: product.images,
    rating: roundRating(aggregate?._avg.rating),
    reviewCount: aggregate?._count ?? 0,
    // `active` solo en el listado admin: la tienda pública no expone el estado.
    ...(options.includeActive ? { active: product.isActive } : {}),
  };
}

async function aggregatesFor(ids: string[]) {
  if (ids.length === 0) return new Map<string, ReviewAggregate>();
  const aggregates = await productRepository.reviewAggregates(ids);
  return new Map(aggregates.map((aggregate) => [aggregate.productId, aggregate]));
}

function orderByFor(sort: ListProductsQuery["sort"]): Prisma.ProductOrderByWithRelationInput | undefined {
  switch (sort) {
    case "newest":
      return { createdAt: "desc" };
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    // "featured" y "rating" se calculan en memoria (necesitan el promedio).
    default:
      return undefined;
  }
}

// Listado por mejor valoración (orden en memoria, ver RATING_SORT_MAX).
async function listByRating(
  where: Prisma.ProductWhereInput,
  params: { page: number; limit: number; sort: "featured" | "rating" },
  mapping: { includeActive?: boolean } = {},
) {
  const { page, limit, sort } = params;
  const total = await productRepository.count(where);
  const products = await productRepository.findMany(where, {
    skip: 0,
    take: RATING_SORT_MAX,
    orderBy: { createdAt: "desc" },
  });
  const aggregates = await aggregatesFor(products.map((product) => product.id));

  const rating = (id: string) => roundRating(aggregates.get(id)?._avg.rating);
  const reviewCount = (id: string) => aggregates.get(id)?._count ?? 0;

  const comparator =
    sort === "rating"
      ? (a: ProductListItem, b: ProductListItem) =>
          rating(b.id) - rating(a.id) || reviewCount(b.id) - reviewCount(a.id)
      : // "featured": mejor valoración y, a igualdad, los más recientes.
        (a: ProductListItem, b: ProductListItem) =>
          rating(b.id) - rating(a.id) || b.createdAt.getTime() - a.createdAt.getTime();

  const sorted = [...products].sort(comparator);
  const pageItems = sorted.slice((page - 1) * limit, page * limit);

  return {
    items: pageItems.map((product) => mapListItem(product, aggregates.get(product.id), mapping)),
    page,
    totalPages: Math.ceil(total / limit),
    total,
  };
}

// Lógica de negocio del catálogo de productos.
export const productService = {
  async list(params: ListProductsQuery, options: { includeInactive?: boolean } = {}) {
    const { page, limit, category, q, sort } = params;
    const where = buildProductWhere({ category, q, includeInactive: options.includeInactive });
    const mapping = { includeActive: options.includeInactive === true };

    if (sort === "rating" || sort === "featured") {
      return listByRating(where, { page, limit, sort }, mapping);
    }

    const [total, products] = await Promise.all([
      productRepository.count(where),
      productRepository.findMany(where, {
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderByFor(sort),
      }),
    ]);

    // Agregados de reseñas solo para los productos de esta página.
    const aggregates = await aggregatesFor(products.map((product) => product.id));

    return {
      items: products.map((product) => mapListItem(product, aggregates.get(product.id), mapping)),
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  },

  async detail(slug: string, options: { includeInactive?: boolean } = {}) {
    const product = await productRepository.findBySlug(slug, options);
    if (!product) throw new AppError(404, "Producto no encontrado");

    const ratings = product.reviews.map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      category: product.category,
      // ``active`` es la forma del panel; en BD se llama isActive.
      active: product.isActive,
      offerEndsAt: product.offerEndsAt ? product.offerEndsAt.toISOString() : null,
      fichaTecnica: mapFichaTecnica(product.fichaTecnica),
      images: product.images.map((image) => ({
        url: image.url,
        alt: image.alt,
        order: image.position,
        color: image.color,
        type: image.type,
      })),
      rating: roundRating(avg),
      reviewCount: ratings.length,
      // Siempre de menor a mayor (S → M → L → XL), sin depender del orden
      // de inserción en la BD: lo consumen la ficha y el formulario de admin.
      variants: sortBySize(product.variants).map((v) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        // Precio efectivo: el de la variante o el base del producto.
        price: v.priceOverride ?? product.price,
        stock: v.stock,
        color: v.color,
        colorHex: v.colorHex,
        active: v.isActive,
      })),
    };
  },
};
