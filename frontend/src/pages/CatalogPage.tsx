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
import { estiloNavLink } from "../components/ui/navLink";

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="etiqueta mb-2">Colección completa</p>
        <h1 className="font-display text-3xl font-semibold text-carbon sm:text-4xl">
          Todo el catálogo
        </h1>
        <p className="mt-2 text-tibio">
          Conjuntos, bodys, lencería de encaje y más. Envío discreto a toda Colombia.
        </p>
      </header>

      {/* Barra de búsqueda + orden (toolbar tipo boutique) */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            updateParam("q", searchInput.trim());
          }}
          className="flex w-full max-w-lg gap-2"
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
            className="min-h-12 w-full border border-tibio/30 bg-white px-4 text-carbon placeholder:text-tibio/60"
          />
          <button
            type="submit"
            className="min-h-12 bg-tinta px-5 text-xs font-semibold uppercase tracking-[0.15em] text-crema transition-colors hover:bg-tinta-suave"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2">
          <label htmlFor="orden" className="sr-only">
            Ordenar por
          </label>
          <select
            id="orden"
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value || null)}
            className="min-h-12 border border-tibio/30 bg-white px-4 pr-9 text-sm font-semibold text-carbon transition-colors hover:border-tinta"
          >
            <option value="">Más recientes</option>
            <option value="featured">Destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="rating">Mejor valorados</option>
          </select>
        </div>
      </div>

      {/* Filtro por categoría: enlaces estilo navbar (sin chips con relleno) */}
      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="scroll-sutil -mx-4 mb-8 flex gap-x-6 overflow-x-auto px-4 pb-2"
      >
        <button
          onClick={() => updateParam("category", null)}
          aria-pressed={category === ""}
          className={`shrink-0 ${estiloNavLink(category === "" ? "activo" : "inactivo")}`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => updateParam("category", c.slug)}
            aria-pressed={category === c.slug}
            className={`shrink-0 ${estiloNavLink(category === c.slug ? "activo" : "inactivo")}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {error ? (
        <ErrorState message={error} onRetry={() => updateParam("page", null)} />
      ) : data === null ? (
        <Spinner label="Cargando productos…" />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={
            <svg className="size-8 stroke-[1.5] text-tibio/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
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
          className="min-h-11 bg-tinta px-5 text-xs font-semibold uppercase tracking-[0.15em] text-crema transition-colors hover:bg-tinta-suave"
            >
              Ver todo el catálogo
            </button>
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-tibio" role="status">
            {data.total} {data.total === 1 ? "producto" : "productos"}
            {q && <> para “{q}”</>}
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
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
              className="mt-10 flex items-center justify-center gap-3"
            >
              <button
                onClick={() => updateParam("page", String(page - 1))}
                disabled={page <= 1}
                className="min-h-11 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-carbon transition-colors hover:bg-nude disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="text-sm text-tibio">
                Página {data.page} de {data.totalPages}
              </span>
              <button
                onClick={() => updateParam("page", String(page + 1))}
                disabled={page >= data.totalPages}
                className="min-h-11 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-carbon transition-colors hover:bg-nude disabled:opacity-40"
              >
                Siguiente →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
