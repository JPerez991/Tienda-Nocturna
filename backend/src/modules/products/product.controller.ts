import type { FastifyReply, FastifyRequest } from "fastify";
import { productService } from "./product.service.js";
import { parse } from "../../shared/validation/parse.js";
import { listProductsQuerySchema } from "./product.schemas.js";
import { verifyToken } from "../../shared/auth/jwt.js";

// El detalle público oculta los inactivos. El panel admin usa ESTE MISMO
// endpoint (misma cookie httpOnly) y necesita poder editarlos: una sesión
// ADMIN habilita `includeInactive` sin abrir el detalle al público.
async function isAdminSession(request: FastifyRequest): Promise<boolean> {
  const token = request.cookies?.token;
  if (!token) return false;
  try {
    return (await verifyToken(token)).role === "ADMIN";
  } catch {
    return false;
  }
}

export const productController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = parse(listProductsQuerySchema, request.query);
    const result = await productService.list(query);
    return reply.send(result);
  },

  async detail(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const { slug } = request.params;
    const product = await productService.detail(slug, {
      includeInactive: await isAdminSession(request),
    });
    return reply.send(product);
  },
};
