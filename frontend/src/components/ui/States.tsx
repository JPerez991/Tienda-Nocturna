import type { ReactNode } from "react";

/** Spinner (carga): tres cuadros que pulsan. Decorativo: el texto accesible
 *  lo aporta siempre el padre (role="status" queda aquí). */
export function Spinner({
  label = "Cargando…",
  tono = "claro",
}: {
  label?: string;
  tono?: "claro" | "oscuro";
}) {
  const oscuro = tono === "oscuro";
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-12">
      <span
        aria-hidden="true"
        className={`carga-puntos ${oscuro ? "text-acento-claro" : "text-tinta"}`}
      >
        <span />
        <span />
        <span />
      </span>
      <span className={`text-sm ${oscuro ? "text-crema/70" : "text-tibio"}`}>
        {label}
      </span>
    </div>
  );
}

/** Estado vacío / sin resultados. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tono = "claro",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tono?: "claro" | "oscuro";
}) {
  const oscuro = tono === "oscuro";
  // Sin marco: en Nocturna los marcos son solo para campos de formulario.
  // El estado vacío se compone con aire y tipografía, no con una caja.
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      {icon && (
        <span
          aria-hidden="true"
          className={`text-3xl ${oscuro ? "text-crema/40" : "text-tibio"}`}
        >
          {icon}
        </span>
      )}
      <h3
        className={`font-display text-xl font-semibold ${
          oscuro ? "text-crema" : "text-carbon"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p className={`max-w-sm ${oscuro ? "text-crema/70" : "text-tibio"}`}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Mensaje de error con reintento opcional (sin marco: solo tipografía). */
export function ErrorState({
  message,
  onRetry,
  tono = "claro",
}: {
  message: string;
  onRetry?: () => void;
  tono?: "claro" | "oscuro";
}) {
  const oscuro = tono === "oscuro";
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 px-6 py-14 text-center"
    >
      <svg
        aria-hidden="true"
        className={`size-8 stroke-[1.5] ${
          oscuro ? "text-acento-claro" : "text-vino"
        }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="M12 8v4.5M12 16h.01" />
      </svg>
      <h3
        className={`font-display text-xl font-semibold ${
          oscuro ? "text-crema" : "text-vino"
        }`}
      >
        Algo salió mal
      </h3>
      <p className={`max-w-sm ${oscuro ? "text-crema/70" : "text-tibio"}`}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`mt-1 min-h-11 px-5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
            oscuro
              ? "bg-crema/10 text-crema hover:bg-crema/20"
              : "bg-vino/10 text-vino hover:bg-vino/20"
          }`}
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
