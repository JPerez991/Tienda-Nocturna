import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../lib/api";
import { formatCOP } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/Button";
import { EmptyState, Spinner } from "../components/ui/States";

export function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Spinner label="Cargando tu carrito…" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          title="Tu carrito te espera"
          description="Inicia sesión para ver tu carrito y continuar con la compra."
          action={
            <Link to="/login?redirect=/carrito">
              <Button>Iniciar sesión</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-6 font-display text-3xl font-bold text-carbon">
          Tu carrito
        </h1>
        <EmptyState
          title="Tu carrito está vacío"
          description="Aún no agregas nada. Explora la colección y encuentra tu favorito."
          action={
            <Link to="/catalogo">
              <Button>Ver colección</Button>
            </Link>
          }
        />
      </div>
    );
  }

  async function changeQty(id: string, qty: number) {
    setBusyId(id);
    setError(null);
    try {
      await updateQuantity(id, qty);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No pudimos actualizar la cantidad.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await removeItem(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No pudimos quitar el artículo.");
    } finally {
      setBusyId(null);
    }
  }

  /** Envío: valor del API si viene; si no, la regla confirmada (nota 17). */
  const envio = cart.shippingCost ?? (cart.subtotal >= 150000 ? 0 : 5000);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl font-bold text-carbon">
        Tu carrito
      </h1>

      {error && (
        <p role="alert" className="mb-4  bg-vino/10 px-4 py-3 text-sm text-vino">
          {error}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Lista de artículos */}
        <ul className="space-y-4">
          {cart.items.map((item) => {
            const lineTotal = item.variant.price * item.quantity;
            const busy = busyId === item.id;
            return (
              <li
                key={item.id}
                className="flex gap-4  border border-carbon/5 bg-white p-4"
              >
                <Link
                  to={`/producto/${item.product.slug}`}
                  className="size-24 shrink-0 overflow-hidden  bg-crema"
                >
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span aria-hidden="true" className="flex size-full items-center justify-center bg-nude">
                      <svg className="size-8 stroke-[1.5] text-tibio/70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5a2 2 0 1 0-2-2M12 7.5v2L4.5 15.8c-.6.5-.3 1.4.4 1.4h14.2c.7 0 1-.9.4-1.4L12 9.5" />
                      </svg>
                    </span>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-semibold text-carbon">
                        <Link
                          to={`/producto/${item.product.slug}`}
                          className="hover:text-tinta"
                        >
                          {item.product.name}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-sm text-tibio">
                        Variante: {item.variant.name}
                      </p>
                    </div>
                    <button
                      onClick={() => void handleRemove(item.id)}
                      disabled={busy}
                      aria-label={`Quitar ${item.product.name} del carrito`}
                      className="shrink-0  p-2 text-tibio transition-colors hover:bg-vino/10 hover:text-vino disabled:opacity-50"
                    >
                      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    {/* Selector de cantidad */}
                    <div className="inline-flex items-center bg-crema">
                      <button
                        onClick={() => void changeQty(item.id, item.quantity - 1)}
                        disabled={busy || item.quantity <= 1}
                        aria-label="Disminuir cantidad"
                        className="inline-flex size-11 items-center justify-center text-carbon transition-colors hover:bg-acento-fondo disabled:opacity-40"
                      >
                        −
                      </button>
                      <span
                        aria-live="polite"
                        className="min-w-8 text-center text-sm font-semibold"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => void changeQty(item.id, item.quantity + 1)}
                        disabled={busy || item.quantity >= item.variant.stock}
                        aria-label="Aumentar cantidad"
                        className="inline-flex size-11 items-center justify-center text-carbon transition-colors hover:bg-acento-fondo disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-display text-lg font-semibold text-tinta">
                      {formatCOP(lineTotal)}
                    </p>
                  </div>
                  {item.quantity >= item.variant.stock && (
                    <p className="mt-1 text-xs text-tibio">
                      Máximo disponible: {item.variant.stock}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Resumen */}
        <aside
          aria-label="Resumen del pedido"
          className="h-fit  border border-carbon/5 bg-white p-6"
        >
          <h2 className="font-display text-xl font-semibold text-carbon">
            Resumen
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-tibio">Subtotal</dt>
              <dd className="font-semibold text-carbon">
                {formatCOP(cart.subtotal)}
              </dd>
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
          <div className="mt-4 flex items-baseline justify-between border-t border-carbon/10 pt-4">
            <span className="font-semibold text-carbon">Total</span>
            <span className="font-display text-2xl font-semibold text-tinta">
              {formatCOP(cart.subtotal + envio)}
            </span>
          </div>
          <Button
            size="lg"
            className="mt-5 w-full"
            onClick={() => navigate("/checkout")}
          >
            Ir a pagar
          </Button>
          <Link
            to="/catalogo"
            className="mt-3 block text-center text-sm font-semibold text-tinta hover:text-acento"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
