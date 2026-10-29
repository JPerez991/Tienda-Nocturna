import type { FastifyInstance, FastifyError } from "fastify";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "./app-error.js";

// Manejador global de errores. Nunca filtra detalles internos al cliente.
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    // 1) Error de validación Zod (lanzado por el helper parse)
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Datos inválidos",
        details: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }

    // 2) Error de aplicación con código HTTP conocido
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.statusCode >= 500 ? "Internal Server Error" : "Error",
        message: error.message,
        details: error.details,
      });
    }

    // 3) Restricción única de Prisma (email duplicado, etc.)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return reply.status(409).send({
        statusCode: 409,
        error: "Conflict",
        message: "El recurso ya existe",
      });
    }

    // 4) Errores de validación nativos de Fastify
    if ("validation" in error) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Datos inválidos",
      });
    }

    // 5) Cualquier otro error: loguear en servidor, responder genérico.
    _request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Error interno del servidor",
    });
  });
}
