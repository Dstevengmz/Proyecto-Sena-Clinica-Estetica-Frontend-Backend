/*
  Propósito del archivo:
  Validar el Controlador de Consentimientos: listar por usuario/cita, crear, eliminar,
  limpiar y descargar el consentimiento en PDF con metadatos y URL firmada.

  Cobertura de pruebas:
  - Listar por usuario/cita: 200 y 500 en error.
  - Crear consentimiento: 201 ok, 500 en error.
  - Eliminar consentimiento: 200 ok, 500 en error.
  - Limpiar consentimientos: 200 ok, 500 en error.
  - Descargar: 404 en faltantes (consentimiento/cita/usuario/orden), 200 con URL firmada,
    manejo de metadatos (éxito y fallo) y 500 en error al generar PDF.
*/

jest.mock('../services/ConsentimientoService', () => ({
  obtenerConsentimientosPorUsuario: jest.fn(),
  obtenerConsentimientosPorCita: jest.fn(),
  crearConsentimiento: jest.fn(),
  eliminarConsentimiento: jest.fn(),
  limpiarConsentimientosPorUsuario: jest.fn(),
  obtenerPorId: jest.fn(),
  generarConsentimientoPDF: jest.fn(),
  actualizarPDFMetadata: jest.fn(),
}));

jest.mock('../config/cloudinary', () => ({
  utils: {
    private_download_url: jest.fn(() => 'https://download/url.pdf'),
  },
}));

const consentimientoService = require('../services/ConsentimientoService');
const controller = require('../controllers/ConsentimientoControllers');

jest.mock('../models', () => ({
  citas: { findByPk: jest.fn() },
  ordenes: { findByPk: jest.fn() },
  procedimientos: {},
  usuarios: { findByPk: jest.fn() },
}));

const { citas, ordenes, usuarios } = require('../models');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, ip: '127.0.0.1', usuario: { id: 9 }, ...overrides };
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return { req, res };
};

describe('Controlador de Consentimientos', () => {
  beforeEach(() => jest.clearAllMocks());

  test('obtenerConsentimientosPorUsuario -> 200', async () => {
    consentimientoService.obtenerConsentimientosPorUsuario.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes();
    await controller.obtenerConsentimientosPorUsuario(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test('obtenerConsentimientosPorUsuario -> 500 en error', async () => {
    consentimientoService.obtenerConsentimientosPorUsuario.mockRejectedValue(new Error('down'));
    const { req, res } = mockReqRes();
    await controller.obtenerConsentimientosPorUsuario(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener los consentimientos del usuario' });
  });

  test('obtenerConsentimientosPorCita -> 200', async () => {
    consentimientoService.obtenerConsentimientosPorCita.mockResolvedValue([{ id: 2 }]);
    const { req, res } = mockReqRes({ params: { id_cita: 3 } });
    await controller.obtenerConsentimientosPorCita(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 2 }]);
  });

  test('obtenerConsentimientosPorCita -> 500 en error', async () => {
    consentimientoService.obtenerConsentimientosPorCita.mockRejectedValue(new Error('down'));
    const { req, res } = mockReqRes({ params: { id_cita: 3 } });
    await controller.obtenerConsentimientosPorCita(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener los consentimientos de la cita' });
  });

  test('agregarConsentimiento -> 201', async () => {
    consentimientoService.crearConsentimiento.mockResolvedValue({ id: 4 });
    const { req, res } = mockReqRes({ body: { id_cita: 5, texto_terminos: 'ok' } });
    await controller.agregarConsentimiento(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 4 });
    expect(consentimientoService.crearConsentimiento).toHaveBeenCalledWith({
      id_usuario: 9,
      id_cita: 5,
      texto_terminos: 'ok',
      fecha_firma: expect.any(Date),
      ip_firma: '127.0.0.1',
    });
  });

  test('agregarConsentimiento -> 500 en error', async () => {
    consentimientoService.crearConsentimiento.mockRejectedValue(new Error('fail'));
    const { req, res } = mockReqRes({ body: { id_cita: 5, texto_terminos: 'ok' } });
    await controller.agregarConsentimiento(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al agregar el consentimiento' });
  });

  test('eliminarConsentimiento -> 200', async () => {
    const { req, res } = mockReqRes({ params: { id: 7 } });
    await controller.eliminarConsentimiento(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mensaje: 'Consentimiento eliminado' });
    expect(consentimientoService.eliminarConsentimiento).toHaveBeenCalledWith(7);
  });

  test('eliminarConsentimiento -> 500 en error', async () => {
    consentimientoService.eliminarConsentimiento.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes({ params: { id: 7 } });
    await controller.eliminarConsentimiento(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al eliminar el consentimiento' });
  });

  test('limpiarConsentimientos -> 200', async () => {
    const { req, res } = mockReqRes();
    await controller.limpiarConsentimientos(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mensaje: 'Consentimientos limpiados correctamente' });
    expect(consentimientoService.limpiarConsentimientosPorUsuario).toHaveBeenCalledWith(9);
  });

  test('limpiarConsentimientos -> 500 en error', async () => {
    consentimientoService.limpiarConsentimientosPorUsuario.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes();
    await controller.limpiarConsentimientos(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al limpiar los consentimientos' });
  });

  describe('descargarConsentimiento', () => {
    test('404 si consentimiento no existe', async () => {
      consentimientoService.obtenerPorId.mockResolvedValue(null);
      const { req, res } = mockReqRes({ params: { id: 1 } });
      await controller.descargarConsentimiento(req, res);
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Consentimiento no encontrado' });
    });

    test('404 si cita no existe', async () => {
      consentimientoService.obtenerPorId.mockResolvedValue({ id: 1, id_cita: 10, id_usuario: 20 });
      citas.findByPk.mockResolvedValue(null);
      const { req, res } = mockReqRes({ params: { id: 1 } });
      await controller.descargarConsentimiento(req, res);
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Cita asociada no encontrada' });
    });

    test('404 si usuario no existe', async () => {
      consentimientoService.obtenerPorId.mockResolvedValue({ id: 1, id_cita: 10, id_usuario: 20 });
      citas.findByPk.mockResolvedValue({ id: 10, id_orden: 30, id_usuario: 20 });
      usuarios.findByPk.mockResolvedValue(null);
      const { req, res } = mockReqRes({ params: { id: 1 } });
      await controller.descargarConsentimiento(req, res);
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Usuario asociado no encontrado' });
    });

    test('404 si orden no existe', async () => {
      consentimientoService.obtenerPorId.mockResolvedValue({ id: 1, id_cita: 10, id_usuario: 20 });
      citas.findByPk.mockResolvedValue({ id: 10, id_orden: 30, id_usuario: 20 });
      usuarios.findByPk.mockResolvedValue({ id: 20 });
      jest.spyOn(ordenes, 'findByPk').mockResolvedValue(null);
      const { req, res } = mockReqRes({ params: { id: 1 } });
      await controller.descargarConsentimiento(req, res);
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Orden asociada a la cita no encontrada' });
    });

    test('200 devuelve url de descarga cuando todo existe', async () => {
      consentimientoService.obtenerPorId.mockResolvedValue({ id: 1, id_cita: 10, id_usuario: 20 });
      citas.findByPk.mockResolvedValue({ id: 10, id_orden: 30, id_usuario: 20 });
      usuarios.findByPk.mockResolvedValue({ id: 20 });
      jest.spyOn(ordenes, 'findByPk').mockResolvedValue({ id: 30, procedimientos: [{ id: 1 }, { id: 2 }] });
      consentimientoService.generarConsentimientoPDF.mockResolvedValue({ publicId: 'pub', url: 'https://file.pdf', hash: 'abc' });
      consentimientoService.actualizarPDFMetadata.mockResolvedValue(true);

      const { req, res } = mockReqRes({ params: { id: 1 } });
      await controller.descargarConsentimiento(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ url: 'https://download/url.pdf', publicId: 'pub' });
    });

    test('200 y hace warn si no se pueden actualizar metadatos', async () => {
      consentimientoService.obtenerPorId.mockResolvedValue({ id: 1, id_cita: 10, id_usuario: 20 });
      citas.findByPk.mockResolvedValue({ id: 10, id_orden: 30, id_usuario: 20 });
      usuarios.findByPk.mockResolvedValue({ id: 20 });
      jest.spyOn(ordenes, 'findByPk').mockResolvedValue({ id: 30, procedimientos: [] });
      consentimientoService.generarConsentimientoPDF.mockResolvedValue({ publicId: 'pub', url: 'https://file.pdf', hash: 'abc' });
      consentimientoService.actualizarPDFMetadata.mockRejectedValue(new Error('warn'));

      const { req, res } = mockReqRes({ params: { id: 1 } });
      await controller.descargarConsentimiento(req, res);
      expect(res.statusCode).toBe(200);
  // Nota: Si no se pueden actualizar metadatos, aún se entrega una URL firmada (placeholder usado en este flujo)
  expect(res.body).toEqual({ url: 'https://download/url.pdf', publicId: 'pub' });
    });

    test('200 cuando orden.procedimientos no es array (usa [])', async () => {
      consentimientoService.obtenerPorId.mockResolvedValue({ id: 1, id_cita: 10, id_usuario: 20 });
      citas.findByPk.mockResolvedValue({ id: 10, id_orden: 30, id_usuario: 20 });
      usuarios.findByPk.mockResolvedValue({ id: 20 });
      jest.spyOn(ordenes, 'findByPk').mockResolvedValue({ id: 30, procedimientos: null });
      consentimientoService.generarConsentimientoPDF.mockResolvedValue({ publicId: 'pub', url: 'https://file.pdf', hash: 'abc' });
      consentimientoService.actualizarPDFMetadata.mockResolvedValue(true);

      const { req, res } = mockReqRes({ params: { id: 1 } });
      await controller.descargarConsentimiento(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ url: 'https://download/url.pdf', publicId: 'pub' });
    });

    test('500 si falla la generación del PDF (catch global)', async () => {
      consentimientoService.obtenerPorId.mockResolvedValue({ id: 1, id_cita: 10, id_usuario: 20 });
      citas.findByPk.mockResolvedValue({ id: 10, id_orden: 30, id_usuario: 20 });
      usuarios.findByPk.mockResolvedValue({ id: 20 });
      jest.spyOn(ordenes, 'findByPk').mockResolvedValue({ id: 30, procedimientos: [] });
      consentimientoService.generarConsentimientoPDF.mockRejectedValue(new Error('fail'));

      const { req, res } = mockReqRes({ params: { id: 1 } });
      await controller.descargarConsentimiento(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Error al generar el PDF' });
    });
  });
});
//AQui vamos