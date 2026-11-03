import type { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma.js";
import { orderRepository } from "../orders/order.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { restock } from "../../shared/inventory.js";
import { createPaymentGateway } from "../../shared/payments/gateway.factory.js";

// Lógica de pagos. Hay DOS formas de enterarse del resultado:
//  1. El webhook de Wompi (firma HMAC) — el FRONTEND NUNCA lo invoca.
//  2. confirmRedirect(), que el frontend llama al volver de checkout.wompi.co
//     con el "?id=" de la transacción. Es el camino que funciona en local,
//     porque el webhook exige una URL pública HTTPS.
// Ambas rutas aplican el MISMO cambio de estado (applyGatewayStatus).

type PaymentWithOrder = NonNullable<
  Awaited<ReturnType<typeof orderRepository.findPaymentByGatewayRef>>
>;

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

/** Estado de Wompi → estado del pago en nuestra BD. */
const STATUS_TO_PAYMENT: Record<string, PaymentStatus> = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  VOIDED: "VOIDED",
  REFUNDED: "REFUNDED",
  // Wompi usa ERROR para tarjetas inválidas; para nosotros es un rechazo.
  ERROR: "DECLINED",
};

// Aplica un estado YA verificado por la pasarela (idempotente).
async function applyGatewayStatus(
  payment: PaymentWithOrder,
  status: PaymentStatus,
  audit: Prisma.InputJsonValue,
): Promise<{ processed: boolean }> {
  // Idempotencia: Wompi puede notificar varias veces; nada cambia si ya está.
  if (payment.status === status) return { processed: false };

  const order = payment.order;
  await prisma.$transaction(async (tx) => {
    await orderRepository.updatePaymentStatus(payment.id, status, tx);
    // Auditoría con la notificación (Wompi no envía datos de tarjeta).
    await orderRepository.saveRawWebhook(payment.id, audit, tx);

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
      if (
        order.status === "PAID" ||
        order.status === "PROCESSING" ||
        order.status === "SHIPPED" ||
        order.status === "DELIVERED"
      ) {
        // El reembolso no repone stock automáticamente: la devolución de la
        // mercancía se gestiona manualmente desde el panel admin.
        await orderRepository.updateOrderStatus(order.id, "REFUNDED", tx);
      }
    }
  });

  return { processed: true };
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

    return applyGatewayStatus(payment, status, parsePayload(rawBody));
  },

  // Confirmación tras el retorno de checkout.wompi.co: Wompi nos manda al
  // frontend con "?id=<transacción>"; el frontend nos lo manda aquí y nosotros
  // consultamos el estado REAL a la pasarela con la llave privada.
  async confirmRedirect(userId: string, transactionId: string) {
    const gateway = createPaymentGateway();

    let transaction;
    try {
      transaction = await gateway.getTransaction(transactionId);
    } catch {
      throw new AppError(502, "No pudimos consultar el pago con la pasarela. Intenta nuevamente.");
    }

    // La referencia de la transacción es el número de pedido: así sabemos a
    // qué pedido pertenece sin confiar en el navegador.
    const order = await orderRepository.findOrderByNumber(transaction.reference);
    if (!order) throw new AppError(404, "Este pedido no existe");
    if (order.userId !== userId) throw new AppError(403, "Este pedido no te pertenece");

    // Defensa: el cobro debe ser exactamente el total del pedido.
    if (transaction.amountCop !== order.total) {
      throw new AppError(400, "El monto del pago no coincide con el pedido");
    }

    const payment = order.payment;
    if (!payment) throw new AppError(404, "Este pedido no tiene un pago registrado");

    if (transaction.status === "PENDING") {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: payment.status,
        orderStatus: order.status,
      };
    }

    const status = STATUS_TO_PAYMENT[transaction.status] ?? "DECLINED";

    // Guardamos el id de la transacción para poder auditarla y conciliarla.
    if (payment.gatewayRef !== transaction.gatewayRef) {
      await orderRepository
        .saveGatewayRef(payment.id, transaction.gatewayRef)
        .catch((error) => {
          console.error(`No se guardó el gatewayRef del pago ${payment.id}:`, error);
        });
    }

    await applyGatewayStatus({ ...payment, order }, status, {
      source: "poll",
      transactionId: transaction.gatewayRef,
      status: transaction.status,
      checkedAt: new Date().toISOString(),
    });

    const updated = await orderRepository.findOrderDetail(order.id);
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: updated?.payment?.status ?? status,
      orderStatus: updated?.status ?? order.status,
    };
  },
};
