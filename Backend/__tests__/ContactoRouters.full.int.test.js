const express = require('express');
const request = require('supertest');

const mockCtrl = { enviar: jest.fn(async (_req, res) => res.json({ ok: true })) };
jest.mock('../controllers/ContactoControllers', () => mockCtrl);

const Router = require('../routers/ContactoRouters');

/*
  Propósito del archivo:
  Pruebas de integración completa para las rutas de Contacto.

  Cobertura de pruebas:
  - POST /contacto -> 200 ok con formato básico.
*/

describe('Routers de Contacto - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apicontacto', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('POST /contacto devuelve ok', async () => {
    const res = await request(app).post('/apicontacto/contacto').send({ nombre: 'a', correo: 'a@a', mensaje: 'hi' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
