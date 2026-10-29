import { z } from "zod";
import { OrderStatus, PaymentMethod as DbPaymentMethod } from "@prisma/client";
import type { PaymentMethod } from "../../shared/payments/types.js";

// DTOs de pedidos. Los enums salen del esquema Prisma para que el contrato
// y la base de datos no puedan divergir.

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Falta la dirección de envío"),
  // Acepta cualquier método del enum + "CARD" como alias de CREDIT_CARD
  // (alias para no romper el paso "Pago" del FRONTEND mientras lo ajusta).
  paymentMethod: z.union([z.nativeEnum(DbPaymentMethod), z.literal("CARD")]),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;

// Normaliza el alias "CARD" al valor canónico guardado en la BD.
export function normalizePaymentMethod(method: DbPaymentMethod | "CARD"): PaymentMethod {
  return method === "CARD" ? "CREDIT_CARD" : method;
}
