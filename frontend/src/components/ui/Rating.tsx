interface RatingProps {
  rating?: number;
  reviewCount?: number;
  /** Tono de la superficie donde vive la valoración. */
  tono?: "claro" | "oscuro";
}

/** Estrellas accesibles: valor numérico visible + aria-label. */
export function Rating({ rating, reviewCount, tono = "claro" }: RatingProps) {
  if (rating === undefined) return null;
  const rounded = Math.round(rating);
  const oscuro = tono === "oscuro";
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span aria-hidden="true" className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg
            key={n}
            className={`size-4 ${
              n <= rounded
                ? oscuro
                  ? "text-acento-claro"
                  : "text-acento"
                : oscuro
                  ? "text-crema/25"
                  : "text-tibio/30"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 0 0 .95.7h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 0 0-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 0 0-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 0 0-.36-1.12L2.98 8.73c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 0 0 .95-.7l1.07-3.29Z" />
          </svg>
        ))}
      </span>
      <span
        className={`font-semibold ${oscuro ? "text-crema" : "text-carbon"}`}
      >
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={oscuro ? "text-crema/60" : "text-tibio"}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
