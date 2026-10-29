import type { ReactNode } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/States";

/**
 * Guardia de rol: si no hay sesión → /login; si no es ADMIN → 403.
 * El backend también protege cada endpoint con requireRole("ADMIN");
 * esto es solo para no mostrar la interfaz a usuarios comunes.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Spinner label="Verificando permisos…" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <svg aria-hidden="true" className="size-10 stroke-[1.5] text-tinta" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path strokeLinecap="round" d="M8 11V7.5a4 4 0 0 1 8 0V11" />
        </svg>
        <h1 className="font-display text-3xl font-bold text-carbon">
          Acceso restringido
        </h1>
        <p className="text-tibio">
          Esta sección es solo para administradores de la tienda.
        </p>
        <Link to="/">
          <Button>Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", end: true, label: "Pedidos" },
    { to: "/admin/productos", label: "Productos" },
    { to: "/admin/categorias", label: "Categorías" },
    { to: "/admin/preguntas", label: "Preguntas" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-acento">
          Panel administrativo
        </p>
        <h1 className="font-display text-3xl font-bold text-carbon">
          Hola, {user.firstName} 👑
        </h1>
      </header>

      <nav
        aria-label="Secciones del panel admin"
        className="scroll-sutil -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2"
      >
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `min-h-11 shrink-0 px-4 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-tinta text-crema"
                  : "bg-white text-carbon hover:bg-nude"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      {children}
    </div>
  );
}
