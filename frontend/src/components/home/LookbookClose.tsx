import { Link } from "react-router-dom";

/**
 * Cierre editorial a sangre: foto 05 con velo de noir para legibilidad y una
 * frase corta + enlace subrayado (no botón sólido, el CTA sólido ya vive en
 * la portada). Solo se lee el titular sobre la imagen, sin párrafos.
 */
export function LookbookClose() {
  return (
    <section
      aria-labelledby="cierre-titulo"
      className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-noir"
    >
      <img
        src="/images/editorial/editorial-05.avif"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-[50%_32%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-noir via-noir/45 to-noir/10"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:pb-20">
        <h2
          id="cierre-titulo"
          className="max-w-2xl text-balance font-display text-3xl font-medium leading-[1.12] text-crema sm:text-[2.6rem]"
        >
          Para las noches que{" "}
          <span className="italic">nadie más ve.</span>
        </h2>
        <p className="mt-5">
          <Link
            to="/catalogo"
            className="inline-flex min-h-11 items-center border-b border-crema/40 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-crema transition-colors hover:border-crema hover:text-acento-claro"
          >
            Ver la colección
          </Link>
        </p>
      </div>
    </section>
  );
}
