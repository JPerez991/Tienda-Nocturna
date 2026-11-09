import { Link } from "react-router-dom";
import { whatsappLink } from "../../config";

export type InfoSeccion = {
  titulo: string;
  parrafos?: string[];
  items?: string[];
};

export type InfoContenido = {
  titulo: string;
  intro: string;
  secciones: InfoSeccion[];
  /** Mensaje precargado del WhatsApp al final de la página. */
  mensajeWhatsApp: string;
};

/**
 * Plantilla de las páginas informativas de la tienda (envíos, garantía,
 * pagos...). Contenido editorial: titular Playfair, secciones separadas por
 * hairlines y cierre con contacto por WhatsApp.
 */
export function InfoPage({ titulo, intro, secciones, mensajeWhatsApp }: InfoContenido) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav
        aria-label="Ruta de navegación"
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tibio"
      >
        <Link to="/" className="transition-colors hover:text-tinta">
          Inicio
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-carbon">{titulo}</span>
      </nav>

      <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
        {titulo}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-tibio">{intro}</p>

      <div className="mt-10 space-y-10">
        {secciones.map((s) => (
          <section key={s.titulo} className="border-t border-tinta/10 pt-6">
            <h2 className="font-display text-xl font-semibold text-tinta">{s.titulo}</h2>
            {s.parrafos?.map((p) => (
              <p key={p} className="mt-3 text-base leading-relaxed text-carbon">
                {p}
              </p>
            ))}
            {s.items && (
              <ul className="mt-3 space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-relaxed text-carbon">
                    <span aria-hidden="true" className="mt-[0.7rem] h-px w-3 shrink-0 bg-acento" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Cierre: dudas por WhatsApp + vuelta al catálogo */}
      <div className="mt-12 border-t border-tinta/10 pt-6">
        <p className="text-tibio">¿Tienes dudas sobre este tema?</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1">
          <a
            href={whatsappLink(mensajeWhatsApp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-display text-lg text-tinta underline decoration-1 underline-offset-8 transition-colors hover:text-acento"
          >
            Escríbenos por WhatsApp
          </a>
          <Link
            to="/catalogo"
            className="inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.18em] text-tibio transition-colors hover:text-tinta"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
