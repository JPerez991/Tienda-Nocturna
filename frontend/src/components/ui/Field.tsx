import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  id: string;
}

const base =
  "w-full min-h-12  border bg-white px-4 text-carbon transition-colors placeholder:text-tibio/60";

function fieldClass(error?: string) {
  return `${base} ${error ? "border-vino focus-visible:outline-vino" : "border-tibio/30 focus-visible:outline-acento"}`;
}

/** Input con label, hint y error (accesible: label ligado por htmlFor). */
export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...rest
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-carbon">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={fieldClass(error)}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-tibio">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-vino">
          {error}
        </p>
      )}
    </div>
  );
}

/** Select con label y error. */
export function Select({
  label,
  error,
  id,
  className = "",
  children,
  ...rest
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-carbon">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        className={fieldClass(error)}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs font-medium text-vino">{error}</p>
      )}
    </div>
  );
}
