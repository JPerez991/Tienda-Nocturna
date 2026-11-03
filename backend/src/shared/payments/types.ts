// ============================================================================
// Patrón ADAPTER para pasarelas de pago.
// Definimos una interfaz común (PaymentGateway). Wompi es una implementación.
// Para cambiar a MercadoPago/PayU, solo se agrega otro adaptador SIN tocar el
// resto del código (principio de abierto/cerrado OCP).
// ============================================================================

export type PaymentMethod =
  | "NEQUI"
  | "DAVIPLATA"
  | "PSE"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANCOLOMBIA";

export interface CreatePaymentInput {
  /** Monto en COP (entero, sin decimales). Ej: 185000 = $185.000 */
  amountInCents: number;
  /** Referencia interna del pedido (ej: "NA-2026-000123") */
  reference: string;
  method: PaymentMethod;
  /** URL a la que Wompi redirige al cliente tras pagar */
  redirectUrl: string;
  /** Datos del comprador para la pasarela */
  customer: {
    email: string;
    fullName: string;
    phone?: string;
  };
}

export interface CreatePaymentResult {
  /**
   * ID de la transacción en la pasarela. Con checkout alojado de Wompi la
   * transacción se crea DESPUÉS de que el cliente paga, así que aquí suele
   * venir vacío: el id llega en el query `?id=` del retorno.
   */
  gatewayRef?: string;
  /** URL donde el frontend redirige al usuario para completar el pago */
  redirectUrl: string;
}

/** Estados que Wompi devuelve en una transacción. */
export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "REFUNDED"
  | "ERROR";

/** Instantánea de una transacción consultada a la pasarela. */
export interface TransactionSnapshot {
  /** ID de la transacción en la pasarela */
  gatewayRef: string;
  /** Referencia interna del pedido (ej: "NA-2026-000123") */
  reference: string;
  status: TransactionStatus;
  /** Monto en COP enteros (la pasarela lo da en centavos). Ej: 185000 */
  amountCop: number;
}

export interface WebhookVerification {
  valid: boolean;
  gatewayRef?: string;
  status?: "APPROVED" | "DECLINED" | "VOIDED" | "REFUNDED";
  amountInCents?: number;
}

// Contrato que toda pasarela debe cumplir.
export interface PaymentGateway {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Consulta el estado real de una transacción (confirmación tras el retorno). */
  getTransaction(gatewayRef: string): Promise<TransactionSnapshot>;
  /** Verifica la firma del webhook para no aceptar notificaciones falsas. */
  verifyWebhook(rawBody: string, signature: string): WebhookVerification;
}
