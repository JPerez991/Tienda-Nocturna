// Orden de tallas de MENOR a MAYOR.
//
// El orden en que llegan las variantes desde la BD es el de inserción, que no
// garantiza nada (un producto creado desde el panel puede venir XL → S → M).
// Este comparador fija el orden en el punto único que consumen la ficha de
// producto, el selector de tallas y el formulario de admin: siempre S → M → L.

/** Tallas letra, de la más pequeña a la más grande. */
const ORDEN_LETRAS: Record<string, number> = {
  XXS: 0,
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  XXXL: 7,
};
// Grafías alternativas apuntan al mismo valor (2XL = XXL, 3XL = XXXL).
ORDEN_LETRAS["2XL"] = ORDEN_LETRAS.XXL;
ORDEN_LETRAS["3XL"] = ORDEN_LETRAS.XXXL;

/** "Talla S" → "S"; "Talla 38" → "38"; deja el resto tal cual. */
function sizeToken(name: string): string {
  return name
    .toUpperCase()
    .replace(/\bTALLA\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Clave de orden: [grupo, valor].
 * 0 = talla letra conocida · 1 = talla numérica · 2 = lo demás (al final).
 * Dentro de cada grupo se ordena ascendente; los desconocidos conservan su
 * orden original (el desempate por índice lo garantiza el sort).
 */
function sizeKey(name: string): [number, number] {
  const token = sizeToken(name);

  const letra = ORDEN_LETRAS[token];
  if (letra !== undefined) return [0, letra];

  if (/^\d+$/.test(token)) return [1, Number(token)];

  return [2, 0];
}

/**
 * Devuelve una copia de `items` ordenada de menor a mayor según la talla.
 * Es estable: dos variantes sin talla reconocida conservan su orden relativo.
 */
export function sortBySize<T extends { name: string }>(items: T[]): T[] {
  return items
    .map((item, index) => ({ item, index, key: sizeKey(item.name) }))
    .sort(
      (a, b) =>
        a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.index - b.index,
    )
    .map((entry) => entry.item);
}
