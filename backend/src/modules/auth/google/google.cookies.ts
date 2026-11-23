import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../../config/env.js";

// Cookies temporarias del flujo OAuth. Firmadas con el secreto de cookies ya
// existente: el navegador no puede alterar state, verifier ni redirect.
const TEMP_MAX_AGE_SECONDS = 10 * 60;

export const OAUTH_COOKIES = {
  state: "google_oauth_state",
  verifier: "google_oauth_verifier",
  redirect: "google_oauth_redirect",
} as const;

const temporaryCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  path: "/",
  maxAge: TEMP_MAX_AGE_SECONDS,
  signed: true,
};

export function setOAuthCookies(
  reply: FastifyReply,
  values: { state: string; verifier: string; redirect: string },
): void {
  reply.setCookie(OAUTH_COOKIES.state, values.state, temporaryCookieOptions);
  reply.setCookie(OAUTH_COOKIES.verifier, values.verifier, temporaryCookieOptions);
  reply.setCookie(OAUTH_COOKIES.redirect, values.redirect, temporaryCookieOptions);
}

// Devuelve null si la cookie falta, está corrupta o su firma no es válida.
export function readOAuthCookie(request: FastifyRequest, name: keyof typeof OAUTH_COOKIES): string | null {
  const raw = request.cookies?.[OAUTH_COOKIES[name]];
  if (!raw) return null;
  const result = request.unsignCookie(raw);
  return result.valid ? result.value : null;
}

export function clearOAuthCookies(reply: FastifyReply): void {
  const options = { path: "/", httpOnly: true, sameSite: "lax" as const, secure: env.COOKIE_SECURE };
  reply.clearCookie(OAUTH_COOKIES.state, options);
  reply.clearCookie(OAUTH_COOKIES.verifier, options);
  reply.clearCookie(OAUTH_COOKIES.redirect, options);
}
