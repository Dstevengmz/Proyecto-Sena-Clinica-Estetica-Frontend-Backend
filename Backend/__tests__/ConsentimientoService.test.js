jest.mock('../models', () => ({ consentimiento: { create: jest.fn(), findAll: jest.fn(), destroy: jest.fn(), update: jest.fn(), findByPk: jest.fn() } }));
jest.mock('pdfkit', () => jest.fn().mockImplementation(() => {
  const handlers = {};
  return {
    on: (ev, cb) => { handlers[ev] = cb; },
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    end: jest.fn().mockImplementation(() => { if (handlers['end']) handlers['end'](); }),
  };
}));
jest.mock('crypto', () => ({ createHash: jest.fn(() => ({ update: jest.fn().mockReturnThis(), digest: jest.fn(() => 'hash123') })) }));
jest.mock('../config/cloudinary', () => ({ uploader: { upload_stream: jest.fn((opts, cb) => ({ end: () => cb(null, { public_id: 'consent/1', secure_url: 'https://x/1.pdf' }) })) } }));

const models = require('../models');
const ConsentimientoService = require('../services/ConsentimientoService');

/*
  Propósito del archivo:
  Validar la capa de Servicios de Consentimientos: CRUD, generación de PDF y actualización de metadatos.

  Cobertura de pruebas:
  - CRUD: crear/listar/eliminar/limpiar y obtenerPorId delegan al modelo correctamente.
  - generarConsentimientoPDF: compone el documento, sube a Cloudinary y retorna metadatos.
  - actualizarPDFMetadata: actualiza ruta y hash del PDF.
*/

describe('Servicios de Consentimientos', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('CRUD delegations', async () => {
    models.consentimiento.create.mockResolvedValue({ id: 1 });
    expect(await ConsentimientoService.crearConsentimiento({ a: 1 })).toEqual({ id: 1 });
    expect(models.consentimiento.create).toHaveBeenCalledWith({ a: 1 });

    models.consentimiento.findAll.mockResolvedValue([{ id: 2 }]);
    expect(await ConsentimientoService.obtenerConsentimientosPorUsuario(5)).toEqual([{ id: 2 }]);
    expect(models.consentimiento.findAll).toHaveBeenCalledWith({ where: { id_usuario: 5 } });

    expect(await ConsentimientoService.obtenerConsentimientosPorCita(9)).toEqual([{ id: 2 }]);
    expect(models.consentimiento.findAll).toHaveBeenCalledWith({ where: { id_cita: 9 } });

    models.consentimiento.destroy.mockResolvedValue(1);
    expect(await ConsentimientoService.eliminarConsentimiento(7)).toBe(1);
    expect(models.consentimiento.destroy).toHaveBeenCalledWith({ where: { id: 7 } });

    expect(await ConsentimientoService.limpiarConsentimientosPorUsuario(3)).toBe(1);
    expect(models.consentimiento.destroy).toHaveBeenCalledWith({ where: { id_usuario: 3 } });
  });

  test('generarConsentimientoPDF compone PDF, sube a cloudinary y retorna metadata', async () => {
    const result = await ConsentimientoService.generarConsentimientoPDF(
      { id: 1, texto_terminos: 't', fecha_firma: '2025-10-05', ip_firma: '1.2.3.4' },
      { id: 2, fecha: '2025-10-05', id_doctor: 7 },
      { id: 3 },
      { nombre: 'User', tipodocumento: 'CC', numerodocumento: '123', correo: 'a@b.com' },
      [{ nombre: 'Proc', precio: 100 }]
    );
    expect(result).toEqual({ publicId: 'consent/1', url: 'https://x/1.pdf', hash: 'hash123' });
  });

  test('actualizarPDFMetadata y obtenerPorId delegan al modelo', async () => {
    await ConsentimientoService.actualizarPDFMetadata(1, 'ruta.pdf', 'h');
    expect(models.consentimiento.update).toHaveBeenCalledWith({ ruta_pdf: 'ruta.pdf', hash_pdf: 'h' }, { where: { id: 1 } });

    models.consentimiento.findByPk.mockResolvedValue({ id: 5 });
    expect(await ConsentimientoService.obtenerPorId(5)).toEqual({ id: 5 });
    expect(models.consentimiento.findByPk).toHaveBeenCalledWith(5);
  });
});
