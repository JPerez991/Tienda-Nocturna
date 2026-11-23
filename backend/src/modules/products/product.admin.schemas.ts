import { z } from "zod";

// DTOs del CRUD de productos del panel admin (sección 6 del contrato).
// Convenciones del panel ↔ BD: `active` → isActive, `order` → position.

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido: usa minúsculas, números y guiones");

// Fecha ISO 8601 (acepta "Z" o desplazamiento). Se transforma a Date para Prisma.
const offerEndsAtSchema = z
  .string()
  .datetime({ offset: true, message: "offerEndsAt debe ser una fecha ISO 8601" })
  .nullish()
  .transform((value) => (value == null ? value : new Date(value)));

// Mapa libre: el panel activa/desactiva claves según tipoArticulo. El backend
// persiste el mapa tal cual, sin interpretar las claves.
export const fichaTecnicaSchema = z.object({
  marca: z.string().trim().max(80).optional(),
  material: z.string().trim().max(120).optional(),
  genero: z.string().trim().max(80).optional(),
  tipoArticulo: z.string().trim().max(80).optional(),
  atributos: z.record(z.string().trim().min(1), z.string()).default({}),
});
export type FichaTecnica = z.infer<typeof fichaTecnicaSchema>;

const productImageSchema = z.object({
  url: z.string().trim().min(1, "La URL de la imagen es obligatoria").max(500),
  alt: z.string().trim().max(200).default(""),
  order: z.coerce.number().int().min(0, "El orden no puede ser negativo").optional(),
  color: z.string().trim().max(60).nullish(),
  type: z.enum(["image", "video"]).default("image"),
});

const productVariantSchema = z.object({
  sku: z.string().trim().min(1, "Cada variante necesita un SKU").max(40),
  name: z.string().trim().min(1, "Cada variante necesita un nombre").max(60),
  price: z.coerce.number().int().positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").default(0),
  color: z.string().trim().max(60).nullish(),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "colorHex debe tener el formato #RRGGBB")
    .nullish(),
  // Sin `.default(true)`: en PATCH, un `active` ausente NO debe reactivar la
  // variante (las variantes con pedidos se desactivan al salir del formulario).
  active: z.boolean().optional(),
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
  active: z.boolean().optional(),
  offerEndsAt: offerEndsAtSchema,
  fichaTecnica: fichaTecnicaSchema.nullish(),
  images: z.array(productImageSchema).max(10).default([]),
  variants: variantListSchema.default([]),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

// PATCH: los campos presentes se actualizan; los ausentes no se tocan.
// `images` y `variants` sí se interpretan como la lista completa (sync).
export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
