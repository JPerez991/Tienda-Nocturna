import "dotenv/config"; // carga backend/.env en process.env (dev). En prod manda el entorno real.
import { z } from "zod";

// Patrón: validación de configuración con Zod.
// Si falta una variable crítica, el servidor NO arranca (falla temprano y claro).

// z.coerce.boolean() convertiría "false" en true (Boolean("false") === true),
// de modo que el valor del .env nunca podría apagar la cookie segura.
// Se parsea el string explícitamente; en producción debe ir "true".
const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

// Las variables de Google son OPCIONALES: si faltan, el servidor arranca igual
// y las rutas OAuth responden con un error claro (nunca crashean el proceso).
// Un valor vacío en .env se trata como "no configurada".
const optionalNonEmpty = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);
const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),

  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  COOKIE_SECURE: booleanString,
  CORS_ORIGIN: z.string().url(),

  // OAuth2 del panel admin (ver módulo auth/google).
  GOOGLE_CLIENT_ID: optionalNonEmpty,
  GOOGLE_CLIENT_SECRET: optionalNonEmpty,
  GOOGLE_REDIRECT_URI: optionalUrl,
  ADMIN_URL: z.string().url().default("http://localhost:5174"),
  // Correos allowlist separados por comas. Comparación: trim + lowercase.
  ADMIN_GOOGLE_EMAILS: z.string().default(""),

  WOMPI_PUBLIC_KEY: z.string().min(1),
  WOMPI_PRIVATE_KEY: z.string().min(1),
  // Webhook (eventos) e integridad (firma del checkout): secretos distintos.
  WOMPI_WEBHOOK_SECRET: z.string().min(1),
  WOMPI_INTEGRITY_KEY: z.string().min(1),
  WOMPI_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
