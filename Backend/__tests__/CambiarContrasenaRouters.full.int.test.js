/*
  Propósito del archivo:
  Probar integralmente las rutas de Cambio de Contraseña (cambiar, olvido y reseteo) con usuario autenticado.

  Cobertura de pruebas:
  - POST /cambiarcontrasena: 200 con resultado del servicio.
  - POST /olvidocontrasena: 200 con resultado del servicio.
  - POST /resetearcontrasena/:token: 200 con resultado del servicio.
*/

const express = require('express');
const request = require('supertest');

jest.mock('../middleware/Authorization', () => ({
  authorization: (req, _res, next) => { req.usuario = { id: 3 }; next(); },
}));

const mockService = {
  cambiarcontrasena: jest.fn(),
  solicitarReset: jest.fn(),
  resetearPassword: jest.fn(),
};
jest.mock('../services/CambiarContrasenaServices', () => mockService);

const Router = require('../routers/CambiarContrasenaRouters');

describe('Routers de Cambio de Contraseña - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apicambiarcontrasena', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('POST /cambiarcontrasena devuelve resultado', async () => {
    mockService.cambiarcontrasena.mockResolvedValueOnce({ success: true });
    const res = await request(app).post('/apicambiarcontrasena/cambiarcontrasena').send({ actual: 'a', nueva: 'b' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('POST /olvidocontrasena devuelve resultado', async () => {
    mockService.solicitarReset.mockResolvedValueOnce({ sent: true });
    const res = await request(app).post('/apicambiarcontrasena/olvidocontrasena').send({ correo: 'x@x.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sent', true);
  });

  test('POST /resetearcontrasena/:token devuelve resultado', async () => {
    mockService.resetearPassword.mockResolvedValueOnce({ ok: true });
    const res = await request(app).post('/apicambiarcontrasena/resetearcontrasena/123').send({ nueva: 'c' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
