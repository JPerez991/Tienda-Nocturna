/**
 * Estilo "enlace navbar": versalitas finas + subrayado en hover.
 * Sin marcos, sin masas, sin fondos — la selección se comunica con
 * subrayado (igual que el NavItem del header, colores invertidos
 * sobre fondo crema).
 *
 * Usado por: fila de Colecciones (home), chips de categoría (catálogo)
 * y selector de tallas (ficha). Decisión de diseño: estos controles son
 * enlaces-estilo-nav, no chips con relleno.
 */

type Estado = "activo" | "inactivo" | "deshabilitado";

const BASE =
  "inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.18em] underline-offset-[10px] transition-colors";

export function estiloNavLink(estado: Estado): string {
  switch (estado) {
    case "activo":
      return `${BASE} text-tinta underline decoration-tinta`;
    case "deshabilitado":
      return `${BASE} text-tinta/35 cursor-not-allowed`;
    case "inactivo":
    default:
      return `${BASE} text-tinta/70 hover:text-tinta hover:underline hover:decoration-tinta/60`;
  }
}
