import { describe, it, expect, vi, beforeEach } from "vitest";

import { DepartamentoService } from "../service";
import type { DepartamentoRepository } from "../repository";

import { NotFoundError } from "@/errors/app-errors";

describe("DepartamentoService", () => {
  let mockRepo: DepartamentoRepository;
  let service: ReturnType<typeof DepartamentoService>;

  beforeEach(() => {
    mockRepo = {
      findPaginated: vi.fn(),
      findForSelect: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = DepartamentoService(mockRepo);
    vi.clearAllMocks();
  });

  describe("getDepartamentos", () => {
    it("should return paginated departamentos", async () => {
      const mockDepartamentos = [
        { id: 1, nombre: "Matemática", estado: "Activo" },
        { id: 2, nombre: "Física", estado: "Activo" },
      ];
      mockRepo.findPaginated = vi.fn().mockResolvedValue({
        data: mockDepartamentos,
        total: 2,
      });

      const result = await service.getDepartamentos({
        page: 1,
        limit: 10,
        q: undefined,
      });

      expect(result.data).toEqual(mockDepartamentos);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("should return paginated results with filters", async () => {
      const mockData = [{ id: 1, nombre: "Matemática", estado: "Activo" }];
      mockRepo.findPaginated = vi.fn().mockResolvedValue({
        data: mockData,
        total: 25,
      });

      const result = await service.getDepartamentos({
        page: 2,
        limit: 10,
        estado: "Activo",
        q: "mate",
      });

      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it("should calculate correct total pages", async () => {
      mockRepo.findPaginated = vi.fn().mockResolvedValue({
        data: [],
        total: 15,
      });

      const result = await service.getDepartamentos({
        page: 1,
        limit: 10,
        q: undefined,
      });

      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe("getDepartamentosForSelect", () => {
    it("should return lightweight list for select", async () => {
      const mockData = [
        { id: 1, nombre: "Matemática" },
        { id: 2, nombre: "Física" },
      ];
      mockRepo.findForSelect = vi.fn().mockResolvedValue(mockData);

      const result = await service.getDepartamentosForSelect({
        estado: "Activo",
        q: "mate",
      });

      expect(result).toEqual(mockData);
    });
  });

  describe("getDepartamentoById", () => {
    it("should return departamento when found", async () => {
      const mockDepartamento = {
        id: 1,
        nombre: "Matemática",
        estado: "Activo" as const,
      };
      mockRepo.findById = vi.fn().mockResolvedValue(mockDepartamento);

      const result = await service.getDepartamentoById(1);

      expect(result).toEqual(mockDepartamento);
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundError when departamento not found", async () => {
      mockRepo.findById = vi.fn().mockResolvedValue(null);

      await expect(service.getDepartamentoById(999)).rejects.toThrow(NotFoundError);
      await expect(service.getDepartamentoById(999)).rejects.toThrow("Departamento 999 not found");
    });
  });

  describe("updateDepartamento", () => {
    it("should update departamento successfully", async () => {
      const updateData = { nombre: "Matemática Aplicada" };
      const updated = {
        id: 1,
        nombre: "Matemática Aplicada",
        estado: "Activo" as const,
      };
      mockRepo.update = vi.fn().mockResolvedValue(updated);

      const result = await service.updateDepartamento(1, updateData);

      expect(result).toEqual(updated);
      expect(mockRepo.update).toHaveBeenCalledWith(1, updateData);
    });

    it("should throw NotFoundError when updating non-existent departamento", async () => {
      mockRepo.update = vi.fn().mockResolvedValue(null);

      await expect(service.updateDepartamento(999, { nombre: "Test" })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("deleteDepartamento", () => {
    it("should delete departamento successfully", async () => {
      mockRepo.delete = vi.fn().mockResolvedValue(true);

      await expect(service.deleteDepartamento(1)).resolves.not.toThrow();
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundError when deleting non-existent departamento", async () => {
      mockRepo.delete = vi.fn().mockResolvedValue(false);

      await expect(service.deleteDepartamento(999)).rejects.toThrow(NotFoundError);
      await expect(service.deleteDepartamento(999)).rejects.toThrow("Departamento 999 not found");
    });
  });
});
