/**
 * Domain types for Departamento module
 * These represent the data contracts as stored in the database
 * These types are used in the repository layer to guarantee type safe operations
 */

export interface DepartamentoData {
  id: number;
  nombre: string;
  estado: string;
}

export interface DepartamentoListItem {
  id: number;
  nombre: string;
}

export type CreateDepartamentoData = Omit<DepartamentoData, "id">;

export type UpdateDepartamentoData = Partial<Omit<DepartamentoData, "id">>;
