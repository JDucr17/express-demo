import type { Request, Response } from 'express';
import { CreateCursoSchema, PaginationSchema, UpdateCursoSchema } from './curso-validation.js';
import type { createCursoService } from './curso-service.js';

export const createCursoController = (cursoService: ReturnType<typeof createCursoService>) => ({
  async create(req: Request, res: Response) {
    const data = CreateCursoSchema.parse(req.body);
    const result = await cursoService.createCurso(data);
    res.status(201).json(result);
  },

  async getAll(req:Request, res:Response){
    const result = await cursoService.getAllCursos();
    res.json(result);
  },

  async getPaginated(req: Request, res: Response) {
    const params = PaginationSchema.parse(req.query);
    const result = await cursoService.getCursosPaginated(params);
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = UpdateCursoSchema.parse(req.body);
    const updated = await cursoService.updateCurso(id, data);
    res.json(updated);
  },

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await cursoService.deleteCurso(id);
    res.status(204).send();
  },
});
