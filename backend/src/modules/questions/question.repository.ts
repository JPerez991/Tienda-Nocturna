import { prisma } from "../../shared/prisma.js";

// Repositorio de preguntas (patrón Repository).
export const questionRepository = {
  // Listado admin: todas las preguntas, con el producto al que pertenecen.
  findAll() {
    return prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  },

  findById(id: string) {
    return prisma.question.findUnique({ where: { id } });
  },

  // Preguntas públicas de un producto: solo las respondidas.
  findAnsweredBySlug(slug: string) {
    return prisma.question.findMany({
      where: { product: { slug, isActive: true }, status: "ANSWERED" },
      orderBy: { answeredAt: "asc" },
    });
  },

  findProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });
  },

  findAuthor(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true },
    });
  },

  create(productId: string, author: string, content: string) {
    return prisma.question.create({ data: { productId, author, content } });
  },

  answer(id: string, answer: string) {
    return prisma.question.update({
      where: { id },
      data: { answer, status: "ANSWERED", answeredAt: new Date() },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  },
};
