import type { Request, Response } from "express";

import type { DepartamentoService } from "./service";
import {
  CreateDepartamentoSchema,
  UpdateDepartamentoSchema,
  GetDepartamentosSchema,
  GetDepartamentosListSchema,
} from "./validation";
import { departamentoService } from "./service";

import { IdSchema } from "@/shared/validation/common-schemas";

export const DepartamentoController = (service: ReturnType<typeof DepartamentoService>) => ({
  async create(req: Request, res: Response) {
    const data = CreateDepartamentoSchema.parse(req.body);
    const result = await service.createDepartamento(data);
    res.status(201).json(result);
  },

  async getPaginated(req: Request, res: Response) {
    const params = GetDepartamentosSchema.parse(req.query);
    const result = await service.getDepartamentos(params);
    res.json(result);
  },

  async getForSelect(req: Request, res: Response) {
    const params = GetDepartamentosListSchema.parse(req.query);
    const result = await service.getDepartamentosForSelect(params);
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const { id } = IdSchema.parse(req.params);
    const data = UpdateDepartamentoSchema.parse(req.body);
    const updated = await service.updateDepartamento(id, data);
    res.json(updated);
  },

  async delete(req: Request, res: Response) {
    const { id } = IdSchema.parse(req.params);
    await service.deleteDepartamento(id);
    res.status(204).send();
  },

  async getById(req: Request, res: Response) {
    const { id } = IdSchema.parse(req.params);
    const result = await service.getDepartamentoById(id);
    res.json(result);
  },
});

// Instantiate controller
export const departamentoController = DepartamentoController(departamentoService);
