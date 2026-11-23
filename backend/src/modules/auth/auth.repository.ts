import { prisma } from "../../shared/prisma.js";

// Capa de acceso a datos (patrón Repository). Solo habla con Prisma/BD.
export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  passwordHash: string;
}

export interface CreateGoogleAdminData {
  email: string;
  googleSub: string;
  firstName: string;
  lastName: string;
  // Hash de una contraseña aleatoria: la cuenta solo entra por Google.
  passwordHash: string;
}

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      // `me` devuelve también lastName y phone (nota 16 del contrato).
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
    });
  },

  findByGoogleSub(googleSub: string) {
    return prisma.user.findUnique({ where: { googleSub } });
  },

  create(data: CreateUserData) {
    return prisma.user.create({ data });
  },

  // Vincula el sub de Google a un usuario ya existente (o lo promueve a ADMIN
  // si su correo está en la allowlist).
  linkGoogleAdmin(id: string, googleSub: string) {
    return prisma.user.update({
      where: { id },
      data: { googleSub, role: "ADMIN" },
    });
  },

  createGoogleAdmin(data: CreateGoogleAdminData) {
    return prisma.user.create({
      data: { ...data, role: "ADMIN" },
    });
  },
};
