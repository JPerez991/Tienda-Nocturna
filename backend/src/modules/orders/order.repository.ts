import { prisma } from "../../shared/prisma.js";
import type { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

// Permite operar tanto sobre el cliente global como dentro de una transacción.
type Db = Prisma.TransactionClient | typeof prisma;

// Repositorio de pedidos (patrón Repository).
export const orderRepository = {
  findAddressOwned(addressId: string, userId: string) {
    return prisma.address.findFirst({ where: { id: addressId, userId } });
  },

  findUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true },
    });
  },

  // Líneas del carrito con todo lo necesario para congelar el pedido.
  findCartItems(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            priceOverride: true,
            stock: true,
            product: { select: { name: true, price: true } },
          },
        },
      },
    });
  },

  findOrderDetail(orderId: string, db: Db = prisma) {
    return db.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true, address: true },
    });
  },

  listByUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
    });
  },

  // Listado del panel admin: comprador + renglones en la misma consulta.
  listAll() {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: { select: { id: true, name: true, quantity: true, unitPrice: true } },
      },
    });
  },

  findAdmin(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: { select: { id: true, name: true, quantity: true, unitPrice: true } },
      },
    });
  },

  countSince(date: Date) {
    return prisma.order.count({ where: { createdAt: { gte: date } } });
  },

  createOrderWithItems(tx: Prisma.TransactionClient, data: {
    orderNumber: string;
    userId: string;
    addressId: string;
    subtotal: number;
    shipping: number;
    total: number;
    items: Array<{
      variantId: string;
      unitPrice: number;
      quantity: number;
      name: string;
      sku: string;
    }>;
  }) {
    return tx.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        addressId: data.addressId,
        subtotal: data.subtotal,
        shipping: data.shipping,
        discount: 0,
        total: data.total,
        items: { create: data.items },
      },
      include: { items: true },
    });
  },

  createPayment(tx: Prisma.TransactionClient, data: {
    orderId: string;
    method: PaymentMethod;
    amount: number;
    idempotencyKey: string;
  }) {
    return tx.payment.create({
      data: {
        orderId: data.orderId,
        method: data.method,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
      },
    });
  },

  saveGatewayRef(paymentId: string, gatewayRef: string) {
    return prisma.payment.update({ where: { id: paymentId }, data: { gatewayRef } });
  },

  clearCart(userId: string, db: Db = prisma) {
    return db.cartItem.deleteMany({ where: { userId } });
  },

  updateOrderStatus(orderId: string, status: OrderStatus, db: Db = prisma) {
    return db.order.update({ where: { id: orderId }, data: { status } });
  },

  updatePaymentStatus(paymentId: string, status: PaymentStatus, db: Db = prisma) {
    return db.payment.update({ where: { id: paymentId }, data: { status } });
  },

  saveRawWebhook(paymentId: string, payload: Prisma.InputJsonValue, db: Db = prisma) {
    return db.payment.update({ where: { id: paymentId }, data: { rawWebhook: payload } });
  },

  findPaymentByGatewayRef(gatewayRef: string) {
    return prisma.payment.findUnique({
      where: { gatewayRef },
      include: { order: { include: { items: true } } },
    });
  },
};
