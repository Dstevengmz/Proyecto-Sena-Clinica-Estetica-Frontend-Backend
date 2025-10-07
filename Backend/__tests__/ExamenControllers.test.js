/*
  Propósito del archivo:
  Validar el Controlador de Exámenes: subir, listar, eliminar y descarga segura.

  Cobertura de pruebas:
  - Subir: 201 en éxito y 400 cuando falla el servicio o faltan archivos.
  - Listar por cita: 200 y 500 en error.
  - Eliminar: 404 cuando no existe, 200 cuando elimina, 500 en error.
  - Descargar seguro: 404 sin registro, 403 sin autorización, 200 con URL firmada (pdf) o imagen.
*/

jest.mock('../services/ExamenServices', () => ({
  subirArchivos: jest.fn(),
  listarPorCita: jest.fn(),
  eliminar: jest.fn(),
}));

jest.mock('cloudinary', () => ({
  v2: {
    utils: { private_download_url: jest.fn(() => 'https://signed/pdf') },
    url: jest.fn(() => 'https://signed/image'),
  },
}));

jest.mock('../models', () => ({
  examen: { findByPk: jest.fn() },
  citas: { findByPk: jest.fn() },
}));

const examenService = require('../services/ExamenServices');
const controller = require('../controllers/ExamenControllers');
const { examen, citas } = require('../models');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, files: [], usuario: { id: 1, rol: 'usuario' }, ...overrides };
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, val) { this.headers[name] = val; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    end() { this.ended = true; },
  };
  return { req, res };
};

describe('Controlador de Exámenes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('subir -> 201 y 400', async () => {
    examenService.subirArchivos.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes({ params: { id_cita: 9 }, files: [{ path: '/a' }] });
    await controller.subir(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(201);
    expect(ctx.res.body.examenes).toEqual([{ id: 1 }]);

    examenService.subirArchivos.mockRejectedValue(new Error('bad'));
    ctx = mockReqRes({ params: { id_cita: 9 }, files: [] });
    await controller.subir(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
  });

  test('listarPorCita -> 200 y 500', async () => {
    examenService.listarPorCita.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes({ params: { id_cita: 2 } });
    await controller.listarPorCita(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    examenService.listarPorCita.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id_cita: 2 } });
    await controller.listarPorCita(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('eliminar -> 404, 200 y 500', async () => {
    examenService.eliminar.mockResolvedValue(false);
    let ctx = mockReqRes({ params: { id: 3 } });
    await controller.eliminar(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    examenService.eliminar.mockResolvedValue(true);
    ctx = mockReqRes({ params: { id: 3 } });
    await controller.eliminar(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    examenService.eliminar.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 3 } });
    await controller.eliminar(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('descargarSeguro -> autorización y tipos de URL', async () => {
    // no registro
    examen.findByPk.mockResolvedValue(null);
    let ctx = mockReqRes({ params: { id: 5 }, usuario: { id: 10, rol: 'usuario' } });
    await controller.descargarSeguro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    // registro y cita, pero no autorizado
    examen.findByPk.mockResolvedValue({ id: 5, id_cita: 7, archivo_examen: 'file.pdf' });
    citas.findByPk.mockResolvedValue({ id: 7, id_usuario: 99, id_doctor: 55 });
    ctx = mockReqRes({ params: { id: 5 }, usuario: { id: 10, rol: 'usuario' } });
    await controller.descargarSeguro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(403);

    // autorizado paciente y legacy http
    examen.findByPk.mockResolvedValue({ id: 5, id_cita: 7, archivo_examen: 'http://legacy/url' });
    citas.findByPk.mockResolvedValue({ id: 7, id_usuario: 10, id_doctor: 55 });
    ctx = mockReqRes({ params: { id: 5 }, usuario: { id: 10, rol: 'usuario' } });
    await controller.descargarSeguro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    expect(ctx.res.body).toEqual({ url: 'http://legacy/url', legacy: true });

    // autorizado doctor y archivo pdf
    examen.findByPk.mockResolvedValue({ id: 5, id_cita: 7, archivo_examen: 'folder/file.pdf' });
    citas.findByPk.mockResolvedValue({ id: 7, id_usuario: 10, id_doctor: 55 });
    ctx = mockReqRes({ params: { id: 5 }, usuario: { id: 55, rol: 'doctor' } });
    await controller.descargarSeguro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    expect(ctx.res.body.url).toBe('https://signed/pdf');

    // autorizado asistente y archivo imagen
    examen.findByPk.mockResolvedValue({ id: 5, id_cita: 7, archivo_examen: 'folder/image.png' });
    citas.findByPk.mockResolvedValue({ id: 7, id_usuario: 10, id_doctor: 55 });
    ctx = mockReqRes({ params: { id: 5 }, usuario: { id: 1, rol: 'asistente' } });
    await controller.descargarSeguro(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    expect(ctx.res.body.url).toBe('https://signed/image');
  });
});
