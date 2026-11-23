import { useState, type ReactNode } from "react";
import { NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../ui/States";
import { STORE_URL } from "../../lib/config";

/**
 * Cascarón del PANEL: app independiente de la tienda.
 *
 * No comparte header, footer, franja de anuncios ni WhatsApp con el sitio
 * público. La sesión es la misma (cookie httpOnly de /api/auth/login) y el
 * backend sigue exigiendo rol ADMIN en cada endpoint.
 */

const SECCIONES = [
  { to: "/", end: true, label: "Pedidos" },
  { to: "/productos", label: "Productos" },
  { to: "/categorias", label: "Categorías" },
  { to: "/preguntas", label: "Preguntas" },
];

/** Guardia de sesión + rol, más el marco visual del panel. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [saliendo, setSaliendo] = useState(false);

  async function handleLogout() {
    setSaliendo(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setSaliendo(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-crema px-4">
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-crema px-4 text-center">
        <svg
          aria-hidden="true"
          className="size-10 stroke-[1.5] text-tinta"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path strokeLinecap="round" d="M8 11V7.5a4 4 0 0 1 8 0V11" />
        </svg>
        <h1 className="text-xl font-semibold text-carbon">
          Acceso restringido
        </h1>
        <p className="max-w-sm text-sm text-tibio">
          Esta cuenta no administra la tienda. Entra con una cuenta de
          administrador.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex min-h-11 items-center bg-tinta px-5 text-xs font-semibold uppercase tracking-[0.15em] text-crema transition-colors hover:bg-tinta-suave"
          >
            Cambiar de cuenta
          </button>
          <a
            href={STORE_URL}
            className="inline-flex min-h-11 items-center border-b border-tinta/30 pb-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-tinta transition-colors hover:border-tinta"
          >
            Ir a la tienda
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crema lg:pl-60">
      {/* ---------- Barra lateral (escritorio) ---------- */}
      <aside className="sidebar fixed inset-y-0 left-0 hidden w-60 flex-col bg-tinta text-crema lg:flex">
        <div className="border-b border-crema/10 px-6 py-6">
          <p className="font-banner text-lg tracking-[0.28em] text-crema">
            NOCTURNA
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-crema/45">
            Panel de administración
          </p>
        </div>

        <nav aria-label="Secciones del panel" className="flex-1 px-3 py-5">
          <ul className="space-y-0.5">
            {SECCIONES.map((s) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  end={s.end}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center px-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-crema text-tinta"
                        : "text-crema/70 hover:bg-crema/10 hover:text-crema"
                    }`
                  }
                >
                  {s.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-crema/10 px-6 py-5">
          <p className="truncate text-sm font-medium text-crema">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-crema/50">{user.email}</p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={STORE_URL}
              className="inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/70 transition-colors hover:text-crema"
            >
              Ver la tienda →
            </a>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={saliendo}
              className="inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.18em] text-crema/70 transition-colors hover:text-crema disabled:opacity-50"
            >
              {saliendo ? "Saliendo…" : "Cerrar sesión"}
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Cabecera y navegación (móvil) ---------- */}
      <header className="sidebar sticky top-0 z-20 bg-tinta text-crema lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="font-banner text-base tracking-[0.26em]">NOCTURNA</p>
          <div className="flex items-center gap-4">
            <a
              href={STORE_URL}
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-crema/70"
            >
              Tienda
            </a>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={saliendo}
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-crema/70 disabled:opacity-50"
            >
              Salir
            </button>
          </div>
        </div>
        <nav aria-label="Secciones del panel" className="overflow-x-auto">
          <ul className="flex gap-1 px-2 pb-2">
            {SECCIONES.map((s) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  end={s.end}
                  className={({ isActive }) =>
                    `flex min-h-11 shrink-0 items-center px-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-crema text-tinta"
                        : "text-crema/70 hover:text-crema"
                    }`
                  }
                >
                  {s.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ---------- Contenido ---------- */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-tinta focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-crema"
      >
        Saltar al contenido
      </a>
      <main id="contenido" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
    </div>
  );
}
