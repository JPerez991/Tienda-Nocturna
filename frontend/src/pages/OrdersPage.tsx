import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatCOP } from "../lib/format";
import type { Order, OrderStatus } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState, ErrorState, Spinner } from "../components/ui/States";

/** Mapeo estado del pedido → etiqueta + tono del badge. */
export const ESTADO_PEDIDO: Record<OrderStatus, { label: string; tone: "neutral" | "success" | "warning" | "danger" | "info" }> = {
  PENDING: { label: "Pendiente de pago", tone: "warning" },
  PAID: { label: "Pagado", tone: "success" },
  PROCESSING: { label: "En preparación", tone: "info" },
  SHIPPED: { label: "Enviado", tone: "info" },
  DELIVERED: { label: "Entregado", tone: "success" },
  CANCELLED: { label: "Cancelado", tone: "danger" },
  REFUNDED: { label: "Reembolsado", tone: "info" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = ESTADO_PEDIDO[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

export function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  /** Refrescos automáticos mientras haya pagos pendientes (nota c.2). */
  const [intentosConf, setIntentosConf] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setError(null);
    setOrders(null);
    api.orders
      .list()
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
  }, [user, reloadKey]);

  // Wompi puede tardar en notificar tras el retorno: refresca la lista
  // mientras haya pedidos pendientes (máx. 8 refrescos ≈ 2 min; nota c.2).
  const hayPendientes = orders?.some((o) => o.status === "PENDING") ?? false;
  useEffect(() => {
    if (!hayPendientes || intentosConf >= 8) return;
    const t = setTimeout(() => {
      setIntentosConf((i) => i + 1);
      setReloadKey((k) => k + 1);
    }, 15000);
    return () => clearTimeout(t);
  }, [hayPendientes, intentosConf, orders]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Spinner label="Cargando tus pedidos…" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login?redirect=/pedidos" replace />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl font-bold text-carbon">
        Mis pedidos
      </h1>

      {/* Aviso mientras el webhook de Wompi confirma el pago (nota c.2) */}
      {hayPendientes && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2  bg-acento-fondo px-4 py-3 text-sm text-tinta-suave"
        >
          <span
            aria-hidden="true"
            className="inline-block size-2 animate-pulse  bg-acento"
          />
          {intentosConf >= 8
            ? "Algún pedido sigue pendiente de pago. Refresca la página en unos minutos."
            : "Confirmando tu pago… Wompi puede tardar unos segundos; esta lista se actualiza sola."}
        </p>
      )}

      {error ? (
        <ErrorState
          message={error}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : orders === null ? (
        <Spinner label="Cargando tus pedidos…" />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Aún no has comprado"
          description="Cuando hagas tu primer pedido, aparecerá aquí con su estado."
          action={
            <Link to="/catalogo">
              <Button>Ver colección</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                to={`/pedidos/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3  border border-carbon/5 bg-white p-5 transition-all hover:border-acento/40"
              >
                <div>
                  <p className="font-display text-lg font-semibold text-carbon">
                    {o.orderNumber}
                  </p>
                  <p className="text-sm text-tibio">
                    {new Date(o.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={o.status} />
                  <span className="font-display text-lg font-semibold text-tinta">
                    {formatCOP(o.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
