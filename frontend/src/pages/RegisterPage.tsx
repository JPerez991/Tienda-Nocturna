import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user, navigate, redirect]);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError && err.statusCode === 409
          ? "Este correo ya está registrado. ¿Quieres iniciar sesión?"
          : err instanceof Error
            ? err.message
            : "No pudimos crear tu cuenta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-carbon">
        Crea tu cuenta
      </h1>
      <p className="mt-2 text-tibio">
        Regístrate para guardar tu carrito y seguir tus pedidos.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {error && (
          <p role="alert" className=" bg-vino/10 px-4 py-3 text-sm text-vino">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="firstName"
            label="Nombre"
            value={form.firstName}
            onChange={set("firstName")}
            autoComplete="given-name"
            required
          />
          <Input
            id="lastName"
            label="Apellido"
            value={form.lastName}
            onChange={set("lastName")}
            autoComplete="family-name"
            required
          />
        </div>
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          value={form.email}
          onChange={set("email")}
          autoComplete="email"
          required
        />
        <Input
          id="phone"
          label="Celular"
          type="tel"
          inputMode="numeric"
          placeholder="300 123 4567"
          value={form.phone}
          onChange={set("phone")}
          autoComplete="tel"
          hint="10 dígitos, sin espacios ni símbolos."
          required
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          value={form.password}
          onChange={set("password")}
          autoComplete="new-password"
          hint="Mínimo 8 caracteres."
          minLength={8}
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-tibio">
        ¿Ya tienes cuenta?{" "}
        <Link
          to={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="font-semibold text-tinta hover:text-acento"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
