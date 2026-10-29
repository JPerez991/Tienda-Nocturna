import type { FastifyInstance } from "fastify";
import { addressController } from "./address.controller.js";

// Rutas de direcciones de envío (requieren sesión).
export async function addressRoutes(app: FastifyInstance) {
  app.get("/api/addresses", { preHandler: app.authenticate }, addressController.list);
  app.post("/api/addresses", { preHandler: app.authenticate }, addressController.create);
}
