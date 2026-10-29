import { prisma } from "../../shared/prisma.js";
import type { Prisma } from "@prisma/client";

// Construye el filtro WHERE reutilizable para contar y listar.
// `includeInactive` solo lo usa el panel admin (el público ve productos activos).
export function buildProductWhere(filters: {
  category?: string;
  q?: string;
  includeInactive?: boolean;
}): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (!filters.includeInactive) where.isActive = true;

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export const productRepository = {
  findMany(
    where: Prisma.ProductWhereInput,
    opts: { skip: number; take: number; orderBy?: Prisma.ProductOrderByWithRelationInput },
  ) {
    return prisma.product.findMany({
      where,
      skip: opts.skip,
      take: opts.take,
      orderBy: opts.orderBy ?? { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        // Primera imagen para la tarjeta.
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      },
    });
  },

  count(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  },

  // Promedio y total de reseñas por producto (una sola consulta agregada).
  reviewAggregates(productIds: string[]) {
    return prisma.review.groupBy({
      by: ["productId"],
      _avg: { rating: true },
      _count: true,
      where: { productId: { in: productIds } },
    });
  },

  findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
        variants: {
          where: { isActive: true },
          select: { id: true, sku: true, name: true, priceOverride: true, stock: true },
        },
        reviews: { select: { rating: true } },
      },
    });
  },
};
