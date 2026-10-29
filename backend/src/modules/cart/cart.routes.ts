import type { FastifyInstance } from "fastify";
import { cartController } from "./cart.controller.js";

// Rutas del carrito (todas requieren sesión).
export async function cartRoutes(app: FastifyInstance) {
  const auth = { preHandler: app.authenticate };

  app.get("/api/cart", auth, cartController.get);
  app.post("/api/cart", auth, cartController.add);
  app.patch("/api/cart/:itemId", auth, cartController.updateQuantity);
  app.delete("/api/cart/:itemId", auth, cartController.remove);
}
