import { whatsappLink } from "../../config";

/**
 * Acceso flotante al chat de WhatsApp (esquina inferior derecha).
 *
 * Cuadrado tinta con el glifo a trazo (sin círculos ni sombras: reglas
 * Nocturna). z-[35]: por encima de la barra sticky de compra (z-30) y por
 * debajo del header/drawer (z-40) para no tapar el menú móvil.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatea con nosotros por WhatsApp"
      className="fixed right-4 bottom-[calc(1rem_+_env(safe-area-inset-bottom))] z-[35] inline-flex size-12 items-center justify-center border border-crema/25 bg-tinta text-crema transition-colors hover:border-crema/50 hover:bg-tinta-suave focus-visible:outline-crema"
    >
      {/* Glifo oficial de WhatsApp (Tabler, outline) — trazo 1.5 */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
      >
        <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
        <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
      </svg>
    </a>
  );
}
