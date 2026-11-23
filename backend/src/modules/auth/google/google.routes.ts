import type { FastifyInstance } from "fastify";
import { googleController } from "./google.controller.js";

// Límite más estricto que el global (100/min): el flujo OAuth hace pocas
// peticiones y no debe poder usarse para abusar del endpoint de token.
const oauthRateLimit = {
  config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
};

export async function googleRoutes(app: FastifyInstance) {
  app.get("/api/auth/google", oauthRateLimit, googleController.start);
  app.get("/api/auth/google/callback", oauthRateLimit, googleController.callback);
}
