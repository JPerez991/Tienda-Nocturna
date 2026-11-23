import { env } from "../../../config/env.js";

// Configuración OAuth2 del panel. Se resuelve por petición para no guardar
// estado entre flujos; las variables se validan una vez al arrancar (env.ts).
// Base del panel, normalizada (sin barra final). Existe aunque falte OAuth.
export function getAdminBaseUrl(): string {
  return env.ADMIN_URL.replace(/\/+$/, "");
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  adminUrl: string;
  allowedEmails: ReadonlySet<string>;
}

// Devuelve null cuando falta CUALQUIER dato necesario, incluida la allowlist.
// Las rutas OAuth responden entonces con not_configured / 503, sin crashear.
export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) return null;

  const allowedEmails = new Set(
    env.ADMIN_GOOGLE_EMAILS.split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
  if (allowedEmails.size === 0) return null;

  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI,
    // Sin barra final: las rutas siempre construyen `${adminUrl}/login...`.
    adminUrl: getAdminBaseUrl(),
    allowedEmails,
  };
}
