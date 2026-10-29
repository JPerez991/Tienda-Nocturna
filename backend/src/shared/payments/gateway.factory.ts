import { WompiAdapter } from "./wompi.adapter.js";
import type { PaymentGateway } from "./types.js";

// Patrón FACTORY: crea el gateway correcto según configuración.
// Hoy solo hay Wompi; mañana puedes registrar "mercadopago", "payu", etc.
// sin tocar la lógica de negocio (solo se registra aquí).

type GatewayName = "wompi";

const registry = new Map<GatewayName, () => PaymentGateway>([
  ["wompi", () => new WompiAdapter()],
  // Ejemplo futuro:
  // ["mercadopago", () => new MercadoPagoAdapter()],
]);

export function createPaymentGateway(name: GatewayName = "wompi"): PaymentGateway {
  const factory = registry.get(name);
  if (!factory) throw new Error(`Pasarela de pago desconocida: ${name}`);
  return factory();
}
