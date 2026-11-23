import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import { productService } from "./product.service.js";
import type { CreateProductInput, UpdateProductInput } from "./product.admin.schemas.js";

/* --------------------------- Validaciones previas --------------------------- */

async function assertSlugFree(slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing && existing.id !== excludeId) throw new AppError(409, "El slug ya está en uso");
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) throw new AppError(400, "La categoría indicada no existe");
}

async function assertSkusFree(skus: string[], excludeProductId?: string): Promise<void> {
  if (skus.length === 0) return;
  const taken = await prisma.productVariant.findMany({
    where: {
      sku: { in: skus },
      ...(excludeProductId ? { NOT: { productId: excludeProductId } } : {}),
    },
    select: { sku: true },
  });
  if (taken.length > 0) throw new AppError(409, `El SKU ${taken[0].sku} ya está en uso`);
}

// Si el precio de la variante coincide con el precio base se guarda null,
// de modo que la variante siga al precio base si el admin lo cambia después.
function priceOverride(price: number, basePrice: number): number | null {
  return price === basePrice ? null : price;
}

// `null` en el body borra la ficha (NULL en BD), no guarda un JSON "null".
function fichaTecnicaData(value: CreateProductInput["fichaTecnica"]) {
  return value == null ? Prisma.DbNull : (value as unknown as Prisma.InputJsonValue);
}

/* -------------------------------- Sincronizar ------------------------------- */

type VariantInput = CreateProductInput["variants"][number];
type ImageInput = CreateProductInput["images"][number];

function imageData(image: ImageInput, index: number) {
  return {
    url: image.url,
    alt: image.alt,
    position: image.order ?? index,
    color: image.color ?? null,
    type: image.type ?? "image",
  };
}

function variantData(variant: VariantInput, basePrice: number) {
  return {
    name: variant.name,
    priceOverride: priceOverride(variant.price, basePrice),
    stock: variant.stock,
    color: variant.color ?? null,
    colorHex: variant.colorHex ?? null,
  };
}

async function syncVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  incoming: VariantInput[],
  basePrice: number,
): Promise<void> {
  const current = await tx.productVariant.findMany({ where: { productId } });

  for (const variant of incoming) {
    const match = current.find((row) => row.sku === variant.sku);
    const data = variantData(variant, basePrice);
    if (match) {
      // `active` ausente deja el estado anterior intacto; presente lo respeta
      // (incluido false). Antes se reactivaban todas al guardar el formulario.
      await tx.productVariant.update({
        where: { id: match.id },
        data: { ...data, ...(variant.active !== undefined && { isActive: variant.active }) },
      });
    } else {
      await tx.productVariant.create({
        data: { productId, sku: variant.sku, isActive: variant.active ?? true, ...data },
      });
    }
  }

  // Las variantes que salieron del formulario se eliminan; si ya tienen
  // pedidos, se desactivan para no romper el histórico de compras.
  const kept = new Set(incoming.map((variant) => variant.sku));
  for (const variant of current.filter((row) => !kept.has(row.sku))) {
    const usedInOrders = await tx.orderItem.count({ where: { variantId: variant.id } });
    if (usedInOrders > 0) {
      await tx.productVariant.update({ where: { id: variant.id }, data: { isActive: false } });
    } else {
      await tx.productVariant.delete({ where: { id: variant.id } });
    }
  }
}

/* ------------------------------- Operaciones -------------------------------- */

export const productAdminService = {
  async create(input: CreateProductInput) {
    await assertSlugFree(input.slug);
    await assertCategoryExists(input.categoryId);
    await assertSkusFree(input.variants.map((variant) => variant.sku));

    const created = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        categoryId: input.categoryId,
        isActive: input.active ?? true,
        offerEndsAt: input.offerEndsAt ?? null,
        fichaTecnica: fichaTecnicaData(input.fichaTecnica),
        images: { create: input.images.map(imageData) },
        variants: {
          create: input.variants.map((variant) => ({
            sku: variant.sku,
            isActive: variant.active ?? true,
            ...variantData(variant, input.price),
          })),
        },
      },
    });

    // Respuesta con la MISMA forma del detalle de producto. `includeInactive`
    // permite responder aunque el panel acabe de crear un producto inactivo.
    return productService.detail(created.slug, { includeInactive: true });
  },

  async update(id: string, input: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Producto no encontrado");

    if (input.slug !== undefined && input.slug !== existing.slug) {
      await assertSlugFree(input.slug, id);
    }
    if (input.categoryId !== undefined) await assertCategoryExists(input.categoryId);
    if (input.variants !== undefined) {
      await assertSkusFree(input.variants.map((variant) => variant.sku), id);
    }

    const basePrice = input.price ?? existing.price;
    const finalSlug = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.price !== undefined && { price: input.price }),
          ...(input.compareAtPrice !== undefined && { compareAtPrice: input.compareAtPrice }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.active !== undefined && { isActive: input.active }),
          ...(input.offerEndsAt !== undefined && { offerEndsAt: input.offerEndsAt }),
          ...(input.fichaTecnica !== undefined && {
            fichaTecnica: fichaTecnicaData(input.fichaTecnica),
          }),
        },
      });

      // Lista de imágenes completa: se reemplaza tal cual venga en el body.
      if (input.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (input.images.length > 0) {
          await tx.productImage.createMany({
            data: input.images.map((image, index) => ({
              productId: id,
              ...imageData(image, index),
            })),
          });
        }
      }

      if (input.variants !== undefined) {
        await syncVariants(tx, id, input.variants, basePrice);
      }

      return updated.slug;
    });

    return productService.detail(finalSlug, { includeInactive: true });
  },

  // Borrado físico. Si el producto ya se vendió no se elimina (409) para
  // conservar el histórico de pedidos.
  async remove(id: string): Promise<void> {
    const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!product) throw new AppError(404, "Producto no encontrado");

    const inOrders = await prisma.orderItem.count({ where: { variant: { productId: id } } });
    if (inOrders > 0) {
      throw new AppError(409, "No se puede eliminar: ya tiene pedidos asociados");
    }

    // Borra en cascada imágenes, variantes, reseñas, preguntas y carritos.
    await prisma.product.delete({ where: { id } });
  },
};
