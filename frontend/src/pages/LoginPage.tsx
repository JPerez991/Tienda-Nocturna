import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";

export function LoginPage() {
  const { user, login } = useAuth();
  const { refresh: refreshCart } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, no mostramos el formulario.
  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user, navigate, redirect]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      // El carrito del invitado no existe; recargamos el del usuario.
      await refreshCart();
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError && err.statusCode === 401
          ? "Correo o contraseña incorrectos."
          : err instanceof Error
            ? err.message
            : "No pudimos iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-carbon">
        Bienvenido de vuelta
      </h1>
      <p className="mt-2 text-tibio">Inicia sesión para ver tu carrito y pedidos.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {error && (
          <p role="alert" className=" bg-vino/10 px-4 py-3 text-sm text-vino">
            {error}
          </p>
        )}
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-tibio">
        ¿No tienes cuenta?{" "}
        <Link
          to={`/registro?redirect=${encodeURIComponent(redirect)}`}
          className="font-semibold text-tinta hover:text-acento"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
