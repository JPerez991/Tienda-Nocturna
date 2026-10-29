import { prisma } from "../../shared/prisma.js";

// Capa de acceso a datos (patrón Repository). Solo habla con Prisma/BD.
export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
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

  create(data: CreateUserData) {
    return prisma.user.create({ data });
  },
};
