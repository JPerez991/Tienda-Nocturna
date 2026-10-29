import { questionRepository } from "./question.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { AnswerQuestionInput, AskQuestionInput } from "./question.schemas.js";

type QuestionWithProduct = Awaited<ReturnType<typeof questionRepository.findAll>>[number];
type QuestionRecord = NonNullable<Awaited<ReturnType<typeof questionRepository.findById>>>;

// El modelo guarda la pregunta en `content` y el nombre público en `author`;
// el contrato (y el FRONTEND) esperan `question` y `user.firstName`.
// Este archivo es el ÚNICO lugar donde se traduce ese mapeo.
function toAdminDto(question: QuestionWithProduct) {
  return {
    id: question.id,
    question: question.content,
    answer: question.answer,
    status: question.status,
    createdAt: question.createdAt,
    product: question.product,
    user: { firstName: question.author },
  };
}

function toPublicDto(question: QuestionRecord) {
  return {
    id: question.id,
    question: question.content,
    answer: question.answer,
    status: question.status,
    createdAt: question.createdAt,
    answeredAt: question.answeredAt,
    user: { firstName: question.author },
  };
}

// Lógica de negocio del Q&A (público + admin).
export const questionService = {
  async adminList() {
    const questions = await questionRepository.findAll();
    return questions.map(toAdminDto);
  },

  async answer(id: string, input: AnswerQuestionInput) {
    const existing = await questionRepository.findById(id);
    if (!existing) throw new AppError(404, "Pregunta no encontrada");

    const updated = await questionRepository.answer(id, input.answer);
    return toAdminDto(updated);
  },

  // Preguntas respondidas de un producto (público, sin sesión).
  async listForProduct(slug: string) {
    const product = await questionRepository.findProductBySlug(slug);
    if (!product) throw new AppError(404, "Producto no encontrado");

    const questions = await questionRepository.findAnsweredBySlug(slug);
    return questions.map(toPublicDto);
  },

  // El cliente pregunta con sesión: se guarda su nombre público.
  async ask(slug: string, userId: string, input: AskQuestionInput) {
    const product = await questionRepository.findProductBySlug(slug);
    if (!product) throw new AppError(404, "Producto no encontrado");

    const author = await questionRepository.findAuthor(userId);
    const created = await questionRepository.create(
      product.id,
      author?.firstName ?? "Cliente",
      input.question,
    );
    return toPublicDto(created);
  },
};
