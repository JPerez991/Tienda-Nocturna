import "fastify";

// Tipos de rol que coinciden con el enum Role de Prisma.
type UserRole = "CUSTOMER" | "ADMIN";

declare module "fastify" {
  interface FastifyRequest {
    // Usuario autenticado, adjuntado por el plugin de auth.
    user?: { id: string; role: UserRole };
    // Cuerpo JSON crudo (texto tal cual llegó). Lo llena shared/plugins/raw-body
    // y lo usa la verificación de firma de los webhooks (HMAC sobre el texto).
    rawBody?: string;
  }

  interface FastifyInstance {
    // preHandler: verifica sesión (cookie token) y adjunta request.user.
    authenticate: preHandlerHookHandler;
    // Devuelve un preHandler que además exige un rol específico.
    requireRole: (role: UserRole) => preHandlerHookHandler;
  }
}
