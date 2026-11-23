import { z } from "zod";

// DTOs (validación Zod) del flujo OAuth2. Nada de esto se confía sin validar.

// Solo rutas relativas del panel: "/pedidos", "/productos?pagina=2".
// Se rechazan URLs absolutas, protocol-relative ("//evil.com"), barras
// invertidas y codificaciones "%2f"/"%5c" para evitar open redirects.
const relativePanelPath = z
  .string()
  .min(1)
  .max(512)
  .startsWith("/", "La ruta debe empezar por /")
  .refine((value) => !value.startsWith("//") && !value.startsWith("/\\"), "No se permiten URLs externas")
  .refine((value) => !/[\\\u0000-\u001F\u007F]/.test(value), "Ruta con caracteres no permitidos")
  .refine((value) => !/%2f|%5c/i.test(value), "Ruta con codificación no permitida");

export const googleStartQuerySchema = z.object({
  redirect: relativePanelPath.optional(),
});

export const googleCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  // Google envía error=access_denied si el usuario cancela el consentimiento.
  error: z.string().optional(),
});

export const googleTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  id_token: z.string().min(1),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
});

export const googleIdClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  // Google lo devuelve como boolean; aceptamos también "true" por robustez.
  email_verified: z.union([z.literal(true), z.literal("true")]),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
});

export interface GoogleIdentity {
  sub: string;
  email: string;
  firstName: string | undefined;
  lastName: string | undefined;
}
