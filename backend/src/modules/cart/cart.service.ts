import { cartRepository } from "./cart.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { shippingFor } from "../../shared/shipping.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.schemas.js";

type CartItemRecord = Awaited<ReturnType<typeof cartRepository.findManyByUser>>[number];

// Item del carrito tal como lo consume el FRONTEND.
export interface CartItemDto {
  id: string;
  variant: { id: string; name: string; price: number; stock: number };
  product: { name: string; slug: string; imageUrl: string | null };
  quantity: number;
}

export interface CartDto {
  items: CartItemDto[];
  subtotal: number;
  shippingCost: number;
}

function effectivePrice(item: CartItemRecord): number {
  return item.variant.priceOverride ?? item.variant.product.price;
}

function toCartItemDto(item: CartItemRecord): CartItemDto {
  return {
    id: item.id,
    variant: {
      id: item.variant.id,
      name: item.variant.name,
      price: effectivePrice(item),
      stock: item.variant.stock,
    },
    product: {
      name: item.variant.product.name,
      slug: item.variant.product.slug,
      // SIEMPRE presente (aunque sea null) — nota 2 del contrato.
      imageUrl: item.variant.product.images[0]?.url ?? null,
    },
    quantity: item.quantity,
  };
}

// Construye la respuesta completa del carrito (items + totales).
async function buildCart(userId: string): Promise<CartDto> {
  const items = await cartRepository.findManyByUser(userId);
  const mapped = items.map(toCartItemDto);
  const subtotal = mapped.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  return { items: mapped, subtotal, shippingCost: shippingFor(subtotal) };
}

// Lógica de negocio del carrito (requiere sesión).
export const cartService = {
  get(userId: string) {
    return buildCart(userId);
  },

  async add(userId: string, input: AddCartItemInput) {
    const variant = await cartRepository.findVariantForPurchase(input.variantId);
    if (!variant) throw new AppError(404, "La variante indicada no existe");

    const existing = await cartRepository.findItemByVariant(userId, input.variantId);
    const quantity = (existing?.quantity ?? 0) + input.quantity;

    // Regla: upsert SUMA la cantidad (nota 8 del contrato).
    if (quantity > variant.stock) {
      throw new AppError(
        400,
        `Stock insuficiente para ${variant.product.name} · ${variant.name} (disponible: ${variant.stock})`,
      );
    }

    await cartRepository.upsertQuantity(userId, input.variantId, quantity);
    return buildCart(userId);
  },

  async updateQuantity(userId: string, itemId: string, input: UpdateCartItemInput) {
    const item = await cartRepository.findItemOwned(itemId, userId);
    if (!item) throw new AppError(404, "El artículo del carrito no existe");

    if (input.quantity > item.variant.stock) {
      throw new AppError(
        400,
        `Stock insuficiente para ${item.variant.product.name} · ${item.variant.name} (disponible: ${item.variant.stock})`,
      );
    }

    await cartRepository.updateQuantity(itemId, input.quantity);
    return buildCart(userId);
  },

  async remove(userId: string, itemId: string) {
    const item = await cartRepository.findItemOwned(itemId, userId);
    if (!item) throw new AppError(404, "El artículo del carrito no existe");
    await cartRepository.deleteOwned(itemId, userId);
  },
};
