import type { FastifyReply, FastifyRequest } from "fastify";
import { questionService } from "./question.service.js";
import { parse } from "../../shared/validation/parse.js";
import { answerQuestionSchema, askQuestionSchema } from "./question.schemas.js";

export const questionController = {
  /* --------- Público --------- */

  async listForProduct(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply,
  ) {
    const questions = await questionService.listForProduct(request.params.slug);
    return reply.send(questions);
  },

  async ask(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const body = parse(askQuestionSchema, request.body);
    const question = await questionService.ask(request.params.slug, request.user!.id, body);
    return reply.status(201).send(question);
  },

  /* --------- Admin --------- */

  async adminList(_request: FastifyRequest, reply: FastifyReply) {
    const questions = await questionService.adminList();
    return reply.send(questions);
  },

  async answer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = parse(answerQuestionSchema, request.body);
    const question = await questionService.answer(request.params.id, body);
    return reply.send(question);
  },
};
