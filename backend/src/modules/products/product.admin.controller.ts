import type { FastifyReply, FastifyRequest } from "fastify";
import { productAdminService } from "./product.admin.service.js";
import { productService } from "./product.service.js";
import { parse } from "../../shared/validation/parse.js";
import { createProductSchema, updateProductSchema } from "./product.admin.schemas.js";
import { listProductsQuerySchema } from "./product.schemas.js";

type Params = { Params: { id: string } };

// Rutas admin de productos: mismas formas que el catálogo público.
export const productAdminController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = parse(listProductsQuerySchema, request.query);
    const result = await productService.list(query, { includeInactive: true });
    return reply.send(result);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = parse(createProductSchema, request.body);
    const product = await productAdminService.create(body);
    return reply.status(201).send(product);
  },

  async update(request: FastifyRequest<Params>, reply: FastifyReply) {
    const body = parse(updateProductSchema, request.body);
    const product = await productAdminService.update(request.params.id, body);
    return reply.send(product);
  },

  async remove(request: FastifyRequest<Params>, reply: FastifyReply) {
    await productAdminService.remove(request.params.id);
    return reply.status(204).send();
  },
};
