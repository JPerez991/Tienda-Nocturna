import type { FastifyInstance } from "fastify";

// Endpoint de salud del servidor (sin autenticación).
export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));
}
