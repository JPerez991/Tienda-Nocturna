import { prisma } from "../../shared/prisma.js";

// Proyección de un renglón del carrito con todo lo que necesita el FRONTEND:
// variante (precio efectivo y stock) y producto (nombre, slug, primera imagen).
const cartItemInclude = {
  variant: {
    select: {
      id: true,
      name: true,
      priceOverride: true,
      stock: true,
      product: {
        select: {
          name: true,
          slug: true,
          price: true,
          images: { orderBy: { position: "asc" as const }, take: 1, select: { url: true } },
        },
      },
    },
  },
} as const;

// Repositorio del carrito (patrón Repository).
export const cartRepository = {
  findManyByUser(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: cartItemInclude,
      orderBy: { createdAt: "asc" },
    });
  },

  // Variante comprable: existe, está activa y su producto también.
  findVariantForPurchase(variantId: string) {
    return prisma.productVariant.findFirst({
      where: { id: variantId, isActive: true, product: { isActive: true } },
      select: {
        id: true,
        name: true,
        stock: true,
        priceOverride: true,
        product: { select: { name: true, price: true } },
      },
    });
  },

  findItemOwned(itemId: string, userId: string) {
    return prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: {
        variant: {
          select: {
            stock: true,
            name: true,
            product: { select: { name: true } },
          },
        },
      },
    });
  },

  findItemByVariant(userId: string, variantId: string) {
    return prisma.cartItem.findUnique({
      where: { userId_variantId: { userId, variantId } },
    });
  },

  // Ya existe la regla (userId, variantId) única: upsert SUMA la cantidad.
  upsertQuantity(userId: string, variantId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: { userId_variantId: { userId, variantId } },
      create: { userId, variantId, quantity },
      update: { quantity },
    });
  },

  updateQuantity(itemId: string, quantity: number) {
    return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  },

  deleteOwned(itemId: string, userId: string) {
    return prisma.cartItem.deleteMany({ where: { id: itemId, userId } });
  },
};
