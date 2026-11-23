import { randomBytes } from "node:crypto";
import { userRepository } from "../auth.repository.js";
import { hashPassword } from "../../../shared/auth/password.js";
import type { GoogleIdentity } from "./google.schemas.js";
import type { GoogleOAuthConfig } from "./google.config.js";

// Lógica de negocio: allowlist + alta/vinculación de administradores.
export const googleAuthService = {
  isAllowedEmail(config: GoogleOAuthConfig, email: string): boolean {
    return config.allowedEmails.has(email.trim().toLowerCase());
  },

  // Busca por sub (cuenta ya vinculada) y, si no, por email (admin existente
  // que ahora entra con Google). Devuelve null si la cuenta está inactiva.
  async findOrCreateAdmin(identity: GoogleIdentity) {
    const existing =
      (await userRepository.findByGoogleSub(identity.sub)) ??
      (await userRepository.findByEmail(identity.email));

    if (existing) {
      if (!existing.isActive) return null;
      if (existing.googleSub !== identity.sub || existing.role !== "ADMIN") {
        await userRepository.linkGoogleAdmin(existing.id, identity.sub);
      }
      return { id: existing.id, role: "ADMIN" as const };
    }

    // passwordHash es obligatorio en el modelo. Se guarda el hash de un valor
    // aleatorio imposible de adivinar: esta cuenta SOLO puede entrar por Google.
    const passwordHash = await hashPassword(randomBytes(32).toString("base64url"));
    const created = await userRepository.createGoogleAdmin({
      email: identity.email,
      googleSub: identity.sub,
      firstName: identity.firstName?.trim() || identity.email.split("@")[0],
      lastName: identity.lastName?.trim() || "Google",
      passwordHash,
    });

    return { id: created.id, role: "ADMIN" as const };
  },
};
