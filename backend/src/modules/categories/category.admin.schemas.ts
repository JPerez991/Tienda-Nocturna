import { z } from "zod";

// DTO de creación de categorías (sección 6 del contrato).
export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(60),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido: usa minúsculas, números y guiones"),
  imageUrl: z.string().trim().max(500).nullish(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
