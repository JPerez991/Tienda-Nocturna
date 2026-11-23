import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/app-error.js";
import { parse } from "../../../shared/validation/parse.js";
import { signToken } from "../../../shared/auth/jwt.js";
import { sessionCookieOptions } from "../../../shared/auth/cookie.js";
import { getAdminBaseUrl, getGoogleOAuthConfig } from "./google.config.js";
import { clearOAuthCookies, readOAuthCookie, setOAuthCookies } from "./google.cookies.js";
import { buildAuthorizeUrl, exchangeCodeForTokens, verifyGoogleIdToken } from "./google.client.js";
import { googleAuthService } from "./google.service.js";
import { createPkcePair } from "./pkce.js";
import {
  googleCallbackQuerySchema,
  googleStartQuerySchema,
} from "./google.schemas.js";
import { loginErrorUrl, resolvePanelRedirect, type LoginErrorCode } from "./google.redirect.js";

const NOT_CONFIGURED_MESSAGE = "Google login no está configurado en el servidor";

// Un enlace <a> del panel envía Accept: text/html; un fetch API no.
function wantsHtml(request: FastifyRequest): boolean {
  return (request.headers.accept ?? "").toLowerCase().includes("text/html");
}

// Navegador → pantalla de error del panel. Cliente API → 503 JSON explícito.
function respondNotConfigured(reply: FastifyReply, html: boolean) {
  if (html) return reply.redirect(loginErrorUrl(getAdminBaseUrl(), "not_configured"), 302);
  throw new AppError(503, NOT_CONFIGURED_MESSAGE);
}

export const googleController = {
  start(request: FastifyRequest, reply: FastifyReply) {
    const config = getGoogleOAuthConfig();
    if (!config) return respondNotConfigured(reply, wantsHtml(request));

    const { redirect } = parse(googleStartQuerySchema, request.query);
    const panelPath = resolvePanelRedirect(redirect, config.adminUrl);
    const { state, codeVerifier, codeChallenge } = createPkcePair();

    setOAuthCookies(reply, { state, verifier: codeVerifier, redirect: panelPath });
    return reply.redirect(buildAuthorizeUrl(config, state, codeChallenge), 302);
  },

  async callback(request: FastifyRequest, reply: FastifyReply) {
    const config = getGoogleOAuthConfig();
    if (!config) return respondNotConfigured(reply, wantsHtml(request));

    const query = parse(googleCallbackQuerySchema, request.query);
    const fail = (code: LoginErrorCode = "oauth_failed") => {
      clearOAuthCookies(reply);
      return reply.redirect(loginErrorUrl(config.adminUrl, code), 302);
    };

    // Google envía error=access_denied si el usuario cancela el consentimiento.
    if (query.error || !query.code || !query.state) return fail();

    const storedState = readOAuthCookie(request, "state");
    const codeVerifier = readOAuthCookie(request, "verifier");
    const redirectPath = readOAuthCookie(request, "redirect");
    clearOAuthCookies(reply); // one-time: state y PKCE se consumen aquí.

    if (!storedState || !codeVerifier || storedState !== query.state) return fail();

    try {
      const idToken = await exchangeCodeForTokens({
        config,
        code: query.code,
        codeVerifier,
      });
      const identity = await verifyGoogleIdToken(idToken, config);

      if (!googleAuthService.isAllowedEmail(config, identity.email)) return fail("not_allowed");
      const admin = await googleAuthService.findOrCreateAdmin(identity);
      if (!admin) return fail("not_allowed");

      const token = await signToken({ sub: admin.id, role: admin.role });
      reply.setCookie("token", token, sessionCookieOptions);

      const destination = resolvePanelRedirect(redirectPath ?? "/", config.adminUrl);
      return reply.redirect(`${config.adminUrl}${destination}`, 302);
    } catch {
      // No se filtran motivos: ni respuesta de Google, ni token, ni email.
      return fail();
    }
  },
};
