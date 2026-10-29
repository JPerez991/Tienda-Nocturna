import type { FastifyReply, FastifyRequest } from "fastify";
import { productService } from "./product.service.js";
import { parse } from "../../shared/validation/parse.js";
import { listProductsQuerySchema } from "./product.schemas.js";

export const productController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = parse(listProductsQuerySchema, request.query);
    const result = await productService.list(query);
    return reply.send(result);
  },

  async detail(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const { slug } = request.params;
    const product = await productService.detail(slug);
    return reply.send(product);
  },
};
