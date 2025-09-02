export interface DepartamentoData {
  id: number;
  nombre: string;
}

export type CreateDepartamentoData = Omit<DepartamentoData, 'id'>;

export type UpdateDepartamentoData = Partial<Omit<DepartamentoData, 'id'>>;