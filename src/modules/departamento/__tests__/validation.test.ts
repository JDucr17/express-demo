import { describe, it, expect } from "vitest";
import { z } from "zod";

import {
  CreateDepartamentoSchema,
  UpdateDepartamentoSchema,
  GetDepartamentosSchema,
  GetDepartamentosListSchema,
} from "../validation";

describe("Departamento Validation Schemas", () => {
  describe("CreateDepartamentoSchema", () => {
    it("should accept valid departamento data", () => {
      const valid = {
        nombre: "Matemática",
        estado: "Activo" as const,
      };
      const result = CreateDepartamentoSchema.parse(valid);
      expect(result).toEqual(valid);
    });

    it("should use default estado when not provided", () => {
      const valid = {
        nombre: "Física",
      };
      const result = CreateDepartamentoSchema.parse(valid);
      expect(result).toEqual({
        nombre: "Física",
        estado: "Activo",
      });
    });

    it("should trim whitespace from nombre", () => {
      const input = {
        nombre: "  Matemática  ",
        estado: "Activo" as const,
      };
      const result = CreateDepartamentoSchema.parse(input);
      expect(result.nombre).toBe("Matemática");
    });

    it("should reject nombre longer than 100 chars", () => {
      const invalid = {
        nombre: "a".repeat(101),
        estado: "Activo" as const,
      };
      expect(() => CreateDepartamentoSchema.parse(invalid)).toThrow(z.ZodError);
    });

    it("should reject empty or whitespace-only nombre", () => {
      const invalid = {
        nombre: "   ",
        estado: "Activo" as const,
      };
      expect(() => CreateDepartamentoSchema.parse(invalid)).toThrow(z.ZodError);
    });

    it("should reject invalid estado value", () => {
      const invalid = {
        nombre: "Matemática",
        estado: "Pendiente",
      } as const;
      expect(() => CreateDepartamentoSchema.parse(invalid)).toThrow(z.ZodError);
    });
  });

  describe("UpdateDepartamentoSchema", () => {
    it("should accept partial update with only nombre", () => {
      const valid = { nombre: "Matemática Aplicada" };
      const result = UpdateDepartamentoSchema.parse(valid);
      expect(result).toEqual(valid);
    });

    it("should accept partial update with only estado", () => {
      const valid = { estado: "Inactivo" as const };
      const result = UpdateDepartamentoSchema.parse(valid);
      expect(result).toEqual(valid);
    });

    it("should accept empty object (no updates)", () => {
      const valid = {};
      const result = UpdateDepartamentoSchema.parse(valid);
      expect(result).toEqual(valid);
    });

    it("should trim whitespace from optional nombre", () => {
      const input = {
        nombre: "  Matemática Aplicada  ",
      };
      const result = UpdateDepartamentoSchema.parse(input);
      expect(result.nombre).toBe("Matemática Aplicada");
    });

    it("should reject invalid values when provided", () => {
      const invalid = {
        nombre: "b".repeat(101),
      };
      expect(() => UpdateDepartamentoSchema.parse(invalid)).toThrow(z.ZodError);
    });
  });

  describe("GetDepartamentosSchema", () => {
    it("should apply pagination defaults", () => {
      const input = {};
      const result = GetDepartamentosSchema.parse(input);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("should accept valid query with pagination and filters", () => {
      const valid = {
        page: 2,
        limit: 50,
        estado: "Activo" as const,
        q: "mate",
      };
      const result = GetDepartamentosSchema.parse(valid);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.estado).toBe("Activo");
    });

    it("should trim search query", () => {
      const input = {
        q: "  física  ",
      };
      const result = GetDepartamentosSchema.parse(input);
      expect(result.q).toBe("física");
    });

    it("should reject invalid pagination", () => {
      const invalid = {
        page: 0,
        limit: 501,
      };
      expect(() => GetDepartamentosSchema.parse(invalid)).toThrow(z.ZodError);
    });

    it("should coerce string numbers to integers", () => {
      const input = {
        page: "3",
        limit: "25",
      };
      const result = GetDepartamentosSchema.parse(input);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });
  });

  describe("GetDepartamentosListSchema", () => {
    it("should use default estado Activo", () => {
      const input = {};
      const result = GetDepartamentosListSchema.parse(input);
      expect(result.estado).toBe("Activo");
    });

    it("should accept search query and custom estado", () => {
      const valid = {
        q: "matemática",
        estado: "Inactivo" as const,
      };
      const result = GetDepartamentosListSchema.parse(valid);
      expect(result.estado).toBe("Inactivo");
    });

    it("should trim search query", () => {
      const input = {
        q: "  química  ",
      };
      const result = GetDepartamentosListSchema.parse(input);
      expect(result.q).toBe("química");
    });
  });
});
