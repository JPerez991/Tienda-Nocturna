import { prisma } from "../../shared/prisma.js";
import type { CreateAddressInput } from "./address.schemas.js";

// Repositorio de direcciones (patrón Repository).
export const addressRepository = {
  findManyByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      // Address no tiene createdAt: el orden lo da el flag de predeterminada
      // y, después, el cuid (cronológico de forma lexicográfica).
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
  },

  countByUser(userId: string) {
    return prisma.address.count({ where: { userId } });
  },

  // Deja todas las direcciones del usuario sin "por defecto".
  clearDefault(userId: string) {
    return prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  },

  create(userId: string, input: CreateAddressInput, isDefault: boolean) {
    return prisma.address.create({
      data: {
        userId,
        alias: input.alias,
        recipient: input.receiverName,
        phone: input.phone,
        direccion: input.line1,
        apartamento: input.line2 ?? null,
        municipio: input.city,
        departamento: input.department,
        codigoPostal: input.postalCode ?? null,
        isDefault,
      },
    });
  },
};
