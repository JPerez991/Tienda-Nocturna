import type { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { env } from "../../config/env.js";

// Registra los plugins de seguridad del servidor.
export async function registerSecurity(app: FastifyInstance) {
  // Cabeceras seguras (X-Frame-Options, CSP básica, etc.)
  await app.register(helmet);

  // CORS: solo permite el origen del frontend y credenciales (cookies).
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Cookies firmadas (usamos el mismo secreto que el JWT).
  await app.register(cookie, { secret: env.JWT_SECRET });

  // Límite de peticiones por IP (protege contra fuerza bruta / abuso).
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
}
