import { randomUUID } from "node:crypto";
import { Prisma, type OrderStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma.js";
import { orderRepository } from "./order.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { env } from "../../config/env.js";
import { shippingFor } from "../../shared/shipping.js";
import { restock, reserveStock, type StockLine } from "../../shared/inventory.js";
import { createPaymentGateway } from "../../shared/payments/gateway.factory.js";
import { toAddressDto } from "../addresses/address.service.js";
import { normalizePaymentMethod, type CheckoutInput } from "./order.schemas.js";

type CartLine = Awaited<ReturnType<typeof orderRepository.findCartItems>>[number];
type OrderDetailRecord = NonNullable<Awaited<ReturnType<typeof orderRepository.findOrderDetail>>>;
type AdminOrderRecord = NonNullable<Awaited<ReturnType<typeof orderRepository.findAdmin>>>;

/* ------------------------------ DTOs (contrato) ------------------------------ */

function unitPrice(line: CartLine): number {
  // Precio CONGELADO: el de la variante o el base del producto.
  return line.variant.priceOverride ?? line.variant.product.price;
}

function lineLabel(line: CartLine): string {
  return `${line.variant.product.name} · ${line.variant.name}`;
}

function toStockLines(lines: Array<{ variantId: string; quantity: number }>): StockLine[] {
  return lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity }));
}

function toDetailDto(order: OrderDetailRecord) {
  const base = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    shippingCost: order.shipping,
    discount: order.discount,
    total: order.total,
    createdAt: order.createdAt,
    address: toAddressDto(order.address),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
  };
  if (!order.payment) return base;
  return {
    ...base,
    payment: { id: order.payment.id, method: order.payment.method, status: order.payment.status },
  };
}

function toAdminDto(order: AdminOrderRecord) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    shippingCost: order.shipping,
    total: order.total,
    createdAt: order.createdAt,
    user: order.user,
    items: order.items,
  };
}

/* ------------------------- Creación del pedido ------------------------------ */

async function createPendingOrder(params: {
  userId: string;
  addressId: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  method: ReturnType<typeof normalizePaymentMethod>;
  cartLines: CartLine[];
}) {
  const year = new Date().getFullYear();
  const since = new Date(Date.UTC(year, 0, 1));

  for (let attempt = 1; attempt <= 3; attempt++) {
    const count = await orderRepository.countSince(since);
    const orderNumber = `NA-${year}-${String(count + attempt).padStart(6, "0")}`;

    try {
      return await prisma.$transaction(async (tx) => {
        // 1) Reserva atómica de stock: si algo falta, TODO se revierte.
        const failed = await reserveStock(tx, toStockLines(params.cartLines));
        if (failed) {
          const line = params.cartLines.find((item) => item.variant.id === failed.variantId)!;
          throw new AppError(409, `Stock insuficiente para ${lineLabel(line)}`, [
            { field: `variant.${failed.variantId}`, message: "sin stock suficiente" },
          ]);
        }

        // 2) Pedido + renglones (precios congelados) + pago.
        const order = await orderRepository.createOrderWithItems(tx, {
          orderNumber,
          userId: params.userId,
          addressId: params.addressId,
          subtotal: params.subtotal,
          shipping: params.shippingCost,
          total: params.total,
          items: params.cartLines.map((line) => ({
            variantId: line.variant.id,
            unitPrice: unitPrice(line),
            quantity: line.quantity,
            name: line.variant.product.name,
            sku: line.variant.sku,
          })),
        });

        const payment = await orderRepository.createPayment(tx, {
          orderId: order.id,
          method: params.method,
          amount: params.total,
          idempotencyKey: randomUUID(),
        });

        return { order, payment };
      });
    } catch (error) {
      // Colisión de número de pedido → reintentamos con el siguiente.
      const duplicate =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!duplicate || attempt === 3) throw error;
    }
  }

  throw new AppError(500, "No pudimos generar el número de pedido. Intenta nuevamente.");
}

// Devuelve stock y borra el pedido si la pasarela no pudo iniciar el pago.
async function compensateOrder(orderId: string, cartLines: CartLine[]): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await restock(tx, toStockLines(cartLines));
    await tx.payment.deleteMany({ where: { orderId } });
    await tx.order.delete({ where: { id: orderId } });
  });
}

function assertOwner(order: OrderDetailRecord, userId: string): void {
  if (order.userId !== userId) throw new AppError(403, "Este pedido no te pertenece");
}

/* ------------------------------ Lógica de negocio --------------------------- */

export const orderService = {
  list(userId: string) {
    return orderRepository.listByUser(userId);
  },

  async detail(userId: string, orderId: string) {
    const order = await orderRepository.findOrderDetail(orderId);
    if (!order) throw new AppError(404, "Pedido no encontrado");
    assertOwner(order, userId);
    return toDetailDto(order);
  },

  async checkout(userId: string, input: CheckoutInput) {
    const address = await orderRepository.findAddressOwned(input.addressId, userId);
    if (!address) throw new AppError(404, "La dirección indicada no existe");

    const cartLines = await orderRepository.findCartItems(userId);
    if (cartLines.length === 0) throw new AppError(400, "El carrito está vacío");

    const sinStock = cartLines.find((line) => line.quantity > line.variant.stock);
    if (sinStock) {
      throw new AppError(
        409,
        `Stock insuficiente para ${lineLabel(sinStock)} (disponible: ${sinStock.variant.stock})`,
        [{ field: `variant.${sinStock.variant.id}`, message: "sin stock suficiente" }],
      );
    }

    const user = await orderRepository.findUser(userId);
    if (!user) throw new AppError(401, "No autenticado");

    const subtotal = cartLines.reduce((sum, line) => sum + unitPrice(line) * line.quantity, 0);
    const shippingCost = shippingFor(subtotal);
    const total = subtotal + shippingCost;
    const method = normalizePaymentMethod(input.paymentMethod);

    const { order, payment } = await createPendingOrder({
      userId,
      addressId: input.addressId,
      subtotal,
      shippingCost,
      total,
      method,
      cartLines,
    });

    // La pasarela se consulta FUERA de la transacción (es lenta y externa).
    let redirectUrl: string;
    let gatewayRef: string;
    try {
      const result = await createPaymentGateway().createPayment({
        amountInCents: total,
        reference: order.orderNumber,
        method,
        // Wompi regresa al historial de pedidos (CORS_ORIGIN = origen del frontend).
        redirectUrl: `${env.CORS_ORIGIN}/pedidos`,
        customer: {
          email: user.email,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          phone: user.phone ?? undefined,
        },
      });
      redirectUrl = result.redirectUrl;
      gatewayRef = result.gatewayRef;
    } catch {
      // Sin URL de pago no hay compra: limpiamos el pedido y devolvemos el stock.
      await compensateOrder(order.id, cartLines).catch((cleanupError) => {
        console.error("No se pudo compensar el pedido tras fallo de la pasarela:", cleanupError);
      });
      throw new AppError(502, "No pudimos iniciar el pago con la pasarela. Intenta nuevamente.");
    }

    // Estos dos pasos no deben romper la compra si fallan: se registran.
    await orderRepository.saveGatewayRef(payment.id, gatewayRef).catch((error) => {
      console.error(`No se guardó el gatewayRef del pago ${payment.id}:`, error);
    });
    await orderRepository.clearCart(userId).catch((error) => {
      console.error(`No se vació el carrito del usuario ${userId}:`, error);
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal,
      shippingCost,
      total,
      payment: { id: payment.id, method, status: "PENDING" as const, redirectUrl },
    };
  },

  // Reintenta el pago de un pedido PENDING (nota 11): nueva transacción en la
  // pasarela y el mismo bloque de pago del checkout.
  async retryPayment(userId: string, orderId: string) {
    const order = await orderRepository.findOrderDetail(orderId);
    if (!order) throw new AppError(404, "Pedido no encontrado");
    assertOwner(order, userId);

    if (order.status !== "PENDING") {
      throw new AppError(400, "El pedido ya no está pendiente de pago");
    }
    if (!order.payment || order.payment.status !== "PENDING") {
      throw new AppError(400, "El pago de este pedido ya fue procesado");
    }

    const user = await orderRepository.findUser(userId);
    if (!user) throw new AppError(401, "No autenticado");

    let redirectUrl: string;
    try {
      const result = await createPaymentGateway().createPayment({
        amountInCents: order.total,
        reference: order.orderNumber,
        method: order.payment.method,
        redirectUrl: `${env.CORS_ORIGIN}/pedidos`,
        customer: {
          email: user.email,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          phone: user.phone ?? undefined,
        },
      });
      await orderRepository.saveGatewayRef(order.payment.id, result.gatewayRef);
      redirectUrl = result.redirectUrl;
    } catch {
      throw new AppError(502, "No pudimos iniciar el pago con la pasarela. Intenta nuevamente.");
    }

    return {
      redirectUrl,
      payment: {
        id: order.payment.id,
        method: order.payment.method,
        status: order.payment.status,
        redirectUrl,
      },
    };
  },

  // Cancelación del propio cliente (nota 12): solo PENDING y repone stock.
  async cancel(userId: string, orderId: string) {
    const order = await orderRepository.findOrderDetail(orderId);
    if (!order) throw new AppError(404, "Pedido no encontrado");
    assertOwner(order, userId);

    if (order.status !== "PENDING") {
      throw new AppError(400, "Solo se pueden cancelar pedidos pendientes");
    }

    await prisma.$transaction(async (tx) => {
      await restock(tx, toStockLines(order.items));
      await orderRepository.updateOrderStatus(orderId, "CANCELLED", tx);
    });

    const updated = await orderRepository.findOrderDetail(orderId);
    return toDetailDto(updated!);
  },

  async adminList() {
    const orders = await orderRepository.listAll();
    return orders.map(toAdminDto);
  },

  // Cambio de estado desde el panel admin. Al cancelar se repone el stock y
  // al reactivar un pedido cancelado se vuelve a reservar.
  async adminUpdateStatus(orderId: string, status: OrderStatus) {
    const order = await orderRepository.findOrderDetail(orderId);
    if (!order) throw new AppError(404, "Pedido no encontrado");

    if (order.status !== status) {
      await prisma.$transaction(async (tx) => {
        const lines = toStockLines(order.items);
        if (status === "CANCELLED") {
          await restock(tx, lines);
        } else if (order.status === "CANCELLED") {
          const failed = await reserveStock(tx, lines);
          if (failed) {
            throw new AppError(409, "No hay stock suficiente para reactivar este pedido");
          }
        }
        await orderRepository.updateOrderStatus(orderId, status, tx);
      });
    }

    const updated = await orderRepository.findAdmin(orderId);
    return toAdminDto(updated!);
  },
};
