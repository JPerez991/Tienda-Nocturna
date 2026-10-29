import type {
  AdminOrder,
  AdminQuestion,
  Address,
  AddressInput,
  ApiErrorBody,
  Cart,
  Category,
  CategoryInput,
  CheckoutResponse,
  HealthResponse,
  LoginInput,
  Order,
  OrderDetail,
  OrderStatus,
  PaymentMethod,
  PayResponse,
  Product,
  ProductDetail,
  ProductInput,
  ProductListResponse,
  ProductQuery,
  RegisterInput,
  User,
} from "./types";

/**
 * Cliente HTTP para la API.
 * - Cookies httpOnly (token): siempre credentials: "include".
 * - En dev, Vite proxya /api → localhost:8080 (ver vite.config.ts), así que
 *   las rutas son same-origin y no hay que lidiar con CORS.
 * - Errores normalizados a ApiError con statusCode + message.
 */

const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body as ApiErrorBody | null;
    throw new ApiError(
      res.status,
      err?.message ?? `Error inesperado del servidor (${res.status}).`,
    );
  }

  return body as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

/* Armado de query string según contrato (?category=&q=&page=&limit=) */
function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/* ---------------- API pública ---------------- */

export const api = {
  health: () => get<HealthResponse>("/health"),

  /* Auth */
  auth: {
    me: () => get<User>("/api/auth/me"),
    register: (input: RegisterInput) => post<User>("/api/auth/register", input),
    login: (input: LoginInput) => post<User>("/api/auth/login", input),
    logout: () => post<void>("/api/auth/logout"),
  },

  /* Catálogo público */
  categories: () => get<Category[]>("/api/categories"),
  products: (query: ProductQuery = {}) =>
    get<ProductListResponse>(
      `/api/products${qs({
        category: query.category,
        q: query.q,
        page: query.page,
        limit: query.limit,
        sort: query.sort,
      })}`,
    ),
  product: (slug: string) => get<ProductDetail>(`/api/products/${slug}`),

  /* Carrito (requiere sesión) */
  cart: {
    get: () => get<Cart>("/api/cart"),
    add: (variantId: string, quantity = 1) =>
      post<Cart>("/api/cart", { variantId, quantity }),
    updateQuantity: (itemId: string, quantity: number) =>
      patch<Cart>(`/api/cart/${itemId}`, { quantity }),
    remove: (itemId: string) => del<void>(`/api/cart/${itemId}`),
  },

  /* Direcciones (sección 7; nota 1) */
  addresses: {
    list: () => get<Address[]>("/api/addresses"),
    create: (input: AddressInput) => post<Address>("/api/addresses", input),
  },

  /* Checkout y pedidos */
  checkout: (addressId: string, paymentMethod: PaymentMethod) =>
    post<CheckoutResponse>("/api/orders/checkout", {
      addressId,
      paymentMethod,
    }),
  orders: {
    list: () => get<Order[]>("/api/orders"),
    detail: (id: string) => get<OrderDetail>(`/api/orders/${id}`),
    /** Reintentar pago de pedido PENDING (nota 11). Si devuelve 404, la UI avisa. */
    pay: (id: string) => post<PayResponse>(`/api/orders/${id}/pay`),
  },

  /* Admin (requiere rol ADMIN; el backend aplica requireRole) */
  admin: {
    orders: () => get<AdminOrder[]>("/api/admin/orders"),
    updateOrderStatus: (id: string, status: OrderStatus) =>
      patch<Order>(`/api/admin/orders/${id}/status`, { status }),
    createProduct: (input: ProductInput) =>
      post<Product>("/api/admin/products", input),
    updateProduct: (id: string, input: Partial<ProductInput>) =>
      patch<Product>(`/api/admin/products/${id}`, input),
    createCategory: (input: CategoryInput) =>
      post<Category>("/api/admin/categories", input),
    answerQuestion: (id: string, answer: string) =>
      patch<AdminQuestion>(`/api/admin/questions/${id}`, { answer }),
    // El contrato NO lista GET /api/admin/questions; lo pido en las notas.
    // Si devuelve 404, la UI muestra "módulo no disponible" sin romperse.
    questions: () => get<AdminQuestion[]>("/api/admin/questions"),
  },
};
