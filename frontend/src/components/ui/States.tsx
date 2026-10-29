import type { ReactNode } from "react";

/** Spinner (carga): tres cuadros que pulsan. Decorativo: el texto accesible
 *  lo aporta siempre el padre (role="status" queda aquí). */
export function Spinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-12">
      <span aria-hidden="true" className="carga-puntos text-tinta">
        <span />
        <span />
        <span />
      </span>
      <span className="text-sm text-tibio">{label}</span>
    </div>
  );
}

/** Estado vacío / sin resultados. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3  border border-dashed border-tibio/40 bg-white/70 px-6 py-14 text-center">
      {icon && (
        <span aria-hidden="true" className="text-3xl text-tibio">
          {icon}
        </span>
      )}
      <h3 className="font-display text-xl font-semibold text-carbon">{title}</h3>
      {description && <p className="max-w-sm text-tibio">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Mensaje de error con reintento opcional. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3  border border-vino/20 bg-vino/5 px-6 py-12 text-center"
    >
      <svg
        aria-hidden="true"
        className="size-8 stroke-[1.5] text-vino"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="M12 8v4.5M12 16h.01" />
      </svg>
      <h3 className="font-display text-xl font-semibold text-vino">
        Algo salió mal
      </h3>
      <p className="max-w-sm text-tibio">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 min-h-11 bg-vino/10 px-5 text-xs font-semibold uppercase tracking-[0.15em] text-vino transition-colors hover:bg-vino/20"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
