const express = require('express');
const request = require('supertest');

jest.mock('../middleware/Authorization', () => ({
  authorization: (req, _res, next) => { req.usuario = { id: 1, rol: req.headers['x-role'] || 'usuario' }; next(); },
  verificarRol: () => (_req, _res, next) => next(),
}));

const mockService = {
  obtenerConsentimientosPorUsuario: jest.fn(),
  obtenerConsentimientosPorCita: jest.fn(),
  crearConsentimiento: jest.fn(),
  eliminarConsentimiento: jest.fn(),
  limpiarConsentimientosPorUsuario: jest.fn(),
  obtenerPorId: jest.fn(),
  generarConsentimientoPDF: jest.fn(),
  actualizarPDFMetadata: jest.fn(),
};
jest.mock('../services/ConsentimientoService', () => mockService);

jest.mock('../models', () => ({
  citas: { findByPk: jest.fn() },
  ordenes: { findByPk: jest.fn() },
  procedimientos: {},
  usuarios: { findByPk: jest.fn() },
}));

jest.mock('../config/cloudinary', () => ({
  utils: { private_download_url: jest.fn(() => 'https://signed.url/file.pdf') },
}));

const Router = require('../routers/ConsentimientoRouters');
const { citas, ordenes, usuarios } = require('../models');

/*
  Propósito del archivo:
  Probar integralmente las rutas de Consentimientos: listado, creación y generación de PDF firmado.

  Cobertura de pruebas:
  - Listado por usuario autenticado.
  - Creación de consentimientos.
  - Generación de PDF con verificación de entidades relacionadas y URL firmada.
*/

describe('Routers de Consentimientos - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apiconsentimiento', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('GET /usuario devuelve lista para el usuario', async () => {
    mockService.obtenerConsentimientosPorUsuario.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).get('/apiconsentimiento/usuario');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test('POST / crea consentimiento y devuelve 201', async () => {
    mockService.crearConsentimiento.mockResolvedValueOnce({ id: 10 });
    const res = await request(app).post('/apiconsentimiento/').send({ id_cita: 1, texto_terminos: 'ok' });
    expect(res.status).toBe(201);
  });

  test('GET /:id/pdf genera URL firmada', async () => {
    mockService.obtenerPorId.mockResolvedValueOnce({ id: 1, id_cita: 2, id_usuario: 3 });
    citas.findByPk.mockResolvedValueOnce({ id: 2, id_orden: 4 });
    usuarios.findByPk.mockResolvedValueOnce({ id: 3 });
    ordenes.findByPk = jest.fn().mockResolvedValueOnce({ id: 4, procedimientos: [] });
    mockService.generarConsentimientoPDF.mockResolvedValueOnce({ publicId: 'abc', url: 'u', hash: 'h' });
    const res = await request(app).get('/apiconsentimiento/1/pdf').set('x-role', 'doctor');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
  });
});
