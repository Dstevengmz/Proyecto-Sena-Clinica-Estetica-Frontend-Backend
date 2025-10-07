const express = require('express');
const request = require('supertest');

jest.mock('../middleware/Authorization', () => ({
  authorization: (_req, _res, next) => next(),
  verificarRol: () => (_req, _res, next) => next(),
}));

jest.mock('../middleware/PrimeraMayusculaCategoria', () => ({
  middleware: (_req, _res, next) => next(),
}));

const mockService = {
  listarLasCategorias: jest.fn(),
  buscarLaCategoria: jest.fn(),
  crearLaCategoria: jest.fn(),
  actualizarLaCategoria: jest.fn(),
  eliminarLaCategoria: jest.fn(),
};
jest.mock('../services/CategoriaProcedimientosServices', () => mockService);

const Router = require('../routers/CategoriaProcedimientosRouters');

/*
  Propósito del archivo:
  Pruebas de integración completa para las rutas de Categoría de Procedimientos.

  Cobertura de pruebas:
  - GET listar/buscar: 200 y 404.
  - POST crear: 201 y normalización de estado string.
  - PATCH editar: validación de ID y 404 cuando no existe.
  - DELETE eliminar: 404 cuando no existe.
*/

describe('Routers de Categoría de Procedimientos - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apicategoriaprocedimientos', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('GET /listarcategorias devuelve lista', async () => {
    mockService.listarLasCategorias.mockResolvedValueOnce([{ id: 1, nombre: 'Facial' }]);
    const res = await request(app).get('/apicategoriaprocedimientos/listarcategorias');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, nombre: 'Facial' }]);
  });

  test('GET /buscarcategoria/:id devuelve 404 cuando no existe', async () => {
    mockService.buscarLaCategoria.mockResolvedValueOnce(null);
    const res = await request(app).get('/apicategoriaprocedimientos/buscarcategoria/99');
    expect(res.status).toBe(404);
  });

  test('POST /crearcategoria devuelve 201 y normaliza estado string', async () => {
    mockService.crearLaCategoria.mockImplementation(async (payload) => ({ id: 9, ...payload }));
    const res = await request(app).post('/apicategoriaprocedimientos/crearcategoria').send({ nombre: 'Corporal', estado: 'true' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(mockService.crearLaCategoria).toHaveBeenCalledWith({ nombre: 'Corporal', estado: true });
  });

  test('PATCH /editarcategoria/:id valida id y devuelve 400 si inválido', async () => {
    const res = await request(app).patch('/apicategoriaprocedimientos/editarcategoria/abc').send({});
    expect(res.status).toBe(400);
  });

  test('PATCH /editarcategoria/:id devuelve 404 cuando no existe', async () => {
    mockService.buscarLaCategoria.mockResolvedValueOnce(null);
    const res = await request(app).patch('/apicategoriaprocedimientos/editarcategoria/1').send({});
    expect(res.status).toBe(404);
  });

  test('DELETE /eliminarcategoria/:id devuelve 404 cuando no existe', async () => {
    mockService.eliminarLaCategoria.mockResolvedValueOnce(false);
    const res = await request(app).delete('/apicategoriaprocedimientos/eliminarcategoria/2');
    expect(res.status).toBe(404);
  });
});
