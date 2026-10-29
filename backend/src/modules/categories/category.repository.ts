import { prisma } from "../../shared/prisma.js";
import type { CreateCategoryInput } from "./category.admin.schemas.js";

// Repositorio de categorías (patrón Repository).
export const categoryRepository = {
  findManyActive() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, imageUrl: true },
    });
  },

  // Panel admin: todas las categorías, misma forma pública.
  findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, imageUrl: true },
    });
  },

  findById(id: string) {
    return prisma.category.findUnique({ where: { id }, select: { id: true } });
  },

  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug }, select: { id: true } });
  },

  countProducts(id: string) {
    return prisma.product.count({ where: { categoryId: id } });
  },

  create(input: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        imageUrl: input.imageUrl ?? null,
      },
      select: { id: true, name: true, slug: true, imageUrl: true },
    });
  },

  remove(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
