import { ZodError, type ZodTypeAny, type output } from "zod";
import { AppError } from "../errors/app-error.js";

// Valida datos de entrada con Zod. Si falla, lanza AppError 400 con detalle.
// Devuelve el tipo de SALIDA del esquema (tras aplicar defaults/coerción).
export function parse<S extends ZodTypeAny>(schema: S, data: unknown): output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(
      400,
      "Datos inválidos",
      (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    );
  }
  return result.data;
}
