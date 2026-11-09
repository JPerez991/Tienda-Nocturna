import { formatCOP, discountPercent } from "../../lib/format";

interface PriceProps {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  /** Tono de la superficie donde vive el precio (home oscuro usa "oscuro"). */
  tono?: "claro" | "oscuro";
}

const sizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
} as const;

/** Precio en COP (Playfair) + tachado del precio anterior + badge de descuento. */
export function Price({
  price,
  compareAtPrice,
  size = "md",
  tono = "claro",
}: PriceProps) {
  const percent = discountPercent(price, compareAtPrice);
  const oscuro = tono === "oscuro";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span
        className={`font-display font-semibold ${sizes[size]} ${
          oscuro ? "text-crema" : "text-tinta"
        }`}
        aria-label={`Precio: ${formatCOP(price)}`}
      >
        {formatCOP(price)}
      </span>
      {percent !== null && (
        <>
          <span
            className={`text-sm line-through ${
              oscuro ? "text-crema/60" : "text-tibio"
            }`}
          >
            {formatCOP(compareAtPrice!)}
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-bold ${
              oscuro ? "bg-crema text-tinta" : "bg-acento-fondo text-vino"
            }`}
          >
            −{percent}%
          </span>
        </>
      )}
    </div>
  );
}
