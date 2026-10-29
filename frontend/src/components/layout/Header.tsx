import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

/**
 * Enlace de nav en versalitas con subrayado en hover.
 * Sin marcos: la selección se marca con el subrayado, no con una caja.
 */
function NavItem({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.18em] underline-offset-[10px] transition-colors hover:underline ${
          isActive
            ? "text-crema underline decoration-crema"
            : "text-crema/70 hover:text-crema hover:decoration-crema/60"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  // Drawer móvil: bloquear el scroll de fondo mientras está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-crema/10 bg-tinta text-crema">
      {/* Tres zonas: nav · wordmark centrado · acciones */}
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:h-20">
        {/* Izquierda: nav escritorio + hamburguesa móvil */}
        <div className="flex items-center">
          <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
            <NavItem to="/">Inicio</NavItem>
            <NavItem to="/catalogo">Catálogo</NavItem>
            {user && <NavItem to="/pedidos">Mis pedidos</NavItem>}
            {user?.role === "ADMIN" && <NavItem to="/admin">Admin</NavItem>}
          </nav>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex size-12 items-center justify-center transition-colors hover:bg-crema/10 md:hidden"
          >
            <svg
              aria-hidden="true"
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                d={open ? "M6 18 18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"}
              />
            </svg>
          </button>
        </div>

        {/* Wordmark centrado: serif en versalitas espaciadas (ópticamente centrado) */}
        <Link
          to="/"
          className="justify-self-center font-display text-lg font-medium uppercase tracking-[0.35em] text-crema [margin-right:-0.35em] md:text-xl"
        >
          Nocturna
        </Link>

        {/* Derecha: cuenta + carrito */}
        <div className="flex items-center justify-end gap-1 md:gap-2">
          <div className="hidden items-center gap-1 md:flex">
            {user ? (
              <>
                <Link
                  to="/pedidos"
                  className="inline-flex min-h-11 max-w-[10rem] items-center truncate px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/70 transition-colors hover:bg-crema/10 hover:text-crema"
                >
                  Hola, {user.firstName}
                </Link>
                <button
                  onClick={() => void logout()}
                  className="inline-flex min-h-11 items-center px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/70 transition-colors hover:bg-crema/10 hover:text-crema"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/70 underline-offset-[10px] transition-colors hover:text-crema hover:underline hover:decoration-crema/60"
              >
                Ingresar
              </Link>
            )}
          </div>

          {/* Carrito: icono de carrito a trazo, sin masa ni marco */}
          <Link
            to="/carrito"
            aria-label={`Carrito de compras, ${count} ${count === 1 ? "artículo" : "artículos"}`}
            className="relative inline-flex size-12 items-center justify-center text-crema transition-colors hover:bg-crema/10"
          >
            <svg
              aria-hidden="true"
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="9" cy="20" r="1.25" />
              <circle cx="18.5" cy="20" r="1.25" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2 3h2.4l2.3 11a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.55L21 7.5H5.6"
              />
            </svg>
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex size-6 items-center justify-center bg-vino text-[11px] font-bold text-crema"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Drawer móvil: overlay editorial a pantalla completa, links en serif */}
      {open && (
        <nav
          id="menu-movil"
          aria-label="Principal móvil"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-tinta px-6 pb-10 pt-4 md:hidden"
        >
          <ul className="flex flex-col" role="list">
            {[
              { to: "/", label: "Inicio" },
              { to: "/catalogo", label: "Catálogo" },
              ...(user ? [{ to: "/pedidos", label: "Mis pedidos" }] : []),
              ...(user?.role === "ADMIN" ? [{ to: "/admin", label: "Admin" }] : []),
            ].map((l) => (
              <li key={l.to} className="border-b border-crema/10">
                <NavLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-14 items-center font-display text-2xl transition-colors ${
                      isActive
                        ? "italic text-acento-claro"
                        : "text-crema hover:text-acento-claro"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  void logout();
                }}
                className="flex min-h-12 w-full items-center text-left text-xs font-semibold uppercase tracking-[0.18em] text-crema/70 transition-colors hover:text-crema"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center text-xs font-semibold uppercase tracking-[0.18em] text-crema/70 transition-colors hover:text-crema"
              >
                Ingresar / Crear cuenta
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
