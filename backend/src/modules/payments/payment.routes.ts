import type { FastifyInstance } from "fastify";
import { paymentController } from "./payment.controller.js";

// Rutas de pagos. El webhook es el único endpoint sin sesión.
export async function paymentRoutes(app: FastifyInstance) {
  app.post("/api/payments/webhook/wompi", paymentController.webhook);
}
