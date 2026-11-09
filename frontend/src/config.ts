/**
 * Datos de contacto de la tienda.
 *
 * El número de WhatsApp se puede sobrescribir en `.env` con
 * `VITE_WHATSAPP_NUMERO` (formato internacional, sin «+» ni espacios,
 * ej. `573001234567`). Valor vigente: 311 391 9437 (Colombia) → 57 311 391 9437.
 */
export const WHATSAPP_NUMERO: string =
  import.meta.env.VITE_WHATSAPP_NUMERO ?? "573113919437";

/** Enlace wa.me con mensaje precargado. */
export function whatsappLink(
  texto = "Hola Nocturna, quiero asesoría con mi compra.",
): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}
