import { createCursoService } from '../src/modules/curso/curso-service';
import type { CursoRepository } from '../src/modules/curso/curso-repository';

describe('CursoService - createCurso', () => {
  const mockRepo: Partial<CursoRepository> = {
    create: jest.fn(),
  };

  const service = createCursoService({ cursoRepo: mockRepo as CursoRepository });

  it('should create a curso successfully', async () => {
    const mockCurso = { 
      id: 1, 
      sigla: 'CS101', 
      nombre: 'Intro', 
      idDepartamento: 1, 
      creditaje: 3, 
      horas: 4, 
      activo: true 
    };
    (mockRepo.create as jest.Mock).mockResolvedValue(mockCurso);

    const result = await service.createCurso({
      sigla: 'CS101',
      nombre: 'Intro',
      idDepartamento: 1,
      creditaje: 3,
      horas: 4,
      activo: true,
    });

    expect(result).toEqual({ id: 1, sigla: 'CS101' });
  });

  it('should handle null creditaje', async () => {
    const mockCurso = { 
      id: 2, 
      sigla: 'CS102', 
      nombre: 'Advanced', 
      idDepartamento: 1, 
      creditaje: null, 
      horas: 4, 
      activo: true 
    };
    (mockRepo.create as jest.Mock).mockResolvedValue(mockCurso);

    const result = await service.createCurso({
      sigla: 'CS102',
      nombre: 'Advanced',
      idDepartamento: 1,
      horas: 4,
      activo: true,
    });

    expect(result).toEqual({ id: 2, sigla: 'CS102' });
  });
});