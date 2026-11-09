/**
 * Manifiesto de marca: foto 03 a la izquierda (sticky en escritorio) y el
 * texto a la derecha. Sin marcos ni tarjetas: solo la foto y la tipografía.
 * La imagen "acompaña" el scroll en desktop sin animaciones adicionales.
 */
export function Manifesto() {
  return (
    <section
      aria-labelledby="manifiesto-titulo"
      className="mx-auto max-w-6xl px-4 py-20 sm:py-28"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="aspect-[3/4] w-full max-w-[420px] overflow-hidden bg-tinta-suave">
            <img
              src="/images/editorial/editorial-03.avif"
              alt="Conjunto de encaje crema recostado sobre una superficie clara"
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        </div>

        <div className="lg:py-8">
          <h2
            id="manifiesto-titulo"
            className="max-w-[22ch] font-display text-3xl font-medium leading-[1.12] text-crema sm:text-[2.6rem]"
          >
            La lencería no se ve.{" "}
            <span className="italic text-acento-claro">Se siente.</span>
          </h2>

          <div className="mt-8 max-w-lg space-y-5 text-base leading-relaxed text-crema/70">
            <p>
              Elegimos encaje que no raspa, elásticos que no marcan y copas que
              acompañan el cuerpo real. La pieza más bonita es la que te deja
              olvidarla.
            </p>
            <p>
              Por eso cada referencia llega en una talla clara, con asesoría
              cercana y un empaque que no revela nada. La discreción también es
              parte del diseño.
            </p>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-crema/10 pt-6 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-acento-claro/80">
            <li>Encaje</li>
            <li>Seda</li>
            <li>Tul</li>
            <li>Bordado</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
