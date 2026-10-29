import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/app-error.js";

// Guarda el cuerpo crudo en request.rawBody ANTES de parsearlo a objeto.
// Motivo: la firma HMAC de los webhooks (Wompi) se calcula sobre el JSON
// tal cual llegó en bytes, no sobre el objeto ya parseado (el orden de
// las claves y los espacios importan para el hash).
//
// Además normaliza dos casos que el parser por defecto de Fastify rechaza:
// - POST sin body con cabecera Content-Type: application/json (logout).
// - JSON malformado → 400 con mensaje claro en vez del error genérico.
export function registerRawBody(app: FastifyInstance) {
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (request, body: string, done) => {
      const raw = body ?? "";
      request.rawBody = raw;

      if (raw.trim() === "") {
        // Sin cuerpo: lo dejamos como undefined (los DTO con defaults ok).
        return done(null, undefined);
      }

      try {
        done(null, JSON.parse(raw));
      } catch {
        done(new AppError(400, "JSON inválido"), undefined);
      }
    },
  );
}
