import type { ReactNode } from "react";

/**
 * Iconografía de confianza (trazo 1.5, sin emojis — skill ui-design).
 * Un solo set de señales para toda la tienda: envío discreto · pago seguro ·
 * asesoría de talla (máx. 3 — skill tienda-profesional).
 */

type IconoProps = { className?: string };

const CLASE_BASE = "size-5 shrink-0 stroke-[1.5]";

export function IconEnvio({ className = CLASE_BASE }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h11v9H3zM14 10.5h3.2l2.8 3v3h-6" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export function IconSeguro({ className = CLASE_BASE }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 5.5 6v5c0 4 2.7 7.3 6.5 8.5 3.8-1.2 6.5-4.5 6.5-8.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.3 12 1.9 1.9 3.5-3.6" />
    </svg>
  );
}

export function IconAsesoria({ className = CLASE_BASE }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V16A2.5 2.5 0 0 1 4 13.5z" />
    </svg>
  );
}

/** Franja de confianza del home (fondo nude, 3 señales reales). */
export function TrustFranja() {
  const items = [
    { Icon: IconEnvio, title: "Envío discreto", desc: "Empaque neutro, sin logotipos." },
    { Icon: IconSeguro, title: "Pago seguro", desc: "Wompi procesa tu pago cifrado." },
    { Icon: IconAsesoria, title: "Asesoría de talla", desc: "Te ayudamos a elegir bien." },
  ];
  return (
    <>
      {items.map(({ Icon, title, desc }) => (
        <div key={title} className="flex items-start gap-4">
          <span className="mt-0.5 text-tinta">
            <Icon />
          </span>
          <div>
            <p className="font-semibold text-carbon">{title}</p>
            <p className="text-sm text-tibio">{desc}</p>
          </div>
        </div>
      ))}
    </>
  );
}

/** Fila compacta junto al ATC de la ficha de producto (2–3 señales). */
export function TrustInline({ className = "" }: { className?: string }) {
  const items: Array<[ReactNode, string]> = [
    [<IconEnvio key="e" className="size-4 shrink-0 stroke-[1.5]" />, "Envío discreto"],
    [<IconSeguro key="s" className="size-4 shrink-0 stroke-[1.5]" />, "Pago seguro con Wompi"],
    [<IconAsesoria key="a" className="size-4 shrink-0 stroke-[1.5]" />, "Asesoría de talla"],
  ];
  return (
    <ul
      role="list"
      className={`flex flex-wrap gap-x-5 gap-y-2 text-xs text-tibio ${className}`}
    >
      {items.map(([icon, label]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className="text-tinta" aria-hidden="true">
            {icon}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
