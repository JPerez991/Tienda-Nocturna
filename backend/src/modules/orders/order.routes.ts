import type { FastifyInstance } from "fastify";
import { orderController } from "./order.controller.js";

// Rutas de pedidos: flujo de compra (cliente) y panel de pedidos (admin).
export async function orderRoutes(app: FastifyInstance) {
  const auth = { preHandler: app.authenticate };
  const admin = { preHandler: app.requireRole("ADMIN") };

  // Compra
  app.post("/api/orders/checkout", auth, orderController.checkout);
  app.get("/api/orders", auth, orderController.list);
  app.get("/api/orders/:id", auth, orderController.detail);
  app.post("/api/orders/:id/pay", auth, orderController.retryPayment);
  app.post("/api/orders/:id/cancel", auth, orderController.cancel);

  // Admin
  app.get("/api/admin/orders", admin, orderController.adminList);
  app.patch("/api/admin/orders/:id/status", admin, orderController.adminUpdateStatus);
}
