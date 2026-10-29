import type { FastifyReply, FastifyRequest } from "fastify";
import { authService } from "./auth.service.js";
import { signToken } from "../../shared/auth/jwt.js";
import { parse } from "../../shared/validation/parse.js";
import { env } from "../../config/env.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

// Opciones de cookie: httpOnly (no accesible desde JS, evita XSS), SameSite.
const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  path: "/",
};

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = parse(registerSchema, request.body);
    const user = await authService.register(body);

    const token = await signToken({ sub: user.id, role: user.role });
    reply.setCookie("token", token, cookieOptions);

    return reply.status(201).send(user);
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = parse(loginSchema, request.body);
    const user = await authService.login(body);

    const token = await signToken({ sub: user.id, role: user.role });
    reply.setCookie("token", token, cookieOptions);

    return reply.status(200).send(user);
  },

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie("token", { path: "/" });
    return reply.status(204).send();
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    // authenticate ya adjuntó request.user.
    const user = await authService.me(request.user!.id);
    return reply.send(user);
  },
};
