import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { formatCOP } from "../lib/format";
import type { OrderDetail, PaymentMethod, PaymentStatus } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Spinner, ErrorState } from "../components/ui/States";
import { StatusBadge } from "./OrdersPage";

/* Traducción de literales del contrato (confirmados, notas 17 / B.9). */
const METODO_PAGO: Record<PaymentMethod, string> = {
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
  PSE: "PSE",
  CREDIT_CARD: "Tarjeta de crédito",
  DEBIT_CARD: "Tarjeta de débito",
  BANCOLOMBIA: "Bancolombia",
};

const ESTADO_PAGO: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  DECLINED: "Rechazado",
  VOIDED: "Anulado",
  REFUNDED: "Reembolsado",
};

export function OrderDetailPage() {
  const { id = "" } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagando, setPagando] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  /** Re-fetch periódico mientras el pago está PENDING (nota c.2 del backend). */
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setError(null);
    api.orders
      .detail(id)
      .then((o) => {
        if (!cancelled) setOrder(o);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error desconocido");
      });
    return () => {
      cancelled = true;
    };
  }, [user, id, tick]);

  // El webhook de Wompi puede tardar tras el retorno: re-carga el detalle
  // mientras el pago siga PENDING (máx. ~2 min; nota c.2 del backend).
  const pagoPendiente = order?.status === "PENDING";
  useEffect(() => {
    if (!pagoPendiente || tick >= 8) return;
    const t = setTimeout(() => setTick((n) => n + 1), 15000);
    return () => clearTimeout(t);
  }, [pagoPendiente, tick, order]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Spinner label="Cargando pedido…" />
      </div>
    );
  }
  if (!user) return <Navigate to={`/login?redirect=/pedidos/${id}`} replace />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={error} />
        <p className="mt-6 text-center">
          <Link to="/pedidos" className="font-semibold text-tinta hover:text-acento">
            ← Volver a mis pedidos
          </Link>
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Spinner label="Cargando pedido…" />
      </div>
    );
  }

  // Desglose oficial del contrato (sección 5); respaldo calculado si falta.
  const subtotal =
    order.subtotal ??
    order.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  // Envío: valor del API si viene; si no, la diferencia subtotal→total (nota 17).
  const envio = Math.max(0, order.shippingCost ?? order.total - subtotal);

  /** Reintentar pago de un pedido PENDING (nota 11); si el endpoint aún no
   *  existe (404), mostramos un aviso en lugar de romper el flujo. */
  async function reintentarPago() {
    if (!order) return;
    setPagando(true);
    setErrorPago(null);
    try {
      const r = await api.orders.pay(order.id);
      const url = r.redirectUrl ?? r.payment?.redirectUrl;
      if (url) {
        window.location.assign(url);
        return;
      }
      setErrorPago("No pudimos iniciar el pago. Intenta de nuevo en unos minutos.");
    } catch (e) {
      setErrorPago(
        e instanceof ApiError && e.statusCode === 404
          ? "Reintentar el pago aún no está disponible."
          : e instanceof Error
            ? e.message
            : "No pudimos iniciar el pago.",
      );
    } finally {
      setPagando(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/pedidos"
        className="text-sm font-semibold text-tinta hover:text-acento"
      >
        ← Volver a mis pedidos
      </Link>

      <header className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-carbon">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-tibio">
            Realizado el{" "}
            {new Date(order.createdAt).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {/* Aviso mientras el webhook de Wompi confirma el pago (nota c.2) */}
      {order.status === "PENDING" && (
        <p
          role="status"
          className="mt-6  bg-acento-fondo px-4 py-3 text-sm text-tinta-suave"
        >
          {tick >= 8
            ? "Tu pedido sigue pendiente de pago. Refresca la página en unos minutos."
            : "Confirmando tu pago… Wompi puede tardar unos segundos; esta página se actualiza sola."}
        </p>
      )}

      {/* Items */}
      <section
        aria-label="Artículos del pedido"
        className="mt-8  border border-carbon/5 bg-white p-6"
      >
        <h2 className="font-display text-xl font-semibold text-carbon">
          Artículos
        </h2>
        <ul className="mt-4 divide-y divide-carbon/10">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-carbon">{it.name}</p>
                <p className="text-sm text-tibio">
                  {it.sku ? `SKU ${it.sku} · ` : ""}×{it.quantity}
                </p>
              </div>
              <p className="shrink-0 font-semibold text-carbon">
                {formatCOP(it.unitPrice * it.quantity)}
              </p>
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
          {(order.discount ?? 0) > 0 && (
            <div className="flex justify-between">
              <dt className="text-tibio">Descuento</dt>
              <dd className="font-semibold text-acento">
                −{formatCOP(order.discount ?? 0)}
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-3 flex items-baseline justify-between border-t border-carbon/10 pt-3">
          <span className="font-semibold text-carbon">Total</span>
          <span className="font-display text-2xl font-semibold text-tinta">
            {formatCOP(order.total)}
          </span>
        </div>
      </section>

      {/* Pago */}
      {order.payment && (
        <section
          aria-label="Información de pago"
          className="mt-6  border border-carbon/5 bg-white p-6"
        >
          <h2 className="font-display text-xl font-semibold text-carbon">Pago</h2>
          <p className="mt-3 text-sm text-tibio">
            Método:{" "}
            <span className="font-semibold text-carbon">
              {METODO_PAGO[order.payment.method] ?? order.payment.method}
            </span>
          </p>
          <p className="mt-1 text-sm text-tibio">
            Estado:{" "}
            <span className="font-semibold text-carbon">
              {ESTADO_PAGO[order.payment.status] ?? order.payment.status}
            </span>
          </p>
        </section>
      )}

      {/* Dirección de envío usada (se muestra si el API la incluye) */}
      {order.address && (order.address.line1 || order.address.city) && (
        <section
          aria-label="Dirección de envío"
          className="mt-6  border border-carbon/5 bg-white p-6"
        >
          <h2 className="font-display text-xl font-semibold text-carbon">
            Dirección de envío
          </h2>
          <div className="mt-3 text-sm text-tibio">
            {order.address.receiverName && (
              <p className="font-semibold text-carbon">
                {order.address.alias ? `${order.address.alias} · ` : ""}
                {order.address.receiverName}
              </p>
            )}
            <p>
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
            </p>
            <p>
              {order.address.city}
              {order.address.department ? ` · ${order.address.department}` : ""}
            </p>
            {order.address.phone && <p>Tel. {order.address.phone}</p>}
          </div>
        </section>
      )}

      {/* Reintentar pago (solo pedidos PENDING — nota 11) */}
      {order.status === "PENDING" && (
        <div className="mt-6">
          <Button size="lg" onClick={() => void reintentarPago()} loading={pagando}>
            Completar pago
          </Button>
          {errorPago && (
            <p
              role="alert"
              className="mt-3  bg-vino/10 px-4 py-3 text-sm text-vino"
            >
              {errorPago}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
