/**
 * Progreso (0–1) de una sección "pinneada": cuánto se ha recorrido desde que
 * su borde superior toca el viewport hasta que su borde inferior lo abandona.
 * Se usa para mover la galería horizontal con el scroll de la página.
 */
export function progresoScroll(
  rectTop: number,
  sectionHeight: number,
  viewportHeight: number,
): number {
  const recorrido = sectionHeight - viewportHeight;
  if (recorrido <= 0) return 0;
  const avance = -rectTop / recorrido;
  return Math.min(1, Math.max(0, avance));
}
