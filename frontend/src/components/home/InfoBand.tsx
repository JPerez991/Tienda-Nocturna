import { Link } from "react-router-dom";

/** Enlaces de información del banner blanco: Bodoni sobre blanco. */
const enlace =
  "inline-flex min-h-11 items-center font-banner text-[17px] text-carbon underline-offset-8 decoration-1 transition-colors hover:text-tinta hover:underline sm:text-lg";

/**
 * Banner blanco de información de la tienda (petición explícita del usuario):
 * solo los tres enlaces de servicio — sin titular de campaña, foto ni CTAs.
 * Sobre el home oscuro funciona como una página blanca de revista entre el
 * índice de colecciones y la portada.
 */
export function InfoBand() {
  return (
    <nav
      aria-label="Información de la tienda"
      data-tema="claro"
      className="border-b border-tinta/10 bg-white"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center divide-y divide-tinta/10 px-4 py-2 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-1 sm:divide-y-0 sm:py-3.5">
        <Link to="/envios" className={enlace}>
          Políticas de envío
        </Link>
        <span aria-hidden="true" className="hidden h-4 w-px bg-tinta/15 sm:block" />
        <Link to="/garantia" className={enlace}>
          Garantía y devoluciones
        </Link>
        <span aria-hidden="true" className="hidden h-4 w-px bg-tinta/15 sm:block" />
        <Link to="/pagos" className={enlace}>
          Pagos seguros
        </Link>
      </div>
    </nav>
  );
}
