import { describe, expect, it } from "vitest";
import { progresoScroll } from "./scroll";

describe("progresoScroll", () => {
  it("es 0 antes de que la sección toque el viewport", () => {
    expect(progresoScroll(400, 2000, 800)).toBe(0);
  });

  it("crece de forma lineal con el recorrido", () => {
    // 2400 de alto - 800 de viewport = 1600 de recorrido.
    expect(progresoScroll(-800, 2400, 800)).toBe(0.5);
    expect(progresoScroll(-1200, 2400, 800)).toBe(0.75);
  });

  it("se detiene en 1 al final", () => {
    expect(progresoScroll(-5000, 2400, 800)).toBe(1);
  });

  it("no divide por cero si la sección es más corta que el viewport", () => {
    expect(progresoScroll(-100, 600, 800)).toBe(0);
  });
});
