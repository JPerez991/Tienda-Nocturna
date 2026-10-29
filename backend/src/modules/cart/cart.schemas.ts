import { z } from "zod";

// DTOs del carrito. La cantidad siempre es un entero >= 1.

export const addCartItemSchema = z.object({
  variantId: z.string().min(1, "Falta la variante"),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1").default(1),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
