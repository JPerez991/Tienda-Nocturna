import { createRemoteJWKSet, jwtVerify } from "jose";
import type { GoogleOAuthConfig } from "./google.config.js";
import {
  googleIdClaimsSchema,
  googleTokenResponseSchema,
  type GoogleIdentity,
} from "./google.schemas.js";

// Cliente HTTP de Google. Aísla el protocolo OAuth2 del controller.
// Nunca loguea bodies ni tokens (el ID token y el access token son secretos).
const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const TIMEOUT_MS = 10_000;

const jwks = createRemoteJWKSet(new URL(JWKS_URL), {
  cooldownDuration: 30_000,
  timeoutDuration: TIMEOUT_MS,
});

export function buildAuthorizeUrl(
  config: GoogleOAuthConfig,
  state: string,
  codeChallenge: string,
): string {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

// Canjea el code por tokens usando el client_secret y el code_verifier.
export async function exchangeCodeForTokens(input: {
  config: GoogleOAuthConfig;
  code: string;
  codeVerifier: string;
}): Promise<string> {
  const body = new URLSearchParams({
    code: input.code,
    client_id: input.config.clientId,
    client_secret: input.config.clientSecret,
    redirect_uri: input.config.redirectUri,
    grant_type: "authorization_code",
    code_verifier: input.codeVerifier,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error("Google: canje de código rechazado");

  const parsed = googleTokenResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Google: respuesta de token inválida");
  return parsed.data.id_token;
}

// Verifica firma (JWKS de Google), issuer, audience, exp y email_verified.
export async function verifyGoogleIdToken(
  idToken: string,
  config: GoogleOAuthConfig,
): Promise<GoogleIdentity> {
  const { payload } = await jwtVerify(idToken, jwks, {
    algorithms: ["RS256"],
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: config.clientId,
  });

  const claims = googleIdClaimsSchema.parse(payload);
  return {
    sub: claims.sub,
    email: claims.email.trim().toLowerCase(),
    firstName: claims.given_name,
    lastName: claims.family_name,
  };
}
