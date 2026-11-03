import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentGateway,
  TransactionSnapshot,
  TransactionStatus,
  WebhookVerification,
} from "./types.js";

// Adaptador concreto de Wompi (Colombia).
// Implementa la interfaz PaymentGateway. Es el ÚNICO archivo que conoce la API
// de Wompi; si Wompi cambia, solo se toca aquí.

const WOMPI_API = {
  sandbox: "https://sandbox.wompi.co/v1",
  production: "https://production.wompi.co/v1",
} as const;

// Estados que Wompi usa en transacciones (cualquier otro → ERROR).
const STATUS_MAP: Record<string, TransactionStatus> = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  VOIDED: "VOIDED",
  REFUNDED: "REFUNDED",
  ERROR: "ERROR",
};

// Estados que el webhook puede reflejar en un pago registrado.
const WEBHOOK_STATUSES = ["APPROVED", "DECLINED", "VOIDED", "REFUNDED"] as const;

export class WompiAdapter implements PaymentGateway {
  readonly name = "wompi";
  private baseUrl = WOMPI_API[env.WOMPI_ENV];

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // En Wompi el monto va en CENTAVOS. Como COP no usa decimales,
    // multiplicamos por 100 para respetar su formato.
    const amountInCents = input.amountInCents * 100;

    // Checkout ALOJADO de Wompi: el cliente paga en checkout.wompi.co y nosotros
    // nunca vemos datos de tarjeta. La firma de integridad (SHA-256 de
    // referencia + monto + moneda + secreto) impide que alguien altere el monto.
    const signature = createHash("sha256")
      .update(`${input.reference}${amountInCents}COP${env.WOMPI_INTEGRITY_KEY}`)
      .digest("hex");

    // Las claves del query se dejan tal cual (Wompi usa "signature:integrity");
    // solo se escapan los VALORES.
    const query = [
      `public-key=${encodeURIComponent(env.WOMPI_PUBLIC_KEY)}`,
      `currency=COP`,
      `amount-in-cents=${amountInCents}`,
      `reference=${encodeURIComponent(input.reference)}`,
      `signature:integrity=${signature}`,
      `redirect-url=${encodeURIComponent(input.redirectUrl)}`,
    ].join("&");

    // La transacción todavía no existe: Wompi la crea al confirmar el pago y
    // nos devuelve su id en el query "?id=" del retorno (ver getTransaction).
    return { redirectUrl: `https://checkout.wompi.co/p/?${query}` };
  }

  // Consulta el estado real de una transacción (confirmación tras el retorno).
  async getTransaction(gatewayRef: string): Promise<TransactionSnapshot> {
    const res = await fetch(`${this.baseUrl}/transactions/${encodeURIComponent(gatewayRef)}`, {
      headers: { Authorization: `Bearer ${env.WOMPI_PRIVATE_KEY}` },
    });
    if (!res.ok) throw new Error(`Wompi getTransaction falló: ${res.status}`);

    const data = (await res.json()) as {
      data: { id: string; reference: string; status: string; amount_in_cents: number };
    };
    const tx = data.data;
    const status = STATUS_MAP[tx.status] ?? "ERROR";

    return {
      gatewayRef: tx.id,
      reference: tx.reference,
      status,
      // Wompi envía centavos; convertimos a pesos enteros.
      amountCop: Math.floor(tx.amount_in_cents / 100),
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

    const status = WEBHOOK_STATUSES.find((value) => value === tx.status);

    return {
      valid: true,
      gatewayRef: tx.id,
      status,
      // Wompi envía centavos; convertimos a pesos enteros.
      amountInCents: Math.floor(tx.amount_in_cents / 100),
    };
  }
}
