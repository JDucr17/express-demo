import type { DepartamentoRepository } from './departamento-repository.js';
import type { DepartamentoData } from './departamento-types.js';


export const createDepartamentoService = (deps: { departamentoRepo: DepartamentoRepository }) => ({
  async getAllDepartamentos(): Promise<DepartamentoData[]> {
    return await deps.departamentoRepo.findAll();
  },
});