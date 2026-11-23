/**
 * Datos de entorno del panel.
 *
 * - `STORE_URL`: a dónde apunta "Ver la tienda". En local, el Vite de la
 *   tienda (5173). En producción, el dominio público de la tienda.
 * - `VITE_API_URL` se deja vacía a propósito: /api se proxya (Vite en dev,
 *   rewrite en el hosting) para que la cookie de sesión sea mismo origen.
 */
export const STORE_URL: string =
  import.meta.env.VITE_STORE_URL ?? "http://localhost:5173";
