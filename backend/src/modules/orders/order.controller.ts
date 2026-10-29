import type { FastifyReply, FastifyRequest } from "fastify";
import { orderService } from "./order.service.js";
import { parse } from "../../shared/validation/parse.js";
import { checkoutSchema, orderStatusSchema } from "./order.schemas.js";

type Params = { Params: { id: string } };

export const orderController = {
  /* --------- Cliente --------- */

  async checkout(request: FastifyRequest, reply: FastifyReply) {
    const body = parse(checkoutSchema, request.body);
    const result = await orderService.checkout(request.user!.id, body);
    return reply.status(201).send(result);
  },

  async list(request: FastifyRequest, reply: FastifyReply) {
    const orders = await orderService.list(request.user!.id);
    return reply.send(orders);
  },

  async detail(request: FastifyRequest<Params>, reply: FastifyReply) {
    const order = await orderService.detail(request.user!.id, request.params.id);
    return reply.send(order);
  },

  async retryPayment(request: FastifyRequest<Params>, reply: FastifyReply) {
    const result = await orderService.retryPayment(request.user!.id, request.params.id);
    return reply.send(result);
  },

  async cancel(request: FastifyRequest<Params>, reply: FastifyReply) {
    const order = await orderService.cancel(request.user!.id, request.params.id);
    return reply.send(order);
  },

  /* --------- Admin --------- */

  async adminList(_request: FastifyRequest, reply: FastifyReply) {
    const orders = await orderService.adminList();
    return reply.send(orders);
  },

  async adminUpdateStatus(request: FastifyRequest<Params>, reply: FastifyReply) {
    const body = parse(orderStatusSchema, request.body);
    const order = await orderService.adminUpdateStatus(request.params.id, body.status);
    return reply.send(order);
  },
};
