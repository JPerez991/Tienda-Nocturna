import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Category, Product } from "../lib/types";
import { ProductCard } from "../components/ProductCard";
import { ErrorState, Spinner } from "../components/ui/States";
import { TrustFranja } from "../components/ui/Trust";
import { estiloNavLinkOscuro } from "../components/ui/navLink";
import { Hero } from "../components/home/Hero";
import { InfoBand } from "../components/home/InfoBand";
import { SectionHead } from "../components/home/SectionHead";
import { Manifesto } from "../components/home/Manifesto";
import { GalleryScroll } from "../components/home/GalleryScroll";
import { Marquee } from "../components/home/Marquee";
import { LookbookClose } from "../components/home/LookbookClose";

/**
 * Vitrina: contenedor de datos (categorías + destacados) y composición de la
 * portada editorial oscura. La presentación vive en `components/home/*`;
 * el resto de páginas mantiene el tema claro.
 */
export function HomePage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [destacados, setDestacados] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    // Cargamos en paralelo; cada petición puede fallar de forma independiente.
    void api
      .categories()
      .then(setCategories)
      .catch(() => setCategories([]));
    void api
      // Selección de la casa: las piezas más elaboradas (mayor valor) primero.
      // El "featured" del contrato es por valoración y con las reseñas de
      // demostración empatadas devuelve un orden arbitrario que rompía la
      // secuencia visual del home.
      .products({ limit: 8, sort: "price-desc" })
      .then((r) => setDestacados(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Error desconocido"));
  };

  useEffect(load, []);

  return (
    <div data-tema="oscuro" className="bg-noir text-crema">
      {/* ---------- Índice de colecciones: hairline bajo el header ---------- */}
      <nav
        aria-label="Colecciones"
        className="scroll-sutil overflow-x-auto border-b border-crema/10 bg-tinta"
      >
        <div className="mx-auto flex min-h-11 w-max items-center gap-x-6 px-4">
          {categories?.map((c) => (
            <Link
              key={c.id}
              to={`/catalogo?category=${encodeURIComponent(c.slug)}`}
              className={estiloNavLinkOscuro("inactivo")}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* ---------- Portada editorial ---------- */}
      <Hero />

      {/* ---------- Banner blanco de información (petición del usuario) ---------- */}
      <InfoBand />

      {/* ---------- Destacados (merchandising) ---------- */}
      <section
        aria-labelledby="seleccion"
        className="mx-auto max-w-6xl px-4 pt-20 sm:pt-24"
      >
        <SectionHead
          id="seleccion"
          title="La selección"
          action={
            <Link
              to="/catalogo"
              className="inline-flex min-h-11 items-center border-b border-crema/30 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/70 transition-colors hover:border-crema hover:text-crema"
            >
              Ver todo
            </Link>
          }
        />
        {error ? (
          <ErrorState message={error} onRetry={load} tono="oscuro" />
        ) : destacados === null ? (
          <Spinner label="Cargando productos…" tono="oscuro" />
        ) : destacados.length === 0 ? (
          <p className="text-crema/70">Muy pronto verás aquí la selección.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {destacados.map((p, i) => (
              <li key={p.id} className={i >= 4 ? "hidden lg:block" : undefined}>
                <ProductCard product={p} tono="oscuro" />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Relato de marca ---------- */}
      <Manifesto />

      {/* ---------- Galería con scroll horizontal ---------- */}
      <GalleryScroll />

      {/* ---------- Beneficios en movimiento ---------- */}
      <Marquee />

      {/* ---------- Cierre editorial ---------- */}
      <LookbookClose />

      {/* ---------- Confianza ---------- */}
      <section aria-label="Beneficios de la tienda" className="border-t border-crema/10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
          <TrustFranja tono="oscuro" />
        </div>
      </section>
    </div>
  );
}
