import { formatCOP, discountPercent } from "../../lib/format";

interface PriceProps {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
} as const;

/** Precio en COP (Playfair) + tachado del precio anterior + badge de descuento. */
export function Price({ price, compareAtPrice, size = "md" }: PriceProps) {
  const percent = discountPercent(price, compareAtPrice);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span
        className={`font-display font-semibold text-tinta ${sizes[size]}`}
        aria-label={`Precio: ${formatCOP(price)}`}
      >
        {formatCOP(price)}
      </span>
      {percent !== null && (
        <>
          <span className="text-sm text-tibio line-through">
            {formatCOP(compareAtPrice!)}
          </span>
          <span className=" bg-acento-fondo px-2 py-0.5 text-xs font-bold text-vino">
            −{percent}%
          </span>
        </>
      )}
    </div>
  );
}
