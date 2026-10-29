import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "../lib/api";
import type { Cart } from "../lib/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  /** true mientras se carga el carrito */
  loading: boolean;
  /** número total de unidades (para el contador del header) */
  count: number;
  addItem: (variantId: string, quantity?: number) => Promise<Cart>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setCart(await api.cart.get());
    } catch (err) {
      // 401 (sesión expirada) u otros: no rompemos la UI, solo mostramos vacío.
      if (!(err instanceof ApiError)) console.error(err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return; // esperamos a que AuthContext resuelva /me
    void refresh();
  }, [authLoading, refresh]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      const updated = await api.cart.add(variantId, quantity);
      setCart(updated);
      return updated;
    },
    [],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      try {
        const updated = await api.cart.updateQuantity(itemId, quantity);
        setCart(updated);
      } catch (err) {
        // 400 = stock insuficiente: recargamos el carrito real y re-lanzamos
        // para que la UI muestre el mensaje.
        await refresh();
        throw err;
      }
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await api.cart.remove(itemId);
      // Quitamos el renglón de inmediato (optimista) y luego refrescamos para
      // tener el subtotal exacto que calcula el backend.
      setCart((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) }
          : prev,
      );
      void refresh();
    },
    [refresh],
  );

  const count = useMemo(
    () => cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0,
    [cart],
  );

  const value = useMemo(
    () => ({ cart, loading, count, addItem, updateQuantity, removeItem, refresh }),
    [cart, loading, count, addItem, updateQuantity, removeItem, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
