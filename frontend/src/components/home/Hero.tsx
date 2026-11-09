import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "../../lib/useReducedMotion";

const FOTO = "/images/editorial/editorial-06.avif";

/**
 * Portada editorial del home: tipografía a la izquierda y fotografía a sangre
 * en la mitad derecha (en móvil, la foto va arriba). El único movimiento
 * propio es un parallax muy leve de la foto al hacer scroll; con
 * `prefers-reduced-motion` queda completamente quieta.
 */
export function Hero() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = imgRef.current;
    if (!el || reduced) {
      // Sin movimiento: limpia cualquier transform de una preferencia previa.
      if (el) el.style.transform = "";
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const nodo = imgRef.current;
      if (!nodo) return;
      // Solo mientras la portada está a la vista (evita trabajo inútil).
      const y = Math.max(0, Math.min(window.scrollY, window.innerHeight));
      nodo.style.transform = `translate3d(0, ${(y * 0.08).toFixed(2)}px, 0) scale(1.12)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section
      aria-labelledby="portada-titulo"
      className="relative isolate overflow-hidden border-b border-crema/10 bg-noir text-crema"
    >
      {/* Mitad derecha: foto a sangre (escritorio) */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-[52%] overflow-hidden lg:block"
      >
        <img
          ref={imgRef}
          src={FOTO}
          alt=""
          className="size-full object-cover object-[50%_28%] will-change-transform"
        />
        {/* Fundido hacia el texto: el negro es capa de legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-noir/70 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-6xl lg:min-h-[calc(100svh-7.25rem)] lg:grid-cols-2">
        {/* Foto en móvil (la misma imagen, decorativa aquí: arriba ya tiene alt) */}
        <div className="relative h-[52svh] min-h-[320px] overflow-hidden lg:hidden">
          <img
            src={FOTO}
            alt="Body negro de encaje visto de espaldas junto a unas cortinas"
            className="size-full object-cover object-[50%_28%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/15 to-noir/25" />
        </div>

        <div className="flex flex-col justify-center px-4 pb-16 pt-10 sm:px-6 lg:py-24 lg:pl-0">
          <h1
            id="portada-titulo"
            className="max-w-[13ch] font-banner text-[clamp(2.7rem,5.4vw,4.6rem)] font-medium leading-[0.95] tracking-[-0.02em] text-crema"
          >
            Lo íntimo,{" "}
            <br />
            <span className="italic text-acento-claro">bien hecho.</span>
          </h1>

          <p className="mt-7 max-w-sm text-[1.02rem] leading-relaxed text-crema/75">
            Lencería de mujer en encaje, seda y tul. Piezas para sentirte bien
            cuando nadie mira — y cuando sí.
          </p>

          <div className="mt-9">
            <Link
              to="/catalogo"
              className="inline-flex min-h-12 items-center bg-crema px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-tinta transition-colors hover:bg-acento-claro focus-visible:outline-crema"
            >
              Ver la colección
            </Link>
          </div>

          <p className="mt-12 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-crema/60">
            <span aria-hidden="true" className="h-px w-8 bg-crema/30" />
            Envío discreto a toda Colombia
          </p>
        </div>
      </div>
    </section>
  );
}
