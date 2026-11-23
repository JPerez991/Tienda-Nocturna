import { createHash, randomBytes } from "node:crypto";

// Authorization Code + PKCE (RFC 7636). El navegador solo ve el challenge;
// el verifier viaja en una cookie firmada y se usa una sola vez en el canje.
export function createPkcePair() {
  const state = randomBytes(32).toString("base64url");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  return { state, codeVerifier, codeChallenge };
}
