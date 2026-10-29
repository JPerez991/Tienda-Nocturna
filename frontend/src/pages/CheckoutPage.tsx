import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { esTelefonoCO, formatCOP } from "../lib/format";
import type { Address, PaymentMethod } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { EmptyState, Spinner } from "../components/ui/States";

/* ============================================================
   Checkout en 3 pasos: Datos → Envío → Pago.
   Al confirmar, el backend crea el pedido y nos devuelve
   payment.redirectUrl (checkout.wompi.co) → redirigimos allí.
   ============================================================ */

type Paso = 1 | 2 | 3;

const PASOS = ["Datos", "Envío", "Pago"] as const;

/* Iconos de trazo fino (la skill prohíbe emojis como iconografía) */
const claseIcono = "size-6 stroke-[1.5]";

const IconoMovil = () => (
  <svg className={claseIcono} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path strokeLinecap="round" d="M11 18h2" />
  </svg>
);

const IconoBanco = () => (
  <svg className={claseIcono} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 9.5 12 4.5l8.5 5M5.5 11v6.5m4-6.5v6.5m4-6.5v6.5M4 19.5h16" />
  </svg>
);

const IconoTarjeta = () => (
  <svg className={claseIcono} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path strokeLinecap="round" d="M3 10h18M7 15h3" />
  </svg>
);

/* 6 métodos con el literal EXACTO del enum (confirmado, nota 17). */
const METODOS_PAGO: Array<{
  id: PaymentMethod;
  nombre: string;
  desc: string;
  icono: ReactNode;
}> = [
  { id: "NEQUI", nombre: "Nequi", desc: "Desde tu app Nequi", icono: <IconoMovil /> },
  { id: "DAVIPLATA", nombre: "Daviplata", desc: "Desde tu app Daviplata", icono: <IconoMovil /> },
  { id: "PSE", nombre: "PSE", desc: "Débito desde tu banco", icono: <IconoBanco /> },
  { id: "BANCOLOMBIA", nombre: "Bancolombia", desc: "Transferencia", icono: <IconoBanco /> },
  { id: "CREDIT_CARD", nombre: "Tarjeta de crédito", desc: "Visa, Mastercard…", icono: <IconoTarjeta /> },
  { id: "DEBIT_CARD", nombre: "Tarjeta de débito", desc: "Débito internacional", icono: <IconoTarjeta /> },
];

export function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [paso, setPaso] = useState<Paso>(1);
  const [direcciones, setDirecciones] = useState<Address[] | null>(null);
  const [direccionesError, setDireccionesError] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string>("");
  // Formulario "Nueva dirección" (sección 7; el backend lo pidió en c.1)
  const [formDirAbierto, setFormDirAbierto] = useState(false);
  const [guardandoDir, setGuardandoDir] = useState(false);
  const [errorDir, setErrorDir] = useState<string | null>(null);
  const [dirAlias, setDirAlias] = useState("");
  const [dirNombre, setDirNombre] = useState("");
  const [dirTel, setDirTel] = useState("");
  const [dirLinea1, setDirLinea1] = useState("");
  const [dirLinea2, setDirLinea2] = useState("");
  const [dirCiudad, setDirCiudad] = useState("");
  const [dirDepto, setDirDepto] = useState("");
  const [dirPostal, setDirPostal] = useState("");
  const [metodo, setMetodo] = useState<PaymentMethod>("NEQUI");
  const [enviando, setEnviando] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  // Datos del comprador (prefill desde la sesión; editables)
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    if (user) {
      setNombre((n) => n || user.firstName);
      setEmail((e) => e || user.email);
    }
  }, [user]);

  // Cargar direcciones guardadas (sección 7 del contrato)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api.addresses
      .list()
      .then((dirs) => {
        if (cancelled) return;
        setDirecciones(dirs);
        // Preselecciona la predeterminada (o la primera) si no hay una elegida.
        setAddressId((prev) => {
          if (prev && dirs.some((d) => d.id === prev)) return prev;
          return dirs.find((d) => d.isDefault)?.id ?? dirs[0]?.id ?? "";
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setDirecciones([]);
        setDireccionesError(
          e instanceof ApiError && e.statusCode === 404
            ? "El módulo de direcciones aún no está disponible."
            : e instanceof Error
              ? e.message
              : "No pudimos cargar tus direcciones.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const subtotal = cart?.subtotal ?? 0;
  // Envío: valor del API si viene; si no, la regla confirmada (nota 17).
  const envio = cart?.shippingCost ?? (subtotal > 0 && subtotal < 150000 ? 5000 : 0);
  const total = subtotal + envio;

  const sinDirecciones = direcciones !== null && direcciones.length === 0;
  const mostrarFormDir = !direccionesError && (sinDirecciones || formDirAbierto);
  const dirFormValido =
    dirNombre.trim() !== "" &&
    esTelefonoCO(dirTel) &&
    dirLinea1.trim() !== "" &&
    dirCiudad.trim() !== "" &&
    dirDepto.trim() !== "";

  const datosCompletos = useMemo(
    () => nombre.trim() !== "" && /.+@.+\..+/.test(email) && telefono.trim().length >= 7,
    [nombre, email, telefono],
  );

  if (authLoading || cartLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Spinner label="Preparando tu compra…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="No hay nada que pagar"
          description="Tu carrito está vacío. Agrega productos antes de continuar."
          action={
            <Link to="/catalogo">
              <Button>Explorar catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  function abrirFormDireccion() {
    setDirNombre((n) => n || nombre.trim());
    setDirTel((t) => t || telefono.trim());
    setErrorDir(null);
    setFormDirAbierto(true);
  }

  async function guardarDireccion(e: FormEvent) {
    e.preventDefault();
    if (!esTelefonoCO(dirTel)) {
      setErrorDir("El celular debe tener 10 dígitos (ej. 3001234567).");
      return;
    }
    setGuardandoDir(true);
    setErrorDir(null);
    try {
      const creada = await api.addresses.create({
        receiverName: dirNombre.trim(),
        phone: dirTel.replace(/[\s-]/g, ""),
        line1: dirLinea1.trim(),
        line2: dirLinea2.trim() || undefined,
        city: dirCiudad.trim(),
        department: dirDepto.trim(),
        postalCode: dirPostal.trim() || undefined,
        alias: dirAlias.trim() || undefined,
      });
      setDirecciones((prev) => [...(prev ?? []), creada]);
      setAddressId(creada.id);
      setFormDirAbierto(false);
    } catch (err) {
      setErrorDir(
        err instanceof ApiError
          ? err.message
          : "No pudimos guardar la dirección. Intenta de nuevo.",
      );
    } finally {
      setGuardandoDir(false);
    }
  }

  async function confirmarPago() {
    setEnviando(true);
    setErrorPago(null);
    try {
      const res = await api.checkout(addressId, metodo);
      // Wompi toma el relevo: redirigimos al checkout externo.
      window.location.href = res.payment.redirectUrl;
    } catch (e) {
      setErrorPago(
        e instanceof ApiError ? e.message : "No pudimos procesar el pago.",
      );
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl font-bold text-carbon">
        Finalizar compra
      </h1>

      {/* Indicador de pasos */}
      <ol aria-label="Progreso del checkout" className="mb-8 flex gap-2">
        {PASOS.map((p, i) => {
          const num = (i + 1) as Paso;
          const activo = paso === num;
          const hecho = paso > num;
          return (
            <li key={p} className="flex-1">
              <div
                className={`flex items-center gap-2  px-3 py-2 text-sm font-semibold ${
                  activo
                    ? "bg-tinta text-crema"
                    : hecho
                      ? "bg-tinta/10 text-tinta"
                      : "bg-white text-tibio"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-6 shrink-0 items-center justify-center  text-xs ${
                    activo
                      ? "bg-acento-claro text-tinta"
                      : hecho
                        ? "bg-tinta text-crema"
                        : "bg-tibio/20 text-tibio"
                  }`}
                >
                  {hecho ? "✓" : num}
                </span>
                <span className="truncate">{p}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* ---------- Columna principal ---------- */}
        <div className=" border border-carbon/5 bg-white p-6">
          {/* PASO 1: Datos */}
          {paso === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (datosCompletos) setPaso(2);
              }}
              className="space-y-4"
            >
              <h2 className="font-display text-xl font-semibold text-carbon">
                Tus datos
              </h2>
              <Input
                id="nombre"
                label="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
                required
              />
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
                id="telefono"
                label="Celular"
                type="tel"
                inputMode="numeric"
                placeholder="300 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                autoComplete="tel"
                hint="Lo usamos para avisarte del estado de tu pedido."
                required
              />
              <Button type="submit" disabled={!datosCompletos} className="w-full sm:w-auto">
                Continuar al envío
              </Button>
            </form>
          )}

          {/* PASO 2: Envío */}
          {paso === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-semibold text-carbon">
                Dirección de envío
              </h2>

              {direccionesError ? (
                <p role="alert" className=" bg-acento-fondo px-4 py-3 text-sm text-vino">
                  {direccionesError}
                </p>
              ) : direcciones === null ? (
                <Spinner label="Cargando direcciones…" />
              ) : direcciones.length === 0 ? (
                <p className="text-sm text-tibio">
                  Todavía no tienes direcciones. Crea la primera aquí abajo.
                </p>
              ) : (
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-carbon">
                    Elige una dirección
                  </legend>
                  <div className="space-y-2">
                    {direcciones.map((d) => (
                      <label
                        key={d.id}
                        className={`flex cursor-pointer items-start gap-3  border p-4 transition-colors ${
                          addressId === d.id
                            ? "border-acento bg-acento-fondo/50"
                            : "border-tibio/30 hover:border-tinta"
                        }`}
                      >
                        <input
                          type="radio"
                          name="direccion"
                          value={d.id}
                          checked={addressId === d.id}
                          onChange={() => setAddressId(d.id)}
                          className="mt-1 size-4 accent-[#14100e]"
                        />
                        <span className="text-sm">
                          <span className="block font-semibold text-carbon">
                            {d.alias ? `${d.alias} · ` : ""}
                            {d.receiverName}
                            {d.isDefault && (
                              <span className="ml-2  bg-acento-fondo px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-acento">
                                Predet.
                              </span>
                            )}
                          </span>
                          <span className="block text-tibio">
                            {d.line1}
                            {d.line2 ? `, ${d.line2}` : ""} · {d.city},{" "}
                            {d.department}
                          </span>
                          <span className="block text-tibio">{d.phone}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Formulario "Nueva dirección" (sección 7; pedido c.1 del backend) */}
              {mostrarFormDir && (
                <form
                  onSubmit={(e) => void guardarDireccion(e)}
                  className="space-y-4  border border-tibio/20 p-4"
                >
                  <h3 className="font-semibold text-carbon">Nueva dirección</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="dir-alias"
                      label="Alias (opcional)"
                      placeholder="Casa, Oficina…"
                      value={dirAlias}
                      onChange={(e) => setDirAlias(e.target.value)}
                    />
                    <Input
                      id="dir-nombre"
                      label="Nombre de quien recibe"
                      value={dirNombre}
                      onChange={(e) => setDirNombre(e.target.value)}
                      autoComplete="name"
                      required
                    />
                    <Input
                      id="dir-tel"
                      label="Celular (10 dígitos)"
                      type="tel"
                      inputMode="numeric"
                      placeholder="3001234567"
                      value={dirTel}
                      onChange={(e) => setDirTel(e.target.value)}
                      autoComplete="tel-national"
                      hint="Sin espacios: 3001234567."
                      required
                    />
                    <Input
                      id="dir-linea1"
                      label="Dirección (calle, carrera…)"
                      value={dirLinea1}
                      onChange={(e) => setDirLinea1(e.target.value)}
                      autoComplete="address-line1"
                      required
                    />
                    <Input
                      id="dir-linea2"
                      label="Apartamento, piso… (opcional)"
                      value={dirLinea2}
                      onChange={(e) => setDirLinea2(e.target.value)}
                      autoComplete="address-line2"
                    />
                    <Input
                      id="dir-ciudad"
                      label="Ciudad"
                      value={dirCiudad}
                      onChange={(e) => setDirCiudad(e.target.value)}
                      autoComplete="address-level2"
                      required
                    />
                    <Input
                      id="dir-depto"
                      label="Departamento"
                      value={dirDepto}
                      onChange={(e) => setDirDepto(e.target.value)}
                      autoComplete="address-level1"
                      required
                    />
                    <Input
                      id="dir-postal"
                      label="Código postal (opcional)"
                      inputMode="numeric"
                      value={dirPostal}
                      onChange={(e) => setDirPostal(e.target.value)}
                      autoComplete="postal-code"
                    />
                  </div>
                  {errorDir && (
                    <p role="alert" className=" bg-vino/10 px-4 py-3 text-sm text-vino">
                      {errorDir}
                    </p>
                  )}
                  <div className="flex gap-3">
                    {direcciones !== null && direcciones.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setFormDirAbierto(false);
                          setErrorDir(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button type="submit" loading={guardandoDir} disabled={!dirFormValido}>
                      Usar esta dirección
                    </Button>
                  </div>
                </form>
              )}

              {!formDirAbierto && direcciones !== null && direcciones.length > 0 && (
                <Button variant="secondary" onClick={abrirFormDireccion}>
                  Agregar otra dirección
                </Button>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setPaso(1)}>
                  Volver
                </Button>
                <Button
                  onClick={() => setPaso(3)}
                  disabled={!addressId}
                  className="flex-1 sm:flex-none"
                >
                  Continuar al pago
                </Button>
              </div>
              {!addressId && direcciones !== null && direcciones.length > 0 && (
                <p className="text-xs text-tibio">Selecciona una dirección para continuar.</p>
              )}
            </div>
          )}

          {/* PASO 3: Pago */}
          {paso === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-semibold text-carbon">
                Método de pago
              </h2>
              <fieldset className="grid gap-3 sm:grid-cols-3">
                <legend className="sr-only">Elige cómo pagar</legend>
                {METODOS_PAGO.map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer flex-col items-center gap-1  border p-4 text-center transition-colors ${
                      metodo === m.id
                        ? "border-acento bg-acento-fondo/50"
                        : "border-tibio/30 hover:border-tinta"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodo"
                      value={m.id}
                      checked={metodo === m.id}
                      onChange={() => setMetodo(m.id)}
                      className="sr-only"
                    />
                    <span aria-hidden="true" className="text-tinta">{m.icono}</span>
                    <span className="font-semibold text-carbon">{m.nombre}</span>
                    <span className="text-xs text-tibio">{m.desc}</span>
                  </label>
                ))}
              </fieldset>

              <p className=" bg-tinta/5 px-4 py-3 text-sm text-tibio">
                Serás redirigido a <strong>Wompi</strong> para completar el
                pago de forma segura. Nunca vemos los datos de tu tarjeta.
              </p>

              {errorPago && (
                <p role="alert" className=" bg-vino/10 px-4 py-3 text-sm text-vino">
                  {errorPago}
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setPaso(2)}>
                  Volver
                </Button>
                <Button
                  size="lg"
                  onClick={() => void confirmarPago()}
                  loading={enviando}
                  disabled={!addressId}
                  className="flex-1 sm:flex-none"
                >
                  Pagar {formatCOP(total)}
                </Button>
              </div>
              <button
                onClick={() => navigate("/carrito")}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-tinta hover:text-acento"
              >
                Volver al carrito
              </button>
            </div>
          )}
        </div>

        {/* ---------- Resumen del pedido ---------- */}
        <aside
          aria-label="Resumen del pedido"
          className="h-fit  border border-carbon/5 bg-white p-6"
        >
          <h2 className="font-display text-xl font-semibold text-carbon">
            Tu pedido
          </h2>
          <ul className="mt-4 space-y-3">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-carbon">
                    {item.product.name}
                  </span>
                  <span className="text-tibio">
                    {item.variant.name} · ×{item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-carbon">
                  {formatCOP(item.variant.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-carbon/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-tibio">Subtotal</dt>
              <dd className="font-semibold text-carbon">{formatCOP(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-tibio">Envío</dt>
              <dd className="font-semibold text-carbon">
                {envio === 0 ? (
                  <span className="text-acento">Gratis</span>
                ) : (
                  formatCOP(envio)
                )}
              </dd>
            </div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-carbon/10 pt-3">
            <span className="font-semibold text-carbon">Total</span>
            <span className="font-display text-2xl font-semibold text-tinta">
              {formatCOP(total)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
