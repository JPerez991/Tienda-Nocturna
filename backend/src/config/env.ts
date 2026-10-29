import "dotenv/config"; // carga backend/.env en process.env (dev). En prod manda el entorno real.
import { z } from "zod";

// Patrón: validación de configuración con Zod.
// Si falta una variable crítica, el servidor NO arranca (falla temprano y claro).

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),

  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  CORS_ORIGIN: z.string().url(),

  WOMPI_PUBLIC_KEY: z.string().min(1),
  WOMPI_PRIVATE_KEY: z.string().min(1),
  WOMPI_WEBHOOK_SECRET: z.string().min(1),
  WOMPI_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
