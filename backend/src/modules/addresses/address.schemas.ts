import { z } from "zod";

// DTO de entrada para crear una dirección de envío (Colombia).
// La API expone nombres en inglés (contrato con el FRONTEND); el mapeo a las
// columnas en español del modelo Address vive en address.service.ts.

export const createAddressSchema = z.object({
  alias: z.string().trim().min(1).max(30).default("Casa"),
  receiverName: z
    .string()
    .trim()
    .min(1, "El nombre de quien recibe es obligatorio")
    .max(80),
  phone: z
    .string()
    .regex(/^\d{10}$/, "El teléfono debe tener 10 dígitos (sin espacios)"),
  line1: z.string().trim().min(1, "La dirección es obligatoria").max(120),
  line2: z.string().trim().max(120).nullish(),
  city: z.string().trim().min(1, "La ciudad es obligatoria").max(60),
  department: z.string().trim().min(1, "El departamento es obligatorio").max(60),
  postalCode: z.string().trim().max(10).nullish(),
  isDefault: z.boolean().optional().default(false),
});
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
