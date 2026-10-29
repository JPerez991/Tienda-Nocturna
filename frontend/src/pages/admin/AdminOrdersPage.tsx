import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import { formatCOP } from "../../lib/format";
import type { AdminOrder, OrderStatus } from "../../lib/types";
import { Badge } from "../../components/ui/Badge";
import { ErrorState, Spinner } from "../../components/ui/States";

/** Estados posibles del pedido (confirmar enum con backend — nota 4 del contrato). */
const ESTADOS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const ETIQUETAS: Record<OrderStatus, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const TONOS = {
  PENDING: "warning",
  PAID: "success",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "info",
} as const;

/** Fila de pedido admin: muestra comprador, total, fecha y selector de estado. */
function OrderRow({ order }: { order: AdminOrder }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: OrderStatus) {
    const prev = status;
    setStatus(next); // optimista
    setSaving(true);
    setError(null);
    try {
      await api.admin.updateOrderStatus(order.id, next);
    } catch (e) {
      setStatus(prev); // revertimos
      setError(
        e instanceof ApiError ? e.message : "No pudimos actualizar el estado.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className=" border border-carbon/5 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-carbon">
            {order.orderNumber}
          </p>
          <p className="text-sm text-tibio">
            {order.user
              ? `${order.user.firstName}${order.user.lastName ? ` ${order.user.lastName}` : ""} · ${order.user.email}`
              : "Comprador no disponible"}
          </p>
          <p className="text-sm text-tibio">
            {new Date(order.createdAt).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold text-tinta">
            {formatCOP(order.total)}
          </p>
          <Badge tone={TONOS[status] ?? "neutral"}>{ETIQUETAS[status] ?? status}</Badge>
        </div>
      </div>

      {/* Items (si el backend los incluye) */}
      {order.items && order.items.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-carbon/10 pt-3 text-sm">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3">
              <span className="truncate text-tibio">
                {it.name} ×{it.quantity}
              </span>
              <span className="shrink-0 font-semibold text-carbon">
                {formatCOP(it.unitPrice * it.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Cambio de estado */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label
          htmlFor={`status-${order.id}`}
          className="text-sm font-semibold text-carbon"
        >
          Estado:
        </label>
        <select
          id={`status-${order.id}`}
          value={status}
          disabled={saving}
          onChange={(e) => void change(e.target.value as OrderStatus)}
          className="min-h-11  border border-tibio/30 bg-white px-3 text-sm text-carbon disabled:opacity-60"
        >
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {ETIQUETAS[s]}
            </option>
          ))}
        </select>
        {saving && <span className="text-xs text-tibio">Guardando…</span>}
      </div>
      {error && (
        <p role="alert" className="mt-2  bg-vino/10 px-3 py-2 text-sm text-vino">
          {error}
        </p>
      )}
    </li>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setOrders(null);
    api.admin
      .orders()
      .then((r) => {
        if (!cancelled) setOrders(r);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error desconocido");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (error) {
    return <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  }
  if (orders === null) {
    return <Spinner label="Cargando pedidos…" />;
  }
  if (orders.length === 0) {
    return (
      <p className=" border border-dashed border-tibio/30 bg-white/60 px-6 py-14 text-center text-tibio">
        Aún no hay pedidos en la tienda.
      </p>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-tibio" role="status">
        {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} en total
      </p>
      <ul className="space-y-4">
        {orders.map((o) => (
          <OrderRow key={o.id} order={o} />
        ))}
      </ul>
    </>
  );
}
