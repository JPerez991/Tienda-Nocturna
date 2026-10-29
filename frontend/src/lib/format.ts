/** Formateo de dinero colombiano: COP enteros, sin decimales. Ej: $ 180.000 */

const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCOP(amount: number): string {
  return cop.format(amount).replace(/\u00a0/g, " ");
}

/** Teléfono colombiano válido: exactamente 10 dígitos (sección 7, nota 1). */
export function esTelefonoCO(value: string): boolean {
  return /^\d{10}$/.test(value.replace(/[\s-]/g, ""));
}

/** Porcentaje de descuento redondeado, o null si no hay descuento. */
export function discountPercent(
  price: number,
  compareAtPrice?: number | null,
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
