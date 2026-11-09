import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { progresoScroll } from "../../lib/scroll";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { SectionHead } from "./SectionHead";

type Foto = { src: string; alt: string; caption: string };

const FOTOS: Foto[] = [
  {
    src: "/images/editorial/editorial-01.avif",
    alt: "Conjunto de encaje blanco con medias",
    caption: "Encaje blanco",
  },
  {
    src: "/images/editorial/editorial-02.avif",
    alt: "Detalle de encaje en tono nude",
    caption: "Detalle nude",
  },
  {
    src: "/images/editorial/editorial-03.avif",
    alt: "Conjunto de encaje crema recostado",
    caption: "Crema",
  },
  {
    src: "/images/editorial/editorial-04.avif",
    alt: "Detalle de encaje negro con lazo rojo",
    caption: "Negro con lazo",
  },
  {
    src: "/images/editorial/editorial-05.avif",
    alt: "Body negro de encaje junto a una ventana",
    caption: "Body negro",
  },
];

const accion = (
  <Link
    to="/catalogo"
    className="inline-flex min-h-11 items-center border-b border-crema/30 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/70 transition-colors hover:border-crema hover:text-crema"
  >
    Ver todo
  </Link>
);

/**
 * Galería editorial: en escritorio queda fija (sticky) y avanza en horizontal
 * con el scroll de la página — el único momento "coreografiado" del home; en
 * móvil es un carril nativo con snap. Con `prefers-reduced-motion` se
 * sustituye por una rejilla estática: nunca hay movimiento obligado.
 */
export function GalleryScroll() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const avance = progresoScroll(
        section.getBoundingClientRect().top,
        section.offsetHeight,
        window.innerHeight,
      );
      const recorrido = Math.max(0, track.scrollWidth - viewport.clientWidth);
      track.style.transform = `translate3d(${-(avance * recorrido).toFixed(2)}px, 0, 0)`;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${avance.toFixed(4)})`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <>
      {/* ---------- Escritorio ---------- */}
      {reduced ? (
        <section
          aria-labelledby="galeria-titulo-estatica"
          className="hidden border-t border-crema/10 bg-noir md:block"
        >
          <div className="mx-auto max-w-6xl px-4 py-20">
            <SectionHead
              id="galeria-titulo-estatica"
              title="La colección, de cerca"
              action={accion}
            />
            <ul className="grid grid-cols-3 gap-5">
              {FOTOS.map((foto) => (
                <li key={foto.src}>
                  <img
                    src={foto.src}
                    alt={foto.alt}
                    loading="lazy"
                    className="aspect-[3/4] w-full bg-tinta-suave object-cover"
                  />
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/60">
                    {foto.caption}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section
          ref={sectionRef}
          aria-labelledby="galeria-titulo"
          className="relative hidden border-t border-crema/10 bg-noir md:block md:h-[240vh]"
        >
          <div className="sticky top-20 flex h-[calc(100svh-5rem)] flex-col overflow-hidden">
            <div className="mx-auto w-full max-w-6xl px-4 pt-10">
              <SectionHead
                id="galeria-titulo"
                title="La colección, de cerca"
                action={accion}
              />
              <p className="max-w-md text-sm leading-relaxed text-crema/60">
                Encaje, tul y seda en cinco piezas. El scroll las recorre.
              </p>
            </div>

            <div ref={viewportRef} className="relative mt-4 flex-1 overflow-hidden">
              <div
                ref={trackRef}
                className="absolute bottom-10 left-0 flex items-end gap-5 px-4 will-change-transform"
              >
                <div className="w-[clamp(200px,24vw,320px)] shrink-0 pb-1">
                  <p className="font-banner text-[clamp(1.5rem,2.4vw,2.1rem)] italic leading-[1.15] text-acento-claro">
                    Cinco piezas,{" "}
                    <br />
                    una misma idea:{" "}
                    <br />
                    sentirse bien.
                  </p>
                  <p className="mt-5 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-crema/50">
                    <span aria-hidden="true" className="h-px w-6 bg-crema/30" />
                    Sigue bajando
                  </p>
                </div>

                {FOTOS.map((foto) => (
                  <figure key={foto.src} className="shrink-0">
                    <div className="h-[clamp(240px,54vh,520px)] overflow-hidden bg-tinta-suave">
                      <img
                        src={foto.src}
                        alt={foto.alt}
                        className="h-full w-auto object-cover"
                        decoding="async"
                      />
                    </div>
                    <figcaption className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/60">
                      {foto.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>

              {/* Progreso de la galería (decorativo: el orden lo da el DOM) */}
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-10">
                <div className="mx-auto flex h-full max-w-6xl items-center gap-4 px-4">
                  <div className="h-px flex-1 bg-crema/15">
                    <span
                      ref={barRef}
                      className="block h-px origin-left bg-acento-claro"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-crema/45">
                    Galería
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Móvil: carril nativo con snap ---------- */}
      <section
        aria-labelledby="galeria-titulo-movil"
        className="border-t border-crema/10 bg-noir py-16 md:hidden"
      >
        <div className="px-4">
          <SectionHead
            id="galeria-titulo-movil"
            title="La colección, de cerca"
            action={accion}
          />
        </div>
        <div className="scroll-sutil mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
          {FOTOS.map((foto) => (
            <figure
              key={foto.src}
              className="w-[72vw] max-w-[320px] shrink-0 snap-start"
            >
              <img
                src={foto.src}
                alt={foto.alt}
                loading="lazy"
                className="aspect-[3/4] w-full bg-tinta-suave object-cover"
              />
              <figcaption className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/60">
                {foto.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
