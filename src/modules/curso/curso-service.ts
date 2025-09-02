import type { CursoRepository } from './curso-repository.js';
import type {
  CreateCursoSchema,
  PaginatedResponse,
  PaginationSchema,
  UpdateCursoSchema,
} from './curso-validation.js';
import { NotFoundError } from '../../shared/app-errors.js';
import type { CursoWithDepartamento } from './curso-types.js';

export const createCursoService = (deps: { cursoRepo: CursoRepository }) => ({
  async createCurso(data: CreateCursoSchema) {
    const curso = await deps.cursoRepo.create({
      sigla: data.sigla,
      nombre: data.nombre,
      idDepartamento: data.idDepartamento,
      creditaje: data.creditaje ?? null,
      horas: data.horas,
      activo: data.activo,
    });

    return {
      id: curso.id,
      sigla: curso.sigla,
    };
  },

  async getAllCursos() {
    return await deps.cursoRepo.findAll();
  },

  async updateCurso(id: number, data: UpdateCursoSchema) {
    const updated = await deps.cursoRepo.update(id, data);

    if (!updated) {
      throw new NotFoundError('Curso', id);
    }

    return updated;
  },

  async deleteCurso(id: number) {
    const deleted = await deps.cursoRepo.delete(id);

    if (!deleted) {
      throw new NotFoundError('Curso', id);
    }
  },

  async getCursosPaginated(
    params: PaginationSchema
  ): Promise<PaginatedResponse<CursoWithDepartamento>> {
    
    const { data, total } = await deps.cursoRepo.findPaginated({
      page: params.page,
      limit: params.limit,
    });

    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
});
