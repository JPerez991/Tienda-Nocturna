import type { Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma.js";
import { orderRepository } from "../orders/order.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { restock } from "../../shared/inventory.js";
import { createPaymentGateway } from "../../shared/payments/gateway.factory.js";

// Lógica del webhook de la pasarela. El FRONTEND NUNCA llama a este endpoint:
// lo invoca Wompi y la firma HMAC es lo que lo hace confiable.

function toOrderLines(items: Array<{ variantId: string; quantity: number }>) {
  return items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
}

function parsePayload(rawBody: string): Prisma.InputJsonValue {
  try {
    return JSON.parse(rawBody) as Prisma.InputJsonValue;
  } catch {
    return { raw: rawBody };
  }
}

export const paymentService = {
  async handleWebhook(rawBody: string, signature: string | undefined) {
    if (!signature) throw new AppError(401, "Firma del webhook ausente");

    const gateway = createPaymentGateway();
    let verification;
    try {
      verification = gateway.verifyWebhook(rawBody, signature);
    } catch {
      // JSON ilegible o firma malformada.
      throw new AppError(401, "Firma del webhook inválida");
    }
    if (!verification.valid) throw new AppError(401, "Firma del webhook inválida");

    const { gatewayRef, status, amountInCents } = verification;
    if (!gatewayRef || !status) throw new AppError(400, "Notificación de pago incompleta");

    const payment = await orderRepository.findPaymentByGatewayRef(gatewayRef);
    if (!payment) throw new AppError(404, "Transacción no encontrada");

    // El monto debe coincidir con el pedido registrado (defensa adicional).
    if (amountInCents !== undefined && amountInCents !== payment.amount) {
      throw new AppError(400, "El monto notificado no coincide con el pedido");
    }

    // Idempotencia: Wompi puede reintentar; un evento ya aplicado no cambia nada.
    if (payment.status === status) return { processed: false };

    const order = payment.order;
    await prisma.$transaction(async (tx) => {
      await orderRepository.updatePaymentStatus(payment.id, status, tx);
      // Auditoría con el payload crudo (Wompi no envía datos de tarjeta).
      await orderRepository.saveRawWebhook(payment.id, parsePayload(rawBody), tx);

      if (status === "APPROVED") {
        // El stock ya se reservó al crear el pedido.
        if (order.status === "PENDING") {
          await orderRepository.updateOrderStatus(order.id, "PAID", tx);
        }
      } else if (status === "DECLINED" || status === "VOIDED") {
        if (order.status === "PENDING") {
          await restock(tx, toOrderLines(order.items));
          await orderRepository.updateOrderStatus(order.id, "CANCELLED", tx);
        }
      } else if (status === "REFUNDED") {
        if (order.status === "PAID" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED") {
          // El reembolso no repone stock automáticamente: la devolución de la
          // mercancía se gestiona manualmente desde el panel admin.
          await orderRepository.updateOrderStatus(order.id, "REFUNDED", tx);
        }
      }
    });

    return { processed: true };
  },
};
