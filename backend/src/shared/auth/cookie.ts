import { env } from "../../config/env.js";

// Opciones de la cookie de sesión (JWT). Un solo lugar para que el login
// clásico y el login de Google emitan exactamente la misma cookie.
// httpOnly evita que JS lea el token; SameSite=Lax protege contra CSRF.
export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  path: "/",
};
