import { z } from "zod";

// DTOs de entrada para autenticación. Se validan antes de tocar el negocio.

export const registerSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  // Teléfono colombiano: 10 dígitos (requiere para Nequi/Daviplata luego).
  phone: z
    .string()
    .regex(/^\d{10}$/, "El teléfono debe tener 10 dígitos")
    .optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
export type LoginInput = z.infer<typeof loginSchema>;
