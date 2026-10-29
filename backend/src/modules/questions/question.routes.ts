import type { FastifyInstance } from "fastify";
import { questionController } from "./question.controller.js";

// Preguntas y respuestas: lectura pública, escritura con sesión, respuesta admin.
export async function questionRoutes(app: FastifyInstance) {
  const auth = { preHandler: app.authenticate };
  const admin = { preHandler: app.requireRole("ADMIN") };

  // Público (el producto se identifica por slug, igual que el catálogo).
  app.get("/api/products/:slug/questions", questionController.listForProduct);
  app.post("/api/products/:slug/questions", auth, questionController.ask);

  // Admin
  app.get("/api/admin/questions", admin, questionController.adminList);
  app.patch("/api/admin/questions/:id", admin, questionController.answer);
}
