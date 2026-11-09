import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { ProductDetail, ProductVariant } from "../lib/types";
import { formatCOP } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Price } from "../components/ui/Price";
import { Rating } from "../components/ui/Rating";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ErrorState, Spinner } from "../components/ui/States";
import { TrustInline } from "../components/ui/Trust";
import { estiloNavLink } from "../components/ui/navLink";

/**
 * Ficha de producto — superficie **crema**: el negro se queda en el home, el
 * catálogo y el chrome (header/footer). Aquí la pieza se examina en claro,
 * como en una mesa de trabajo.
 */
export function ProductPage() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const { addItem, refresh: refreshCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProductVariant | null>(null);
  const [imageIdx, setImageIdx] = useState(0);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [guiaTalla, setGuiaTalla] = useState(false);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setProduct(null);
    setSelected(null);
    setImageIdx(0);
    api
      .product(slug)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        // Preseleccionamos la primera variante con stock.
        setSelected(p.variants.find((v) => v.stock > 0) ?? p.variants[0] ?? null);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error desconocido");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Sticky ATC móvil: la barra vive siempre que el CTA principal no esté a la
  // vista. Como la foto de ficha es 3:4 a ancho completo, en la primera
  // pantalla el CTA queda por DEBAJO del pliegue: la barra garantiza que el
  // precio y el "Agregar" estén disponibles desde el primer instante.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  async function handleAdd() {
    if (!selected || !user) return;
    setAdding(true);
    setFeedback(null);
    try {
      await addItem(selected.id, 1);
      await refreshCart();
      setFeedback(`✓ “${product?.name}” se agregó a tu carrito.`);
    } catch (e) {
      // 400: stock insuficiente según contrato.
      setFeedback(
        e instanceof ApiError
          ? e.message
          : "No pudimos agregar el producto. Intenta de nuevo.",
      );
    } finally {
      setAdding(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        {error.includes("404") || error.toLowerCase().includes("not found") ? (
          <ErrorState message="Este producto no existe o ya no está disponible." />
        ) : (
          <ErrorState message={error} />
        )}
        <p className="mt-6 text-center">
          <Link
            to="/catalogo"
            className="font-semibold text-tinta underline-offset-4 hover:text-acento hover:underline"
          >
            ← Volver al catálogo
          </Link>
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Spinner label="Cargando producto…" />
      </div>
    );
  }

  const image = product.images[imageIdx];

  return (
    <div className="bg-crema text-carbon">
      <div
        className={`mx-auto max-w-6xl px-4 pt-8 pb-16 md:pb-20 ${sticky ? "pb-28" : ""}`}
      >
        {/* Migas de pan */}
        <nav
          aria-label="Ruta de navegación"
          className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-tibio"
        >
          <Link
            to="/"
            className="hidden transition-colors hover:text-tinta sm:inline"
          >
            Inicio
          </Link>
          <span aria-hidden="true" className="hidden sm:inline">
            /
          </span>
          <Link to="/catalogo" className="transition-colors hover:text-tinta">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/catalogo?category=${encodeURIComponent(product.category.slug)}`}
            className="hidden transition-colors hover:text-tinta sm:inline"
          >
            {product.category.name}
          </Link>
          <span aria-hidden="true" className="hidden sm:inline">
            /
          </span>
          <span aria-current="page" className="text-carbon">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
          {/* ---------- Galería ----------
              Imagen SIEMPRE completa (ratio intrínseco, sin recorte) y NUNCA
              ampliada más allá de su tamaño natural: los orígenes miden
              407–652 px, por eso el contenedor se limita al ancho mínimo
              (407 px) y el <img> usa h-auto (ni object-cover ni aspect
              fijo). Con fotos de mayor resolución en public/images el mismo
              cap las reescala hacia abajo → sigue viéndose nítida. */}
          <div>
            <div className="mx-auto w-full max-w-[407px] lg:mx-0">
              {image ? (
                <img
                  src={image.url}
                  alt={image.alt || product.name}
                  className="block h-auto w-full"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex aspect-[4/5] items-center justify-center bg-nude sm:aspect-square"
                >
                  <svg
                    className="size-16 stroke-[1.5] text-tibio/60"
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
            {product.images.length > 1 && (
              <ul className="mt-3 flex gap-2" role="list">
                {product.images.map((img, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setImageIdx(i)}
                      aria-label={`Ver imagen ${i + 1} de ${product.images.length}`}
                      aria-current={i === imageIdx}
                      className={`size-16 overflow-hidden transition-opacity ${
                        i === imageIdx
                          ? "opacity-100 outline outline-1 outline-tinta/40 outline-offset-2"
                          : "opacity-45 hover:opacity-75"
                      }`}
                    >
                      <img src={img.url} alt="" className="size-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ---------- Info y compra ---------- */}
          <div className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-acento">
                {product.category.name}
              </span>
              {selected && selected.stock === 0 && (
                <Badge tone="danger">Agotado</Badge>
              )}
              {selected && selected.stock > 0 && selected.stock <= 5 && (
                <Badge tone="warning">¡Quedan {selected.stock}!</Badge>
              )}
            </div>

            <h1 className="mt-4 max-w-[20ch] font-banner text-[clamp(1.9rem,3.6vw,2.7rem)] font-medium leading-[1.06] tracking-[-0.01em] text-tinta">
              {product.name}
            </h1>

            {product.rating !== undefined && (
              <div className="mt-4">
                <Rating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              </div>
            )}

            <div className="mt-5">
              <Price
                price={selected ? selected.price : product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
              />
            </div>

            {product.description && (
              <p className="mt-6 max-w-lg leading-relaxed text-carbon/90">
                {product.description}
              </p>
            )}

            {/* Selector de variante */}
            {product.variants.length > 0 && (
              <fieldset className="mt-8 border-t border-tinta/10 pt-7">
                <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-tibio">
                  Elige una opción
                </legend>
                {/* Tallas: enlaces estilo navbar — activo subrayado, agotado
                    atenuado sin subrayado (sin masas ni cajas) */}
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {product.variants.map((v) => {
                    const isSelected = selected?.id === v.id;
                    const out = v.stock === 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelected(v)}
                        disabled={out}
                        aria-pressed={isSelected}
                        className={estiloNavLink(
                          out
                            ? "deshabilitado"
                            : isSelected
                              ? "activo"
                              : "inactivo",
                        )}
                        title={
                          out ? "Sin stock" : `${v.name} · ${formatCOP(v.price)}`
                        }
                      >
                        {v.name}
                        {out && " (agotado)"}
                      </button>
                    );
                  })}
                </div>

                {/* Guía de talla contextual (patrón Spanx): disclosure, no
                    pestaña. Solo afirmaciones respaldadas; nunca inventar
                    medidas. */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setGuiaTalla((v) => !v)}
                    aria-expanded={guiaTalla}
                    aria-controls="guia-talla"
                    className="inline-flex min-h-11 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-acento underline-offset-8 transition-colors hover:text-tinta hover:underline"
                  >
                    Guía de tallas
                    <svg
                      aria-hidden="true"
                      className={`size-3.5 stroke-[1.5] transition-transform ${guiaTalla ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>
                  <div
                    id="guia-talla"
                    hidden={!guiaTalla}
                    className="mt-2 max-w-md bg-nude px-4 py-3 text-sm leading-relaxed text-carbon"
                  >
                    <ul className="space-y-1" role="list">
                      <li>· Tallaje estándar colombiano.</li>
                      <li>· Si dudas entre dos tallas, elige la mayor.</li>
                      <li>
                        · El nombre de cada variante indica su talla; las
                        medidas pueden variar según la pieza — revisa la
                        descripción.
                      </li>
                    </ul>
                  </div>
                </div>
              </fieldset>
            )}

            {/* CTA: sin sesión el botón sólido lleva a entrar (un botón
                deshabilitado en el punto de venta solo invita a salir). */}
            <div
              ref={ctaRef}
              data-cta="principal"
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              {!user ? (
                <Link
                  to="/login"
                  className="inline-flex min-h-14 items-center justify-center bg-tinta px-8 text-sm font-semibold uppercase tracking-[0.15em] text-crema transition-colors hover:bg-tinta-suave sm:flex-1"
                >
                  Inicia sesión para agregar
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={handleAdd}
                  loading={adding}
                  disabled={!selected || selected.stock === 0}
                  className="sm:flex-1"
                >
                  {selected && selected.stock === 0
                    ? "Agotado"
                    : `Agregar al carrito · ${formatCOP(selected ? selected.price : product.price)}`}
                </Button>
              )}
            </div>

            {!user && (
              <p className="mt-4 text-sm text-tibio">
                Solo necesitamos tu cuenta para guardar el pedido y tus datos
                de envío.
              </p>
            )}

            {feedback && (
              <p
                role="status"
                className={`mt-4 px-4 py-3 text-sm ${
                  feedback.startsWith("✓")
                    ? "bg-tinta/10 text-tinta"
                    : "bg-vino/10 text-vino"
                }`}
              >
                {feedback}
              </p>
            )}

            {/* Señales de confianza junto al ATC (máx. 3 — tienda-profesional) */}
            <TrustInline className="mt-7" />
          </div>
        </div>

        {/* Sticky ATC móvil: precio + agregar, solo cuando el CTA principal
            quedó fuera de pantalla */}
        {sticky && (
          <div
            role="region"
            aria-label="Compra rápida"
            className="fixed inset-x-0 bottom-0 z-30 border-t border-tinta/10 bg-crema/95 px-4 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur md:hidden"
          >
            {/* pr-14: deja libre el espacio del botón flotante de WhatsApp
                (fixed, 48px) para que nunca tape el CTA; pb-3 lo alinea con él. */}
            <div className="mx-auto flex max-w-6xl items-center gap-3 pb-3 pr-14">
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-tinta">
                  {formatCOP(selected ? selected.price : product.price)}
                </p>
                <p className="truncate text-[11px] text-tibio">{product.name}</p>
              </div>
              {!user ? (
                <Link
                  to="/login"
                  className="inline-flex min-h-12 min-w-36 flex-1 items-center justify-center bg-tinta px-4 text-xs font-semibold uppercase tracking-[0.15em] text-crema transition-colors hover:bg-tinta-suave"
                >
                  Entrar
                </Link>
              ) : (
                <Button
                  size="md"
                  onClick={handleAdd}
                  loading={adding}
                  disabled={!selected || selected.stock === 0}
                  className="min-w-36 flex-1"
                >
                  {selected && selected.stock === 0 ? "Agotado" : "Agregar"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
