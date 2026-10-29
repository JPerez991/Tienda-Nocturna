import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentGateway,
  WebhookVerification,
} from "./types.js";

// Adaptador concreto de Wompi (Colombia).
// Implementa la interfaz PaymentGateway. Es el ÚNICO archivo que conoce la API
// de Wompi; si Wompi cambia, solo se toca aquí.

const WOMPI_API = {
  sandbox: "https://sandbox.wompi.co/v1",
  production: "https://production.wompi.co/v1",
} as const;

export class WompiAdapter implements PaymentGateway {
  readonly name = "wompi";
  private baseUrl = WOMPI_API[env.WOMPI_ENV];

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // En Wompi el monto va en CENTAVOS. Como COP no usa decimales,
    // multiplicamos por 100 para respetar su formato.
    const amountInCents = input.amountInCents * 100;

    const res = await fetch(`${this.baseUrl}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.WOMPI_PRIVATE_KEY}`, // llave PRIVADA solo aquí
      },
      body: JSON.stringify({
        amount_in_cents: amountInCents,
        currency: "COP",
        reference: input.reference,
        customer_email: input.customer.email,
        // redirect_url: donde Wompi manda al usuario al terminar
        redirect_url: input.redirectUrl,
      }),
    });

    if (!res.ok) {
      // No exponemos el detalle crudo al cliente; se loguea en servidor.
      throw new Error(`Wompi createPayment falló: ${res.status}`);
    }

    const data = (await res.json()) as {
      data: { id: string; redirect_url: string };
    };

    return {
      gatewayRef: data.data.id,
      redirectUrl: data.data.redirect_url,
    };
  }

  // Verifica la firma HMAC que Wompi envía en los webhooks.
  // Así rechazamos notificaciones falsas (seguridad crítica de pagos).
  verifyWebhook(rawBody: string, signature: string): WebhookVerification {
    const expected = createHmac("sha256", env.WOMPI_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature ?? "", "utf8");

    // Comparación en tiempo constante para evitar timing attacks.
    const valid = a.length === b.length && timingSafeEqual(a, b);
    if (!valid) return { valid: false };

    const parsed = JSON.parse(rawBody) as {
      data?: { transaction?: { id: string; status: string; amount_in_cents: number } };
    };
    const tx = parsed.data?.transaction;
    if (!tx) return { valid: false };

    const statusMap: Record<string, WebhookVerification["status"]> = {
      APPROVED: "APPROVED",
      DECLINED: "DECLINED",
      VOIDED: "VOIDED",
      REFUNDED: "REFUNDED",
    };

    return {
      valid: true,
      gatewayRef: tx.id,
      status: statusMap[tx.status],
      // Wompi envía centavos; convertimos a pesos enteros.
      amountInCents: Math.floor(tx.amount_in_cents / 100),
    };
  }
}
