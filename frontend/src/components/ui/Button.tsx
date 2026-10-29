import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  // CTA primario: tinta sólida, plano y de esquinas rectas (estilo editorial)
  primary: "bg-tinta text-crema hover:bg-tinta-suave disabled:bg-tinta/50",
  // Secundario: blanco sólido, SIN borde (regla de marcos); hover nude
  secondary: "bg-white text-tinta hover:bg-nude disabled:opacity-60",
  // Ghost: transparente, SIN borde; el hover tonal da el feedback
  ghost: "bg-transparent text-tinta hover:bg-tinta/5",
  danger:
    "bg-vino text-crema hover:bg-vino-claro disabled:bg-vino/50",
};

const sizes: Record<Size, string> = {
  // Versalitas finas; targets táctiles ≥ 44px por min-h
  sm: "min-h-11 px-4 text-[11px]",
  md: "min-h-12 px-6 text-xs",
  lg: "min-h-14 px-8 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 uppercase tracking-[0.15em] font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span aria-hidden="true" className="carga-puntos">
          <span />
          <span />
          <span />
        </span>
      )}
      {children}
    </button>
  );
}
