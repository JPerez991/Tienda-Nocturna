/**
 * Tipos del contrato API — docs/api-contract.md (fuente de verdad).
 * Si el contrato cambia, se cambia este archivo (no se inventan campos).
 */

/* ---------- Errores ---------- */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
}

/* ---------- Auth ---------- */
export type Role = "CUSTOMER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  /** GET /api/auth/me (nota 16): phone puede ser null si no se registró. */
  lastName?: string;
  phone?: string | null;
  role: Role;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/* ---------- Catálogo ---------- */
export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number; // COP enteros
  compareAtPrice?: number | null; // precio antes del descuento
  category: Category;
  images: ProductImage[];
  rating?: number;
  reviewCount?: number;
}

export interface ProductListResponse {
  items: Product[];
  page: number;
  totalPages: number;
  total: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
}

/** Detalle de producto: el contrato indica que agrega variants[]. */
export interface ProductDetail extends Product {
  description?: string;
  variants: ProductVariant[];
}

/** Orden del catálogo — contrato §7/§8 (`?sort=`; sin parámetro = `newest`). */
export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export interface ProductQuery {
  category?: string; // slug
  q?: string;
  page?: number;
  limit?: number;
  sort?: SortOption;
}

/* ---------- Carrito ---------- */
export interface CartItem {
  id: string; // id del renglón del carrito
  variant: { id: string; name: string; price: number; stock: number };
  product: { name: string; slug: string; imageUrl?: string | null };
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number; // COP enteros
  /** Costo de envío (nota 17): $5.000 fijo; gratis si subtotal ≥ $150.000. */
  shippingCost?: number;
}

/* ---------- Direcciones (sección 7 del contrato) ---------- */
export interface Address {
  id: string;
  /** Etiqueta corta; el backend la pone por defecto "Casa". */
  alias?: string | null;
  receiverName: string;
  phone: string; // exactamente 10 dígitos sin espacios
  line1: string;
  line2?: string | null;
  city: string;
  department: string;
  postalCode?: string | null;
  isDefault?: boolean;
}

/** Body de POST /api/addresses (sección 7). */
export interface AddressInput {
  receiverName: string;
  phone: string; // exactamente 10 dígitos sin espacios
  line1: string;
  line2?: string;
  city: string;
  department: string;
  postalCode?: string;
  alias?: string;
}

/* ---------- Checkout y pedidos ---------- */
/** Enum literal de métodos de pago — confirmado por backend (nota 17). */
export type PaymentMethod =
  | "NEQUI"
  | "DAVIPLATA"
  | "PSE"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANCOLOMBIA";

/** Estados de pago — confirmados por backend (respuesta B.9). */
export type PaymentStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "REFUNDED";

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  subtotal?: number; // COP enteros (backend lo agrega con shippingCost)
  shippingCost?: number; // COP enteros
  total: number;
  payment: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    redirectUrl: string; // checkout.wompi.co
  };
}

/** Respuesta de POST /api/orders/:id/pay (nota 11): reenvía al checkout de Wompi. */
export interface PayResponse {
  redirectUrl?: string;
  payment?: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    redirectUrl?: string;
  };
}

/** Enum canónico de 7 valores — confirmado por backend (respuesta B.8). */
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string; // ISO
}

export interface OrderDetail extends Order {
  /** Desglose oficial (sección 5); si falta, la UI muestra el respaldo calculado. */
  subtotal?: number;
  /** Regla confirmada: $5.000, gratis si subtotal ≥ $150.000 (nota 17). */
  shippingCost?: number;
  /** Descuento aplicado (0 si no hay). */
  discount?: number;
  items: Array<{
    id: string;
    name: string;
    sku?: string;
    unitPrice: number;
    quantity: number;
  }>;
  /** Dirección usada en el envío (sección 5). */
  address?: Address;
  payment?: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
  };
}

/* ---------- Salud ---------- */
export interface HealthResponse {
  status: string;
  timestamp: string;
}

/* ---------- Admin (rol ADMIN) ---------- */
/** Pedido para el panel admin: el contrato solo dice "todos los pedidos".
 * Asumimos que trae además los datos del comprador; se renderiza defensivo. */
export interface AdminOrder extends Order {
  subtotal?: number;
  shippingCost?: number;
  user?: { id: string; email: string; firstName: string; lastName?: string };
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

/** Body para crear/editar productos (forma documentada en api-contract.md). */
export interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId: string;
  images?: ProductImage[];
  variants: Array<{ sku: string; name: string; price: number; stock: number }>;
}

/** Body para crear categorías. */
export interface CategoryInput {
  name: string;
  slug: string;
  imageUrl?: string;
}

export type QuestionStatus = "PENDING" | "ANSWERED";

/** Pregunta de cliente a responder por el admin. */
export interface AdminQuestion {
  id: string;
  question: string;
  answer?: string | null;
  status?: QuestionStatus;
  createdAt: string;
  product: { id: string; name: string; slug: string };
  user?: { firstName: string };
}
