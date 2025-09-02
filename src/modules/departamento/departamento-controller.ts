import type { Request, Response } from 'express';
import type { createDepartamentoService } from './departamento-service.js';


export const createDepartamentoController = (
  departamentoService: ReturnType<typeof createDepartamentoService>
) => ({
  async getAll(req: Request, res: Response) {
    const result = await departamentoService.getAllDepartamentos();
    res.json(result);
  },
});