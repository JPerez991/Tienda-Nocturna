import { userRepository } from "./auth.repository.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

// Capa de lógica de negocio (patrón Service). No conoce HTTP.
export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new AppError(409, "El correo ya está registrado");

    // Separar la contraseña para no guardarla en claro.
    const { password, ...rest } = input;
    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({ ...rest, passwordHash });

    // Nunca devolvemos el hash.
    return { id: user.id, email: user.email, firstName: user.firstName, role: user.role };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    // Mensaje genérico para no revelar si el correo existe.
    if (!user || !user.isActive) throw new AppError(401, "Credenciales inválidas");

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) throw new AppError(401, "Credenciales inválidas");

    return { id: user.id, firstName: user.firstName, role: user.role };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "Usuario no encontrado");
    return user;
  },
};
