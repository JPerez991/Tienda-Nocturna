import type { FastifyReply, FastifyRequest } from "fastify";
import { cartService } from "./cart.service.js";
import { parse } from "../../shared/validation/parse.js";
import { addCartItemSchema, updateCartItemSchema } from "./cart.schemas.js";

export const cartController = {
  async get(request: FastifyRequest, reply: FastifyReply) {
    const cart = await cartService.get(request.user!.id);
    return reply.send(cart);
  },

  async add(request: FastifyRequest, reply: FastifyReply) {
    const body = parse(addCartItemSchema, request.body);
    const cart = await cartService.add(request.user!.id, body);
    return reply.send(cart);
  },

  async updateQuantity(
    request: FastifyRequest<{ Params: { itemId: string } }>,
    reply: FastifyReply,
  ) {
    const body = parse(updateCartItemSchema, request.body);
    const cart = await cartService.updateQuantity(request.user!.id, request.params.itemId, body);
    return reply.send(cart);
  },

  async remove(request: FastifyRequest<{ Params: { itemId: string } }>, reply: FastifyReply) {
    await cartService.remove(request.user!.id, request.params.itemId);
    return reply.status(204).send();
  },
};
