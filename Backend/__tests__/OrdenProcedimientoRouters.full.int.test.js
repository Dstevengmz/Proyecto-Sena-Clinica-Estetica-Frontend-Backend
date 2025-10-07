const express = require('express');
const request = require('supertest');

jest.mock('../middleware/Authorization', () => ({
  authorization: (_req, _res, next) => next(),
  verificarRol: () => (_req, _res, next) => next(),
}));

const mockService = {
  listarLasOrdenesProcedimientos: jest.fn(),
  buscarLasOrdenesProcedimientos: jest.fn(),
  crearLasOrdenesProcedimientos: jest.fn(),
  actualizarLasOrdenesProcedimientos: jest.fn(),
  eliminarLasOrdenesProcedimientos: jest.fn(),
};
jest.mock('../services/OrdenProcedimientoServices', () => mockService);

const Router = require('../routers/OrdenProcedimientoRouters');

/*
  Propósito del archivo:
  Validar integralmente las rutas de Órdenes de Procedimiento.

  Cobertura de pruebas:
  - Listado general.
  - Búsqueda por id con 404 cuando no existe.
  - Validación de id en edición (400 cuando es inválido).
*/

describe('Routers de Órdenes de Procedimiento - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apiordenprocedimiento', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('GET /listarordenes devuelve lista', async () => {
    mockService.listarLasOrdenesProcedimientos.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).get('/apiordenprocedimiento/listarordenes');
    expect(res.status).toBe(200);
  });

  test('GET /buscarordenes/:id devuelve 404 cuando no existe', async () => {
    mockService.buscarLasOrdenesProcedimientos.mockResolvedValueOnce(null);
    const res = await request(app).get('/apiordenprocedimiento/buscarordenes/9');
    expect(res.status).toBe(404);
  });

  test('PATCH /editarordenes/:id id inválido devuelve 400', async () => {
    const res = await request(app).patch('/apiordenprocedimiento/editarordenes/abc').send({});
    expect(res.status).toBe(400);
  });
});
