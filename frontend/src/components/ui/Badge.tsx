import type { ReactNode } from "react";

/** Badge de descuento: etiqueta negra sólida (skill Nocturna). */
export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center  bg-tinta px-2.5 py-1 text-[11px] font-semibold tracking-wide text-crema">
      −{percent}%
    </span>
  );
}

/** Etiqueta de estado (pedido, stock). tono controlable. */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-tibio/10 text-tibio",
    success: "bg-tinta/10 text-tinta",
    warning: "bg-acento-fondo text-vino",
    danger: "bg-vino/10 text-vino",
    info: "bg-tinta/10 text-tinta",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1  px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * Título de sección editorial: serif + hairline que llena el resto de la
 * línea (recursos de revista de moda) y acción opcional al final.
 */
export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-center gap-5">
      <h2 className="font-display text-2xl font-medium text-carbon sm:text-[1.95rem]">
        {title}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-tinta/15" />
      {action && <span className="shrink-0">{action}</span>}
    </div>
  );
}
