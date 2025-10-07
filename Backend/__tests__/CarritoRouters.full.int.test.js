/*
  Propósito del archivo:
  Validar integralmente las rutas del Carrito (listar, agregar, eliminar y limpiar) con usuario autenticado.

  Cobertura de pruebas:
  - Listado del carrito para un usuario autenticado.
  - Agregar un procedimiento al carrito (201) y estructura de respuesta.
  - Eliminar un elemento del carrito.
  - Limpiar el carrito del usuario.
*/

const express = require('express');
const request = require('supertest');

jest.mock('../middleware/Authorization', () => ({
  authorization: (req, _res, next) => {
    req.usuario = { id: parseInt(req.headers['x-user-id'] || '1', 10), rol: req.headers['x-role'] || 'usuario' };
    next();
  },
  verificarRol: () => (_req, _res, next) => next(),
}));

const mockService = {
  listarCarritoPorUsuario: jest.fn(),
  agregarAlCarrito: jest.fn(),
  eliminarDelCarrito: jest.fn(),
  limpiarCarritoUsuario: jest.fn(),
};
jest.mock('../services/CarritoServices', () => mockService);

const Router = require('../routers/CarritoRouters');

describe('Routers de Carrito - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apicarrito', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('GET /listarmicarrito devuelve lista para usuario autenticado', async () => {
    mockService.listarCarritoPorUsuario.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).get('/apicarrito/listarmicarrito').set('x-user-id', '9');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
    expect(mockService.listarCarritoPorUsuario).toHaveBeenCalledWith(9);
  });

  test('POST /agregaramicarrito devuelve 201 con nuevo elemento', async () => {
    mockService.agregarAlCarrito.mockResolvedValueOnce({ id: 5, id_procedimiento: 3 });
    const res = await request(app).post('/apicarrito/agregaramicarrito').send({ id_procedimiento: 3 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 5);
  });

  test('DELETE /eliminardemicarrito/:id devuelve mensaje', async () => {
    mockService.eliminarDelCarrito.mockResolvedValueOnce(true);
    const res = await request(app).delete('/apicarrito/eliminardemicarrito/2');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
  });

  test('DELETE /limpiarmicarrito devuelve ok', async () => {
    mockService.limpiarCarritoUsuario.mockResolvedValueOnce(true);
    const res = await request(app).delete('/apicarrito/limpiarmicarrito');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
  });
});
