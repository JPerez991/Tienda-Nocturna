import type { FastifyInstance, FastifyRequest, preHandlerHookHandler } from "fastify";
import { verifyToken } from "./jwt.js";
import { AppError } from "../errors/app-error.js";

// Adjunta el usuario a partir de la cookie JWT. Lanza 401 si no hay sesión válida.
async function attachUser(request: FastifyRequest): Promise<void> {
  const token = request.cookies?.token;
  if (!token) throw new AppError(401, "No autenticado");

  try {
    const payload = await verifyToken(token);
    request.user = { id: payload.sub, role: payload.role };
  } catch {
    throw new AppError(401, "Sesión inválida o expirada");
  }
}

// Se ejecuta sobre la instancia raíz para que los decoradores sean globales
// (sin necesidad de fastify-plugin). Las rutas hijos heredan estos decoradores.
export async function setupAuth(app: FastifyInstance): Promise<void> {
  app.decorateRequest("user", undefined);

  // Requiere sesión válida.
  app.decorate(
    "authenticate",
    (async (request: FastifyRequest) => {
      await attachUser(request);
    }) as preHandlerHookHandler,
  );

  // Requiere sesión válida Y un rol específico.
  app.decorate("requireRole", (role: "CUSTOMER" | "ADMIN") => {
    return (async (request: FastifyRequest) => {
      await attachUser(request);
      if (request.user?.role !== role) {
        throw new AppError(403, "No tienes permisos para esta acción");
      }
    }) as preHandlerHookHandler;
  });
}
