import { PrismaClient } from "@prisma/client";

// Instancia única de Prisma (patrón Singleton) para reutilizar el pool de conexiones.
export const prisma = new PrismaClient();
