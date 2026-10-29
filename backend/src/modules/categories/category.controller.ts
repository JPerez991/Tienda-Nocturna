import type { FastifyReply, FastifyRequest } from "fastify";
import { categoryService } from "./category.service.js";
import { parse } from "../../shared/validation/parse.js";
import { createCategorySchema } from "./category.admin.schemas.js";

export const categoryController = {
  /* --------- Público --------- */

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const categories = await categoryService.list();
    return reply.send(categories);
  },

  /* --------- Admin --------- */

  async adminList(_request: FastifyRequest, reply: FastifyReply) {
    const categories = await categoryService.listAll();
    return reply.send(categories);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = parse(createCategorySchema, request.body);
    const category = await categoryService.create(body);
    return reply.status(201).send(category);
  },

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await categoryService.remove(request.params.id);
    return reply.status(204).send();
  },
};
