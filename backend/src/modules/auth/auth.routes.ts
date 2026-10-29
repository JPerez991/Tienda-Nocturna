import type { FastifyInstance } from "fastify";
import { authController } from "./auth.controller.js";

// Rutas de autenticación (capa HTTP). Solo enruta al controller.
export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  // /me requiere sesión válida.
  app.get("/api/auth/me", { preHandler: app.authenticate }, authController.me);
}
