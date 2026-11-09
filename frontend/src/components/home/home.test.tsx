import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Hero } from "./Hero";
import { InfoBand } from "./InfoBand";
import { Marquee } from "./Marquee";

const originalMatchMedia = window.matchMedia;

function conMovimientoReducido(reducido: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reducido && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe("Hero", () => {
  it("presenta el titular con una sola llamada a la acción", () => {
    conMovimientoReducido(true);
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    );
    const titulo = screen.getByRole("heading", { level: 1, name: /lo íntimo/i });
    expect(titulo.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "Lo íntimo, bien hecho.",
    );
    const cta = screen.getByRole("link", { name: /ver la colección/i });
    expect(cta).toHaveAttribute("href", "/catalogo");
  });
});

describe("InfoBand", () => {
  it("enlaza a las tres páginas de información de la tienda", () => {
    render(
      <MemoryRouter>
        <InfoBand />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /políticas de envío/i })).toHaveAttribute(
      "href",
      "/envios",
    );
    expect(
      screen.getByRole("link", { name: /garantía y devoluciones/i }),
    ).toHaveAttribute("href", "/garantia");
    expect(screen.getByRole("link", { name: /pagos seguros/i })).toHaveAttribute(
      "href",
      "/pagos",
    );
  });
});

describe("Marquee", () => {
  it("anuncia los beneficios a lectores de pantalla", () => {
    conMovimientoReducido(false);
    render(<Marquee />);
    expect(
      screen.getByText(/envío discreto a toda colombia\. pago seguro con wompi/i),
    ).toBeInTheDocument();
  });

  it("sin movimiento muestra la línea estática", () => {
    conMovimientoReducido(true);
    render(<Marquee />);
    expect(
      screen.getByText(/envío discreto a toda colombia.*pago seguro con wompi/i),
    ).toBeInTheDocument();
  });
});
