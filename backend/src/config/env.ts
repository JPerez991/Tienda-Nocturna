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

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),

  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  COOKIE_SECURE: booleanString,
  CORS_ORIGIN: z.string().url(),

  WOMPI_PUBLIC_KEY: z.string().min(1),
  WOMPI_PRIVATE_KEY: z.string().min(1),
  // Webhook (eventos) e integridad (firma del checkout): secretos distintos.
  WOMPI_WEBHOOK_SECRET: z.string().min(1),
  WOMPI_INTEGRITY_KEY: z.string().min(1),
  WOMPI_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
