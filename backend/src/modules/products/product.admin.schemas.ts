import { z } from "zod";

// DTOs del CRUD de productos del panel admin (sección 6 del contrato).

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido: usa minúsculas, números y guiones");

const productImageSchema = z.object({
  url: z.string().trim().min(1, "La URL de la imagen es obligatoria").max(500),
  alt: z.string().trim().max(200).default(""),
});

const productVariantSchema = z.object({
  sku: z.string().trim().min(1, "Cada variante necesita un SKU").max(40),
  name: z.string().trim().min(1, "Cada variante necesita un nombre").max(60),
  price: z.coerce.number().int().positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").default(0),
});

// Lista de variantes sin SKUs repetidos dentro del mismo producto.
const variantListSchema = z
  .array(productVariantSchema)
  .max(50)
  .superRefine((variants, ctx) => {
    const seen = new Set<string>();
    variants.forEach((variant, index) => {
      if (seen.has(variant.sku)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "sku"],
          message: "SKU repetido en el formulario",
        });
      }
      seen.add(variant.sku);
    });
  });

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  slug: slugSchema,
  description: z.string().trim().max(5000).default(""),
  price: z.coerce.number().int().positive("El precio debe ser mayor a 0"),
  compareAtPrice: z.coerce.number().int().positive().nullish(),
  categoryId: z.string().min(1, "La categoría es obligatoria"),
  images: z.array(productImageSchema).max(10).default([]),
  variants: variantListSchema.default([]),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

// PATCH: los campos presentes se actualizan; los ausentes no se tocan.
// `images` y `variants` sí se interpretan como la lista completa (sync).
export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
