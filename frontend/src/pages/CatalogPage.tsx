import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type {
  Category,
  ProductListResponse,
  SortOption,
} from "../lib/types";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, ErrorState, Spinner } from "../components/ui/States";
import { estiloNavLink, estiloNavLinkOscuro } from "../components/ui/navLink";

const LIMIT = 12;

/**
 * Catálogo con filtros sincronizados en la URL:
 * /catalogo?category=slug&q=texto&page=2
 */
export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "";
  const page = Number(params.get("page") ?? "1") || 1;

  const [data, setData] = useState<ProductListResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(q);

  // Categorías una sola vez
  useEffect(() => {
    void api
      .categories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Productos cuando cambian los filtros de la URL
  useEffect(() => {
    let cancelled = false;
    setError(null);
    setData(null);
    api
      .products({
        category: category || undefined,
        q: q || undefined,
        sort: sort ? (sort as SortOption) : undefined,
        page,
        limit: LIMIT,
      })
      .then((r) => {
        if (!cancelled) setData(r);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error desconocido");
      });
    return () => {
      cancelled = true;
    };
  }, [category, q, sort, page]);

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    // Al cambiar filtro o búsqueda, volvemos a la página 1.
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  return (
    <div className="bg-crema">
      {/* ---------- Banda negra: título + buscador + filtros ----------
          El negro enmarca la página y enlaza con el header; la grilla vuelve
          a crema para que las fotos respiren (decisión del usuario: jugar con
          negro y crema, no todo negro). */}
      <div data-tema="oscuro" className="bg-noir text-crema">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-6 sm:pt-16">
          <header className="mb-10 pb-8">
            <h1 className="max-w-[18ch] font-banner text-[clamp(2.2rem,4.6vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.01em] text-crema">
              Todo el catálogo
            </h1>
            <p className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-crema/70">
              Conjuntos, bodys y lencería de encaje. Envío discreto a toda
              Colombia.
            </p>
          </header>

          {/* Barra de búsqueda (toolbar tipo boutique). Sin selector de orden:
              el usuario lo retiró; el parámetro `sort` de la URL se sigue
              respetando (lo usan los enlaces del home). */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              updateParam("q", searchInput.trim());
            }}
            className="mb-6 flex w-full max-w-lg gap-2"
          >
            <label htmlFor="buscar" className="sr-only">
              Buscar productos
            </label>
            <input
              id="buscar"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar: encaje, seda, body…"
              className="min-h-12 w-full border border-crema/25 bg-transparent px-4 text-crema placeholder:text-crema/40 focus-visible:border-crema/60"
            />
            <button
              type="submit"
              className="min-h-12 bg-crema px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-tinta transition-colors hover:bg-acento-claro"
            >
              Buscar
            </button>
          </form>

          {/* Filtro por categoría: enlaces estilo navbar (sin chips) */}
          <div
            role="group"
            aria-label="Filtrar por categoría"
            className="scroll-sutil -mx-4 flex gap-x-6 overflow-x-auto px-4 pb-2"
          >
            <button
              onClick={() => updateParam("category", null)}
              aria-pressed={category === ""}
              className={`shrink-0 ${estiloNavLinkOscuro(category === "" ? "activo" : "inactivo")}`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => updateParam("category", c.slug)}
                aria-pressed={category === c.slug}
                className={`shrink-0 ${estiloNavLinkOscuro(category === c.slug ? "activo" : "inactivo")}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Grilla en crema ---------- */}
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-20">
        {/* Resultados */}
        {error ? (
          <ErrorState message={error} onRetry={() => updateParam("page", null)} />
        ) : data === null ? (
          <Spinner label="Cargando productos…" />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className="size-8 stroke-[1.5]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path strokeLinecap="round" d="m16 16 4 4" />
              </svg>
            }
            title="Sin resultados"
            description={
              q
                ? `No encontramos productos para “${q}”. Prueba con otra palabra o revisa todas las categorías.`
                : "No hay productos en esta categoría todavía."
            }
            action={
              <button
                onClick={() => {
                  setSearchInput("");
                  setParams(new URLSearchParams());
                }}
                className="inline-flex min-h-11 items-center border-b border-tinta/30 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-tinta transition-colors hover:border-tinta hover:text-acento"
              >
                Ver todo el catálogo
              </button>
            }
          />
        ) : (
          <>
            <p
              className="mb-5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-tibio"
              role="status"
            >
              {data.total} {data.total === 1 ? "producto" : "productos"}
              {q && <> para “{q}”</>}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {data.items.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>

            {/* Paginación */}
            {data.totalPages > 1 && (
              <nav
                aria-label="Paginación"
                className="mt-14 flex items-center justify-center gap-8 border-t border-tinta/10 pt-8"
              >
                <button
                  onClick={() => updateParam("page", String(page - 1))}
                  disabled={page <= 1}
                  className={estiloNavLink(page <= 1 ? "deshabilitado" : "inactivo")}
                >
                  ← Anterior
                </button>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tibio">
                  Página {data.page} de {data.totalPages}
                </span>
                <button
                  onClick={() => updateParam("page", String(page + 1))}
                  disabled={page >= data.totalPages}
                  className={estiloNavLink(
                    page >= data.totalPages ? "deshabilitado" : "inactivo",
                  )}
                >
                  Siguiente →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

