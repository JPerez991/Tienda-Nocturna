// Regla de costo de envío (acordada con el FRONTEND en docs/api-contract.md).
export const SHIPPING_COST = 5000;
export const FREE_SHIPPING_THRESHOLD = 150000;

// Envío en COP (enteros). Gratis desde FREE_SHIPPING_THRESHOLD en adelante.
export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}
