import { z } from "zod";

// Query de listado de productos. Los query params llegan como string,
// por eso usamos z.coerce.number() para convertirlos.
export const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  // Orden del catálogo (nota 7 del contrato). Sin `sort` → orden por defecto.
  sort: z.enum(["featured", "newest", "price-asc", "price-desc", "rating"]).optional(),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
