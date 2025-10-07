const express = require('express');
const request = require('supertest');

jest.mock('../middleware/Authorization', () => ({
  authorization: (req, _res, next) => { req.usuario = { id: 7, rol: 'usuario' }; next(); },
  verificarRol: () => (_req, _res, next) => next(),
}));

const mockService = {
  listarOrdenesPorUsuario: jest.fn(),
  listarLasOrdenes: jest.fn(),
  buscarLasOrdenes: jest.fn(),
  crearLasOrdenes: jest.fn(),
  actualizarLasOrdenes: jest.fn(),
  eliminarLasOrdenes: jest.fn(),
  listarOrdenesEvaluacionRealizadaPorUsuario: jest.fn(),
};
jest.mock('../services/OrdenServices', () => mockService);

const Router = require('../routers/OrdenesRouters');

/*
  Propósito del archivo:
  Pruebas de integración completa para las rutas de Órdenes.

  Cobertura de pruebas:
  - GET /misordenes: 200 lista por usuario autenticado.
  - GET /elegibles/:usuarioId: 400 id inválido, 200 lista.
  - PATCH /editarordenes/:id: 400 id inválido y 404 cuando no actualiza.
*/

describe('Routers de Órdenes - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apiordenes', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('GET /misordenes devuelve órdenes del usuario', async () => {
    mockService.listarOrdenesPorUsuario.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).get('/apiordenes/misordenes');
    expect(res.status).toBe(200);
    expect(mockService.listarOrdenesPorUsuario).toHaveBeenCalledWith(7);
  });

  test('GET /elegibles/:usuarioId valida id', async () => {
    let res = await request(app).get('/apiordenes/elegibles/abc');
    expect(res.status).toBe(400);
    mockService.listarOrdenesEvaluacionRealizadaPorUsuario.mockResolvedValueOnce([{ id: 2 }]);
    res = await request(app).get('/apiordenes/elegibles/9');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 2 }]);
  });

  test('PATCH /editarordenes/:id valida id (400) y no encontrado (404)', async () => {
    // 400 por ID inválido
    let res = await request(app).patch('/apiordenes/editarordenes/abc').send({});
    expect(res.status).toBe(400);

    // 404 cuando service devuelve [0]
    mockService.actualizarLasOrdenes.mockResolvedValueOnce([0]);
    res = await request(app).patch('/apiordenes/editarordenes/3').send({});
    expect(res.status).toBe(404);
  });
});
