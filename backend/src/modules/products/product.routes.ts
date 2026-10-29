import type { FastifyInstance } from "fastify";
import { productController } from "./product.controller.js";
import { productAdminController } from "./product.admin.controller.js";

// Rutas del catálogo: público (cualquier visitante) y admin (rol ADMIN).
export async function productRoutes(app: FastifyInstance) {
  const admin = { preHandler: app.requireRole("ADMIN") };

  // Público
  app.get("/api/products", productController.list);
  app.get("/api/products/:slug", productController.detail);

  // Admin
  app.get("/api/admin/products", admin, productAdminController.list);
  app.post("/api/admin/products", admin, productAdminController.create);
  app.patch("/api/admin/products/:id", admin, productAdminController.update);
  app.delete("/api/admin/products/:id", admin, productAdminController.remove);
}
