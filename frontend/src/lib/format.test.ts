import { describe, expect, it } from "vitest";
import { discountPercent, esTelefonoCO, formatCOP } from "./format";

describe("formatCOP", () => {
  it("formatea COP con punto de miles y sin decimales", () => {
    expect(formatCOP(180000)).toBe("$ 180.000");
  });

  it("formatea montos pequeños y cero", () => {
    expect(formatCOP(0)).toBe("$ 0");
    expect(formatCOP(5000)).toBe("$ 5.000");
  });
});

describe("discountPercent", () => {
  it("devuelve null sin precio de comparación", () => {
    expect(discountPercent(180000)).toBeNull();
    expect(discountPercent(180000, null)).toBeNull();
  });

  it("devuelve null si el precio de comparación no es mayor", () => {
    expect(discountPercent(180000, 180000)).toBeNull();
    expect(discountPercent(180000, 100000)).toBeNull();
  });

  it("calcula el porcentaje redondeado", () => {
    expect(discountPercent(80000, 100000)).toBe(20);
    expect(discountPercent(180000, 220000)).toBe(18);
  });
});

describe("esTelefonoCO", () => {
  it("acepta exactamente 10 dígitos (con espacios o guiones)", () => {
    expect(esTelefonoCO("3001234567")).toBe(true);
    expect(esTelefonoCO("300 123 4567")).toBe(true);
    expect(esTelefonoCO("300-123-4567")).toBe(true);
  });

  it("rechaza longitudes distintas y letras", () => {
    expect(esTelefonoCO("300123456")).toBe(false);
    expect(esTelefonoCO("30012345678")).toBe(false);
    expect(esTelefonoCO("30012345a7")).toBe(false);
    expect(esTelefonoCO("")).toBe(false);
  });
});
