interface RatingProps {
  rating?: number;
  reviewCount?: number;
}

/** Estrellas accesibles: valor numérico visible + aria-label. */
export function Rating({ rating, reviewCount }: RatingProps) {
  if (rating === undefined) return null;
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span aria-hidden="true" className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg
            key={n}
            className={`size-4 ${n <= rounded ? "text-acento" : "text-tibio/30"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 0 0 .95.7h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 0 0-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 0 0-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 0 0-.36-1.12L2.98 8.73c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 0 0 .95-.7l1.07-3.29Z" />
          </svg>
        ))}
      </span>
      <span className="font-semibold text-carbon">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-tibio">({reviewCount})</span>
      )}
    </div>
  );
}
