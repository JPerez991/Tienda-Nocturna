import type { FastifyInstance } from "fastify";
import { paymentController } from "./payment.controller.js";

// Rutas de pagos. El webhook es el único endpoint sin sesión.
export async function paymentRoutes(app: FastifyInstance) {
  const auth = { preHandler: app.authenticate };

  app.post("/api/payments/webhook/wompi", paymentController.webhook);
  // Retorno de checkout.wompi.co: el frontend nos pasa el id de la transacción.
  app.post("/api/payments/confirm", auth, paymentController.confirm);
}
