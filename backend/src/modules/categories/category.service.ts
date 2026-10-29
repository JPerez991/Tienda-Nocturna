import { categoryRepository } from "./category.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { CreateCategoryInput } from "./category.admin.schemas.js";

// Lógica de negocio de categorías (catálogo público + CRUD admin).
export const categoryService = {
  async list() {
    return categoryRepository.findManyActive();
  },

  async listAll() {
    return categoryRepository.findAll();
  },

  async create(input: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(input.slug);
    if (existing) throw new AppError(409, "El slug ya está en uso");
    return categoryRepository.create(input);
  },

  // Borrado físico; solo si no tiene productos asociados (si no, 409).
  async remove(id: string): Promise<void> {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError(404, "Categoría no encontrada");

    const products = await categoryRepository.countProducts(id);
    if (products > 0) {
      throw new AppError(409, "No se puede eliminar: tiene productos asociados");
    }

    await categoryRepository.remove(id);
  },
};
