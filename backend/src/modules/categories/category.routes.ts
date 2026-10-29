import type { FastifyInstance } from "fastify";
import { categoryController } from "./category.controller.js";

// Rutas de categorías: catálogo público y CRUD del panel admin.
export async function categoryRoutes(app: FastifyInstance) {
  const admin = { preHandler: app.requireRole("ADMIN") };

  // Público
  app.get("/api/categories", categoryController.list);

  // Admin
  app.get("/api/admin/categories", admin, categoryController.adminList);
  app.post("/api/admin/categories", admin, categoryController.create);
  app.delete("/api/admin/categories/:id", admin, categoryController.remove);
}
