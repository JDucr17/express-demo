import type { DepartamentoData, DepartamentoListItem } from "./types";
import type { DepartamentoRepository } from "./repository";
import type {
  CreateDepartamentoSchema,
  UpdateDepartamentoSchema,
  GetDepartamentosSchema,
  GetDepartamentosListSchema,
} from "./validation";
import { departamentoRepository } from "./repository";

import { NotFoundError } from "@/errors/app-errors";
import { type PaginatedResponse } from "@/shared/types/pagination";

export const DepartamentoService = (repo: DepartamentoRepository) => ({
  async createDepartamento(data: CreateDepartamentoSchema): Promise<DepartamentoData> {
    return await repo.create({
      nombre: data.nombre,
      estado: data.estado,
    });
  },

  async getDepartamentos(
    params: GetDepartamentosSchema,
  ): Promise<PaginatedResponse<DepartamentoData>> {
    const { data, total } = await repo.findPaginated({
      page: params.page,
      limit: params.limit,
      estado: params.estado,
      q: params.q,
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
  },

  async getDepartamentosForSelect(
    params: GetDepartamentosListSchema,
  ): Promise<DepartamentoListItem[]> {
    return await repo.findForSelect({
      estado: params.estado,
      q: params.q,
    });
  },

  async updateDepartamento(id: number, data: UpdateDepartamentoSchema): Promise<DepartamentoData> {
    const updated = await repo.update(id, data);

    if (!updated) {
      throw new NotFoundError("Departamento", id);
    }

    return updated;
  },

  async deleteDepartamento(id: number): Promise<void> {
    const deleted = await repo.delete(id);

    if (!deleted) {
      throw new NotFoundError("Departamento", id);
    }
  },

  async getDepartamentoById(id: number): Promise<DepartamentoData> {
    const departamento = await repo.findById(id);

    if (!departamento) {
      throw new NotFoundError("Departamento", id);
    }

    return departamento;
  },
});

// Instantiate service
export const departamentoService = DepartamentoService(departamentoRepository);
