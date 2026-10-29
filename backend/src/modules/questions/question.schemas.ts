import { z } from "zod";

// DTOs del módulo de preguntas y respuestas (Q&A).

export const askQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "La pregunta debe tener al menos 3 caracteres")
    .max(500),
});
export type AskQuestionInput = z.infer<typeof askQuestionSchema>;

export const answerQuestionSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, "La respuesta no puede estar vacía")
    .max(1000),
});
export type AnswerQuestionInput = z.infer<typeof answerQuestionSchema>;
