import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { STORE_URL } from "../lib/config";

/**
 * Login PROPIO del panel. No hay registro: las cuentas de administrador las
 * crea el equipo. Tras entrar se verifica el rol; si la cuenta es de cliente,
 * se cierra la sesión para no dejar media sesión abierta.
 */
export function LoginPage() {
  const { user, loading, login, logout } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const redirect = params.get("redirect") || "/";

  if (!loading && user?.role === "ADMIN") {
    return <Navigate to={redirect} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const u = await login({ email: email.trim(), password });
      if (u.role !== "ADMIN") {
        await logout();
        setError("Esta cuenta no tiene acceso al panel. Usa una cuenta de administrador.");
        return;
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No pudimos iniciar sesión. Intenta de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-crema">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
        <p className="font-banner text-xl tracking-[0.3em] text-tinta">NOCTURNA</p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-tibio">
          Panel de administración
        </p>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-carbon">
          Entra a tu panel
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-tibio">
          Solo cuentas de administrador. La tienda pública es otra aplicación:
          aquí no se compra.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <Input
            id="email"
            label="Correo"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p role="alert" className="bg-vino/10 px-4 py-3 text-sm text-vino">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={enviando} className="w-full">
            Entrar
          </Button>
        </form>

        <a
          href={STORE_URL}
          className="mt-8 inline-flex min-h-11 items-center self-start text-[11px] font-semibold uppercase tracking-[0.18em] text-tibio transition-colors hover:text-tinta"
        >
          ← Ir a la tienda
        </a>
      </div>

      <p className="border-t border-tinta/10 px-4 py-4 text-center text-[11px] text-tibio">
        Sesión protegida con cookie httpOnly. Cierra sesión si usas un equipo
        compartido.
      </p>
    </div>
  );
}
