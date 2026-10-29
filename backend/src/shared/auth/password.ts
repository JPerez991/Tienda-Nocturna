import { hash, verify } from "@node-rs/argon2";

// Hash de contraseñas con Argon2 (recomendado por OWASP, resistente a GPU/ASIC).
const ARGON2_OPTIONS = {
  memoryCost: 19456, // ~19 MB
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export function verifyPassword(hashed: string, password: string): Promise<boolean> {
  return verify(hashed, password);
}
