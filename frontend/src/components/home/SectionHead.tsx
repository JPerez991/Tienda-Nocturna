import type { ReactNode } from "react";

/**
 * Título de sección sobre superficie oscura: serif + hairline que llena la
 * línea (recurso de revista) y acción opcional al final. Mismo patrón que el
 * `SectionTitle` claro, invertido a crema.
 */
export function SectionHead({
  id,
  title,
  action,
  className = "",
}: {
  id?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-8 flex items-end gap-5 ${className}`}>
      <h2
        id={id}
        className="font-display text-[1.6rem] font-medium leading-tight text-crema sm:text-[1.95rem]"
      >
        {title}
      </h2>
      <span aria-hidden="true" className="mb-2 h-px flex-1 bg-crema/15" />
      {action && <span className="mb-1 shrink-0">{action}</span>}
    </div>
  );
}
