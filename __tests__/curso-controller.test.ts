import request from 'supertest';
import express from 'express';
import cursoRouter from '../src/modules/curso/curso-routes';
import { errorHandler } from '../src/middleware/error-handler';  



jest.mock('../src/db/config', () => ({
  db: {}
}));


jest.mock('../src/modules/curso/curso-repository', () => ({
  createCursoRepository: jest.fn(() => ({
    create: jest.fn().mockResolvedValue({
      id: 1,
      sigla: 'CS101',
      nombre: 'Introduction to CS',
      idDepartamento: 1,
      creditaje: 3,
      horas: 4,
      activo: true
    }),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findPaginated: jest.fn()
  }))
}));

const app = express();
app.use(express.json());
app.use('/api', cursoRouter);
app.use(errorHandler); 

describe('POST /api/cursos', () => {
  it('should create a curso with valid data', async () => {
    const response = await request(app)
      .post('/api/cursos')
      .send({
        sigla: 'cs101',
        nombre: 'Introduction to CS',
        idDepartamento: 1,
        creditaje: 3,
        horas: 4,
        activo: true
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('sigla', 'CS101');
  });

  it('should return 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/cursos')
      .send({
        sigla: '',
        nombre: 'Test Course',
        idDepartamento: -1,
      });

    expect(response.status).toBe(400);
  });
});