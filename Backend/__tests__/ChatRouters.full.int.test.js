const express = require('express');
const request = require('supertest');

const mockCtrl = { consultarchat: jest.fn(async (_req, res) => res.json({ ok: true })) };
jest.mock('../controllers/ChatControllers', () => mockCtrl);

const Router = require('../routers/ChatRouters');

/*
  Propósito del archivo:
  Pruebas de integración completa para el Router de Chat (consultar).

  Cobertura de pruebas:
  - POST /consultar -> 200 ok y formato de respuesta.
*/

describe('Routers de Chat - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apichat', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('POST /consultar devuelve ok', async () => {
    const res = await request(app).post('/apichat/consultar').send({ q: 'hola' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
