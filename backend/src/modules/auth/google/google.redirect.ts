import { AppError } from "../../../shared/errors/app-error.js";

export type LoginErrorCode = "not_configured" | "oauth_failed" | "not_allowed";

// Segunda barrera contra open redirects: la URL final debe seguir en el origen
// del panel, aunque la cookie firmada hubiera sido manipulada de algún modo.
export function resolvePanelRedirect(redirect: string | undefined, adminUrl: string): string {
  if (!redirect) return "/";
  const base = new URL(adminUrl);
  const target = new URL(redirect, base);
  if (target.origin !== base.origin) {
    throw new AppError(400, "La ruta de redirección debe ser relativa al panel");
  }
  return `${target.pathname}${target.search}${target.hash}`;
}

export function loginErrorUrl(adminUrl: string, code: LoginErrorCode): string {
  return `${adminUrl}/login?error=${code}`;
}
