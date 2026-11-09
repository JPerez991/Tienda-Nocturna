import { useEffect, useState } from "react";

/** Mensajes pequeños de la franja superior (foco: envíos a toda Colombia). */
const MENSAJES = [
  "Envíos a todo Colombia",
  "Empaque discreto, sin logos",
  "Envío asegurado y con seguimiento",
];

const INTERVALO_MS = 5000;

/**
 * Franja de anuncios sobre el header: mensajes breves en versalitas que
 * rotan con un fundido. Altura fija (sin saltos de layout) y respeta
 * `prefers-reduced-motion` (quedaría fija en el primer mensaje).
 */
export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const reducido =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reducido) return;

    const id = window.setInterval(
      () => setIdx((v) => (v + 1) % MENSAJES.length),
      INTERVALO_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="bg-tinta text-crema">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center px-4">
        <p
          key={idx}
          /* aria-live queda apagado: es un carrusel decorativo de mensajes
             y no debe interrumpir a los lectores de pantalla. */
          className="anuncio text-center text-[10.5px] font-semibold uppercase tracking-[0.22em] text-crema/90"
        >
          {MENSAJES[idx]}
        </p>
      </div>
    </div>
  );
}
