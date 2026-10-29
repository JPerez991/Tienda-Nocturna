import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "./api";

/** Respuesta simulada con la forma mínima que consume request(). */
function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("request: éxito", () => {
  it("GET /health usa credentials include (cookies httpOnly)", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ status: "ok", timestamp: "2026-10-26T00:00:00Z" }),
    );
    const res = await api.health();
    expect(res.status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/health");
    expect(init.credentials).toBe("include");
  });

  it("arma el query string del contrato y omite vacíos", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], page: 1, totalPages: 0, total: 0 }));
    await api.products({ category: "sujetadores", q: "", page: 2 });
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("/api/products?category=sujetadores&page=2");
  });

  it("resuelve 204 sin cuerpo (logout)", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, 204));
    await expect(api.auth.logout()).resolves.toBeUndefined();
  });
});

describe("request: errores", () => {
  it("normaliza el cuerpo de error a ApiError con statusCode", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { statusCode: 404, error: "Not Found", message: "Producto no encontrado" },
        404,
      ),
    );
    const err = await api.product("no-existe").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).statusCode).toBe(404);
    expect((err as Error).message).toBe("Producto no encontrado");
  });

  it("usa mensaje genérico si el cuerpo no es JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("body inválido");
      },
    } as unknown as Response);
    const err = await api.health().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).statusCode).toBe(500);
    expect((err as Error).message).toBe("Error inesperado del servidor (500).");
  });

  it("propaga 401 del carrito sin sesión (para redirigir a login)", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ statusCode: 401, error: "Unauthorized", message: "No autenticado" }, 401),
    );
    const err = await api.cart.get().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).statusCode).toBe(401);
  });
});
