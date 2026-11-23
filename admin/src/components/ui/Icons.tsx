/** Iconos del panel: SVG de trazo 1.5, sin emojis ni glifos tipográficos. */
type Props = { className?: string };

export function PlusIcon({ className = "size-4" }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}
