import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Category, Product } from "../lib/types";
import { ProductCard } from "../components/ProductCard";
import { SectionTitle } from "../components/ui/Badge";
import { ErrorState, Spinner } from "../components/ui/States";
import { TrustFranja } from "../components/ui/Trust";
import { estiloNavLink } from "../components/ui/navLink";

export function HomePage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    // Cargamos en paralelo; cada petición puede fallar de forma independiente.
    void api
      .categories()
      .then(setCategories)
      .catch(() => setCategories([]));
    void api
      .products({ limit: 8 })
      .then((r) => setFeatured(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Error desconocido"));
  };

  useEffect(load, []);

  /* Imágenes reales de la API para la banda lookbook (fallback: tinta sólida). */
  const fotos = (featured ?? []).map((p) => p.images[0]?.url).filter(Boolean) as string[];
  const lookImg = fotos[1] ?? null;

  return (
    <>
      {/* ---------- Franja de colecciones: bajo el header, sobre el hero.
          Fondo crema = fondo de página (sin caja visible); altura reservada
          desde el inicio para evitar saltos al cargar las categorías. */}
      <nav aria-label="Colecciones" className="scroll-sutil overflow-x-auto bg-crema">
        <div className="mx-auto flex min-h-11 w-max items-center gap-x-6 px-4">
          {categories?.map((c) => (
            <Link
              key={c.id}
              to={`/catalogo?category=${encodeURIComponent(c.slug)}`}
              className={estiloNavLink("inactivo")}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* ---------- Hero editorial: breve, centrado y SIN CTAs — solo color
          compuesto por capas de la paleta de negros (skill paleta-negros) ---------- */}
      <section className="relative isolate flex min-h-[45vh] items-center overflow-hidden bg-tinta text-crema">
        {/* Capa 1: halo gráfico donde "cae la luz" */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_75%_15%,var(--color-grafito),transparent_55%)]"
        />
        {/* Capa 2: lavado noir desde la base (profundidad) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-noir/90 to-transparent"
        />
        {/* Capa 3: mancha cálida tenue (calidez de marca) */}
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-32 size-[18rem] bg-acento/10 blur-[110px]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 text-center sm:py-16">
          <div aria-hidden="true" className="mx-auto mb-6 h-px w-12 bg-humo/60" />
          <p className="etiqueta text-acento-claro!">Nueva colección · Envío discreto</p>
          <h1 className="mx-auto mt-5 max-w-2xl font-banner text-3xl font-medium leading-[1.1] tracking-tight text-white sm:text-5xl">
            Lencería que se siente{" "}
            <span className="italic text-white">como tú</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* ---------- Destacados ---------- */}
        <section className="mt-20">
          <SectionTitle
            title="Los más deseados"
            action={
              <Link
                to="/catalogo"
                className="border-b border-tinta/30 pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-tinta transition-colors hover:border-tinta hover:text-acento"
              >
                Ver todo
              </Link>
            }
          />
          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : featured === null ? (
            <Spinner label="Cargando productos…" />
          ) : featured.length === 0 ? (
            <p className="text-tibio">Muy pronto verás aquí lo más deseado.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {featured.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ---------- Banda lookbook a sangre (editorial) ---------- */}
      {lookImg && (
        <section
          aria-label="Lookbook Nocturna"
          className="relative isolate mt-20 flex min-h-[24rem] items-center overflow-hidden bg-tinta text-crema"
        >
          <img
            src={lookImg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-top"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-tinta/60" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
            <p className="etiqueta text-acento-claro!">Nocturna</p>
            <blockquote className="mx-auto mt-4 max-w-2xl font-display text-2xl italic leading-snug sm:text-3xl">
              «Seda, encaje y piezas que solo tú sabes que llevas.»
            </blockquote>
            <p className="mt-7">
              <Link
                to="/catalogo"
                className="border-b border-crema/40 pb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-crema transition-colors hover:border-crema"
              >
                Ver la colección
              </Link>
            </p>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4">
        {/* ---------- Franja de confianza ---------- */}
        <section
          aria-label="Beneficios de la tienda"
          className="mt-20 grid gap-6  bg-nude p-8 sm:grid-cols-3"
        >
          <TrustFranja />
        </section>
      </div>
    </>
  );
}
