import { useReducedMotion } from "../../lib/useReducedMotion";

const BENEFICIOS = [
  "Envío discreto a toda Colombia",
  "Pago seguro con Wompi",
  "Asesoría de talla por WhatsApp",
  "Empaque neutro, sin logos",
];

/**
 * Banda en movimiento con los beneficios de compra. Es decorativa: el texto
 * real va en `sr-only` para lectores de pantalla. Con movimiento reducido se
 * convierte en una línea estática centrada.
 */
export function Marquee() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="border-y border-crema/10 bg-tinta px-4 py-3.5">
        <p className="mx-auto max-w-4xl text-center text-[10.5px] font-semibold uppercase leading-relaxed tracking-[0.2em] text-crema/60">
          {BENEFICIOS.join("  ·  ")}
        </p>
      </div>
    );
  }

  return (
    <div className="marquee-mask overflow-hidden border-y border-crema/10 bg-tinta py-4">
      <p className="sr-only">{BENEFICIOS.join(". ")}.</p>
      <div aria-hidden="true" className="marquee-track flex w-max">
        {[0, 1].map((copia) => (
          <div
            key={copia}
            className="flex shrink-0 items-center gap-6 pr-6 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-crema/65"
          >
            {BENEFICIOS.map((texto) => (
              <span key={texto} className="flex items-center gap-6 whitespace-nowrap">
                {texto}
                <span className="size-1 shrink-0 bg-acento-claro/50" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
