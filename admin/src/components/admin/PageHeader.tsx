import type { ReactNode } from "react";

/**
 * Cabecera de cada sección del panel.
 *
 * Da a la pantalla su `h1` (una sola por vista) y coloca al lado el dato de
 * apoyo —normalmente el conteo— y la acción principal. El conteo va con
 * `role="status"` para que se anuncie cuando termina la carga.
 */
export function PageHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-carbon">
          {title}
        </h1>
        {meta && (
          <p role="status" className="mt-1 text-sm text-tibio">
            {meta}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
