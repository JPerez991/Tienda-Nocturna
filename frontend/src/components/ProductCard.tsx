import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../lib/types";
import { Price } from "./ui/Price";
import { Rating } from "./ui/Rating";

/**
 * Tarjeta de producto (presentacional) — estilo editorial sin caja:
 * imagen 4:5 rectangular (sin arco — decisión de marca) con zoom sutil y
 * segunda foto en hover si existe; etiqueta en versalitas, nombre en
 * Playfair con subrayado en hover, precio en Playfair.
 * Entrada animada al hacer scroll (fade + slide-up, respeta
 * prefers-reduced-motion). El "agregar al carrito" vive en el detalle.
 */
export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const segunda = product.images[1];

  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(
    () =>
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true,
  );

  // Observa la entrada en pantalla; si no hay IO o el usuario reduce
  // movimiento, la tarjeta queda visible desde el inicio (estado inicial).
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`group relative flex h-full flex-col transition-[opacity,transform] duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      <Link
        to={`/producto/${product.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
        aria-label={`Ver ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-nude">
          {image ? (
            <>
              <img
                src={image.url}
                alt={image.alt || product.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {segunda && (
                <img
                  src={segunda.url}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div
              aria-hidden="true"
              className="flex size-full items-center justify-center bg-nude"
            >
              <svg
                className="size-10 stroke-[1.5] text-tibio/70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5a2 2 0 1 0-2-2M12 7.5v2L4.5 15.8c-.6.5-.3 1.4.4 1.4h14.2c.7 0 1-.9.4-1.4L12 9.5"
                />
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        {product.category && (
          <span className="etiqueta">{product.category.name}</span>
        )}
        <h3 className="font-display text-base font-medium leading-snug text-carbon">
          <Link
            to={`/producto/${product.slug}`}
            className="transition-colors hover:text-tinta hover:underline hover:underline-offset-4"
          >
            {product.name}
          </Link>
        </h3>

        {product.rating !== undefined && (
          <Rating rating={product.rating} reviewCount={product.reviewCount} />
        )}

        <div className="mt-auto pt-1">
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
          />
        </div>
      </div>
    </article>
  );
}
