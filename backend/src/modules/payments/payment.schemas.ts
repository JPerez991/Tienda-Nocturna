import { z } from "zod";

// DTOs de confirmación de pago tras el retorno de checkout.wompi.co.
export const confirmPaymentSchema = z.object({
  // Id de la transacción que Wompi devuelve en el query "?id=" del retorno.
  transactionId: z.string().min(1, "Falta el id de la transacción"),
});
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
