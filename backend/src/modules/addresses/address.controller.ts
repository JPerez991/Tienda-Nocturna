import type { FastifyReply, FastifyRequest } from "fastify";
import { addressService } from "./address.service.js";
import { parse } from "../../shared/validation/parse.js";
import { createAddressSchema } from "./address.schemas.js";

export const addressController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const addresses = await addressService.list(request.user!.id);
    // Siempre es un arreglo (posible []); nunca 404.
    return reply.send(addresses);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = parse(createAddressSchema, request.body);
    const address = await addressService.create(request.user!.id, body);
    return reply.status(201).send(address);
  },
};
