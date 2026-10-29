import type { FastifyReply, FastifyRequest } from "fastify";
import { paymentService } from "./payment.service.js";
import { AppError } from "../../shared/errors/app-error.js";

// Wompi puede firmar con "x-event-signature" o "x-signature" según la versión
// de la API; aceptamos ambos. El valor puede venir prefijado con "sha256=".
const SIGNATURE_HEADERS = ["x-event-signature", "x-signature"] as const;

function readSignature(headers: FastifyRequest["headers"]): string | undefined {
  for (const name of SIGNATURE_HEADERS) {
    const value = Array.isArray(headers[name]) ? headers[name][0] : headers[name];
    if (!value) continue;
    return value.startsWith("sha256=") ? value.slice("sha256=".length) : value;
  }
  return undefined;
}

export const paymentController = {
  // Endpoint externo: sin cookie de sesión, la seguridad es la firma HMAC.
  async webhook(request: FastifyRequest, reply: FastifyReply) {
    if (!request.rawBody) throw new AppError(400, "El cuerpo del webhook está vacío");

    const result = await paymentService.handleWebhook(
      request.rawBody,
      readSignature(request.headers),
    );

    // Siempre 2xx cuando la firma es válida: Wompi deja de reintentar.
    return reply.status(200).send({ received: true, processed: result.processed });
  },
};
