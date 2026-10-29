import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ProductPage } from "./ProductPage";

/* ---------- IntersectionObserver controlable por el test ----------
   En el navegador real el IO dispara según visibilidad de la ventana;
   aquí lo dirigimos a mano para probar la lógica del sticky ATC. */
type Evento = { isIntersecting: boolean; boundingClientRect: { top: number } };
type Obs = { cb: (e: Evento[]) => void; el: Element | null; activo: boolean };
const observadores: Obs[] = [];

class FakeIO {
  private rec: Obs;
  constructor(cb: (e: Evento[]) => void) {
    this.rec = { cb, el: null, activo: true };
    observadores.push(this.rec);
  }
  observe(el: Element) {
    this.rec.el = el;
  }
  unobserve() {
    this.rec.activo = false;
  }
  disconnect() {
    this.rec.activo = false;
  }
}

/* ---------- Módulos simulados (contrato: sin red en tests) ---------- */
vi.mock("../lib/api", () => {
  const producto = {
    id: "p1",
    name: "Kimono Seda Vega",
    slug: "kimono-seda-vega",
    price: 189900,
    compareAtPrice: 229900,
    rating: 4.5,
    reviewCount: 12,
    category: { id: "c1", name: "Kimonos", slug: "kimonos" },
    images: [{ url: "https://img.test/1.jpg", alt: "Kimono de seda" }],
    description: "Kimono de seda con encaje.",
    variants: [
      { id: "v1", sku: "K-S", name: "Talla S", price: 189900, stock: 4 },
      { id: "v2", sku: "K-M", name: "Talla M", price: 189900, stock: 0 },
    ],
  };
  return {
    api: { product: vi.fn(() => Promise.resolve(producto)) },
    ApiError: class ApiError extends Error {},
  };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", firstName: "Ana", email: "ana@test.co", role: "CLIENT" },
    logout: vi.fn(),
  }),
}));

vi.mock("../context/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn(), refresh: vi.fn(), count: 0 }),
}));

async function renderPagina() {
  render(
    <MemoryRouter initialEntries={["/producto/kimono-seda-vega"]}>
      <ProductPage />
    </MemoryRouter>,
  );
  await screen.findByRole("button", { name: /Agregar al carrito/ });
  // El effect que registra el observer corre tras el commit; esperamos a que
  // observe el wrapper del CTA para no depender del timing del find.
  await waitFor(() =>
    expect(
      observadores.some((o) => o.el?.className.includes("mt-7")),
    ).toBe(true),
  );
  return observadores.find((o) => o.el?.className.includes("mt-7"));
}

beforeEach(() => {
  observadores.length = 0;
  vi.stubGlobal("IntersectionObserver", FakeIO);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Ficha de producto (tienda-profesional)", () => {
  it("no monta la barra sticky mientras el CTA principal está en pantalla", async () => {
    const obs = await renderPagina();
    expect(obs).toBeTruthy();
    act(() => obs!.cb([{ isIntersecting: true, boundingClientRect: { top: 120 } }]));
    expect(screen.queryByRole("region", { name: "Compra rápida" })).toBeNull();
  });

  it("monta la barra sticky con precio y CTA cuando el CTA queda por encima", async () => {
    const obs = await renderPagina();
    act(() => obs!.cb([{ isIntersecting: false, boundingClientRect: { top: -800 } }]));

    const barra = screen.getByRole("region", { name: "Compra rápida" });
    expect(barra).toHaveTextContent("189.900");
    expect(within(barra).getByRole("button", { name: /Agregar/ })).toBeInTheDocument();
    expect(within(barra).getByText("Kimono Seda Vega")).toBeInTheDocument();
  });

  it("oculta la barra sticky al volver el CTA a la vista", async () => {
    const obs = await renderPagina();
    act(() => obs!.cb([{ isIntersecting: false, boundingClientRect: { top: -800 } }]));
    expect(screen.getByRole("region", { name: "Compra rápida" })).toBeInTheDocument();

    act(() => obs!.cb([{ isIntersecting: true, boundingClientRect: { top: 60 } }]));
    expect(screen.queryByRole("region", { name: "Compra rápida" })).toBeNull();
  });

  it("la guía de talla es un disclosure accesible con contenido honesto", async () => {
    await renderPagina();
    const btn = screen.getByRole("button", { name: /Guía de tallas/ });
    const panel = document.getElementById("guia-talla");

    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");

    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");
    expect(panel).toHaveTextContent("Tallaje estándar colombiano.");
    // Nunca inventar medidas numéricas: el contrato no las expone.
    expect(panel).not.toHaveTextContent(/\d+\s?(cm|in)/i);
  });

  it("muestra exactamente las 3 señales de confianza junto al ATC", async () => {
    await renderPagina();
    expect(screen.getByText("Envío discreto")).toBeInTheDocument();
    expect(screen.getByText("Pago seguro con Wompi")).toBeInTheDocument();
    expect(screen.getByText("Asesoría de talla")).toBeInTheDocument();
  });
});
