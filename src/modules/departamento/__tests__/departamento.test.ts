import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

import type { DepartamentoRepository } from "../repository";
import { DepartamentoService } from "../service";
import { DepartamentoController } from "../controller";
import type { DepartamentoData, DepartamentoListItem } from "../types";

import { errorMiddleware } from "@/middleware/error-middleware";
import { createDbError } from "@/test/utils";

describe("Departamento API", () => {
  let app: Express;
  let mockRepo: DepartamentoRepository;

  const mockDepartamento: DepartamentoData = {
    id: 1,
    nombre: "Departamento de Computación",
    estado: "Activo",
  };

  const mockDepartamentoInactive: DepartamentoData = {
    id: 2,
    nombre: "Departamento de Física",
    estado: "Inactivo",
  };

  const mockDepartamentoListItem: DepartamentoListItem = {
    id: 1,
    nombre: "Departamento de Computación",
  };

  beforeEach(() => {
    mockRepo = {
      findPaginated: vi.fn(),
      findForSelect: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const service = DepartamentoService(mockRepo);
    const controller = DepartamentoController(service);

    app = express();
    app.use(express.json());

    app.get("/departamentos/select", controller.getForSelect);
    app.get("/departamentos/:id", controller.getById);
    app.get("/departamentos", controller.getPaginated);
    app.post("/departamentos", controller.create);
    app.put("/departamentos/:id", controller.update);
    app.delete("/departamentos/:id", controller.delete);

    app.use(errorMiddleware);

    vi.clearAllMocks();
  });

  describe("POST /departamentos - Create", () => {
    it("should return 201 with created departamento on success", async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(mockDepartamento);

      const response = await request(app)
        .post("/departamentos")
        .send({ nombre: "Departamento de Computación", estado: "Activo" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockDepartamento);
      expect(mockRepo.create).toHaveBeenCalledWith({
        nombre: "Departamento de Computación",
        estado: "Activo",
      });
    });

    it("should return 400 VALIDATION_ERROR when nombre is missing", async () => {
      const response = await request(app).post("/departamentos").send({ estado: "Activo" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.message).toBe("Invalid data");
    });

    it("should return 400 VALIDATION_ERROR when nombre is empty string", async () => {
      const response = await request(app)
        .post("/departamentos")
        .send({ nombre: "   ", estado: "Activo" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 409 DUPLICATE when departamento with same nombre already exists", async () => {
      vi.mocked(mockRepo.create).mockRejectedValue(
        createDbError("23505", "departamento_nombre_unique", "departamento"),
      );

      const response = await request(app)
        .post("/departamentos")
        .send({ nombre: "Departamento de Computación", estado: "Activo" });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("DUPLICATE");
      expect(response.body.error.message).toBe("Resource already exists.");
    });

    it("should default estado to Activo when not provided", async () => {
      const defaultEstadoDept = { ...mockDepartamento };
      vi.mocked(mockRepo.create).mockResolvedValue(defaultEstadoDept);

      const response = await request(app)
        .post("/departamentos")
        .send({ nombre: "Departamento de Computación" });

      expect(response.status).toBe(201);
      expect(mockRepo.create).toHaveBeenCalledWith({
        nombre: "Departamento de Computación",
        estado: "Activo",
      });
    });
  });

  describe("GET /departamentos - Get Paginated", () => {
    it("should return 200 with paginated departamentos", async () => {
      vi.mocked(mockRepo.findPaginated).mockResolvedValue({
        data: [mockDepartamento, mockDepartamentoInactive],
        total: 2,
      });

      const response = await request(app).get("/departamentos").query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
      expect(mockRepo.findPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        estado: undefined,
        q: undefined,
      });
    });

    it("should filter by estado when provided", async () => {
      vi.mocked(mockRepo.findPaginated).mockResolvedValue({
        data: [mockDepartamento],
        total: 1,
      });

      const response = await request(app)
        .get("/departamentos")
        .query({ page: 1, limit: 10, estado: "Activo" });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(mockRepo.findPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        estado: "Activo",
        q: undefined,
      });
    });

    it("should apply search query when provided", async () => {
      vi.mocked(mockRepo.findPaginated).mockResolvedValue({
        data: [mockDepartamento],
        total: 1,
      });

      const response = await request(app)
        .get("/departamentos")
        .query({ page: 1, limit: 10, q: "Computación" });

      expect(response.status).toBe(200);
      expect(mockRepo.findPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        estado: undefined,
        q: "Computación",
      });
    });

    it("should return empty array when no departamentos match filters", async () => {
      vi.mocked(mockRepo.findPaginated).mockResolvedValue({
        data: [],
        total: 0,
      });

      const response = await request(app)
        .get("/departamentos")
        .query({ page: 1, limit: 10, estado: "Activo", q: "NonExistent" });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.pagination.totalPages).toBe(0);
    });

    it("should handle pagination correctly for page 2", async () => {
      vi.mocked(mockRepo.findPaginated).mockResolvedValue({
        data: [mockDepartamento],
        total: 15,
      });

      const response = await request(app).get("/departamentos").query({ page: 2, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 15,
        totalPages: 2,
      });
    });
  });

  describe("GET /departamentos/select - Get For Select", () => {
    it("should return 200 with list of active departamentos for dropdown", async () => {
      vi.mocked(mockRepo.findForSelect).mockResolvedValue([
        mockDepartamentoListItem,
        { id: 3, nombre: "Departamento de Matemática" },
      ]);

      const response = await request(app).get("/departamentos/select").query({ estado: "Activo" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual(mockDepartamentoListItem);
      expect(mockRepo.findForSelect).toHaveBeenCalledWith({
        estado: "Activo",
        q: undefined,
      });
    });

    it("should filter select list by search query", async () => {
      vi.mocked(mockRepo.findForSelect).mockResolvedValue([mockDepartamentoListItem]);

      const response = await request(app)
        .get("/departamentos/select")
        .query({ estado: "Activo", q: "Compu" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockRepo.findForSelect).toHaveBeenCalledWith({
        estado: "Activo",
        q: "Compu",
      });
    });

    it("should return empty array when no departamentos match search", async () => {
      vi.mocked(mockRepo.findForSelect).mockResolvedValue([]);

      const response = await request(app)
        .get("/departamentos/select")
        .query({ estado: "Activo", q: "NonExistent" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("GET /departamentos/:id - Get By ID", () => {
    it("should return 200 with departamento when found", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockDepartamento);

      const response = await request(app).get("/departamentos/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDepartamento);
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
    });

    it("should return 404 when departamento not found", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      const response = await request(app).get("/departamentos/999");

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
      expect(response.body.error.message).toContain("Departamento");
      expect(response.body.error.message).toContain("999");
    });

    it("should return 400 when id is invalid format", async () => {
      const response = await request(app).get("/departamentos/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PUT /departamentos/:id - Update", () => {
    it("should return 200 with updated departamento on success", async () => {
      const updated = { ...mockDepartamento, nombre: "Departamento Actualizado" };
      vi.mocked(mockRepo.update).mockResolvedValue(updated);

      const response = await request(app)
        .put("/departamentos/1")
        .send({ nombre: "Departamento Actualizado" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updated);
      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        nombre: "Departamento Actualizado",
      });
    });

    it("should return 404 when departamento not found", async () => {
      vi.mocked(mockRepo.update).mockResolvedValue(null);

      const response = await request(app)
        .put("/departamentos/999")
        .send({ nombre: "Updated Name" });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
      expect(response.body.error.message).toContain("Departamento");
      expect(response.body.error.message).toContain("999");
    });

    it("should allow partial updates", async () => {
      const updated = { ...mockDepartamento, estado: "Inactivo" };
      vi.mocked(mockRepo.update).mockResolvedValue(updated);

      const response = await request(app).put("/departamentos/1").send({ estado: "Inactivo" });

      expect(response.status).toBe(200);
      expect(mockRepo.update).toHaveBeenCalledWith(1, { estado: "Inactivo" });
    });

    it("should return 400 when update data is invalid", async () => {
      const response = await request(app)
        .put("/departamentos/1")
        .send({ nombre: "", estado: "InvalidEstado" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE /departamentos/:id - Delete", () => {
    it("should return 204 with empty body on successful deletion", async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(true);

      const response = await request(app).delete("/departamentos/1");

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should return 404 when departamento not found", async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(false);

      const response = await request(app).delete("/departamentos/999");

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
      expect(response.body.error.message).toContain("Departamento");
    });

    it("should return 409 HAS_DEPENDENCIES when departamento has related records", async () => {
      vi.mocked(mockRepo.delete).mockRejectedValue(
        createDbError("23503", "fk_programa_departamento", "programa"),
      );

      const response = await request(app).delete("/departamentos/1");

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("HAS_DEPENDENCIES");
      expect(response.body.error.message).toContain("Cannot delete: dependent records exist");
    });
  });
});
