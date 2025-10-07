const express = require('express');
const request = require('supertest');

jest.mock('../middleware/Authorization', () => ({
  authorization: (req, _res, next) => { req.usuario = { id: 1, rol: req.headers['x-role'] || 'doctor' }; next(); },
  verificarRol: () => (_req, _res, next) => next(),
}));

jest.mock('../middleware/MulterExamenes', () => ({
  array: () => (_req, _res, next) => next(),
}));

const mockService = {
  subirArchivos: jest.fn(),
  listarPorCita: jest.fn(),
  eliminar: jest.fn(),
};
jest.mock('../services/ExamenServices', () => mockService);

jest.mock('../models', () => ({
  examen: { findByPk: jest.fn() },
  citas: { findByPk: jest.fn() },
}));

jest.mock('cloudinary', () => ({
  v2: { utils: {}, url: jest.fn(() => 'https://image.signed'),
    utils: { private_download_url: jest.fn(() => 'https://pdf.signed') } },
}));

const Router = require('../routers/ExamenRouters');
const { examen, citas } = require('../models');

/*
  Propósito del archivo:
  Validar integralmente las rutas de Exámenes (subida, listado, borrado y descarga segura).

  Cobertura de pruebas:
  - Carga de archivos asociada a una cita.
  - Listado por id de cita.
  - Eliminación con manejo de 404 cuando no existe.
  - Descarga validando permisos (doctor/propietario) y URL firmada.
*/

describe('Routers de Exámenes - integración completa', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/apiexamenes', Router);
  });
  beforeEach(() => jest.clearAllMocks());

  test('POST /subir/:id_cita devuelve 201 con datos', async () => {
    mockService.subirArchivos.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).post('/apiexamenes/subir/3');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('examenes');
  });

  test('GET /cita/:id_cita devuelve lista', async () => {
    mockService.listarPorCita.mockResolvedValueOnce([{ id: 2 }]);
    const res = await request(app).get('/apiexamenes/cita/9');
    expect(res.status).toBe(200);
  });

  test('DELETE /:id devuelve 404 si no existe', async () => {
    mockService.eliminar.mockResolvedValueOnce(false);
    const res = await request(app).delete('/apiexamenes/1');
    expect(res.status).toBe(404);
  });

  test('GET /descargar/:id devuelve URL firmada cuando está autorizado', async () => {
    examen.findByPk.mockResolvedValueOnce({ id: 1, id_cita: 5, archivo_examen: 'file.pdf' });
    citas.findByPk.mockResolvedValueOnce({ id: 5, id_doctor: 1, id_usuario: 2 });
    const res = await request(app).get('/apiexamenes/descargar/1').set('x-role', 'doctor');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
  });
});
