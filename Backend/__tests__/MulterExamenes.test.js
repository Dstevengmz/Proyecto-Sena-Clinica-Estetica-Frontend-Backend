/*
  Propósito del archivo:
  Validar el cableado del middleware MulterExamenes con CloudinaryStorage, filtros y límites.

  Cobertura de pruebas:
  - Crea upload con fileFilter y limits (10MB).
  - Params: usa 'raw' y private para PDF; 'image' para imágenes.
  - fileFilter: acepta PDF/JPEG y rechaza tipos no permitidos.
*/

describe('MulterExamenes - cableado de middleware', () => {
  let createdStorageOpts;
  beforeAll(() => {
    jest.resetModules();
    jest.doMock('multer', () => jest.fn((opts) => ({ __upload: true, _opts: opts })));
    jest.doMock('multer-storage-cloudinary', () => {
      const CloudinaryStorage = jest.fn(function (opts) {
        createdStorageOpts = opts;
        return this;
      });
      return { CloudinaryStorage };
    });
    jest.doMock('cloudinary', () => ({ v2: { config: jest.fn() } }));
  });

  afterAll(() => {
    jest.dontMock('multer');
    jest.dontMock('multer-storage-cloudinary');
    jest.dontMock('cloudinary');
  });

  test('crea upload con fileFilter y limits; params usa raw para pdf y image para otros', async () => {
    const multer = require('multer');
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const upload = require('../middleware/MulterExamenes');

    // se invocó multer una vez
    expect(multer).toHaveBeenCalledTimes(1);
    const arg = multer.mock.calls[0][0];
    expect(arg).toHaveProperty('storage');
    expect(arg).toHaveProperty('fileFilter');
    expect(arg).toHaveProperty('limits');
    expect(arg.limits).toHaveProperty('fileSize', 10 * 1024 * 1024);

    // CloudinaryStorage creado
    expect(CloudinaryStorage).toHaveBeenCalledTimes(1);
    expect(createdStorageOpts).toHaveProperty('params');
    const paramsFn = createdStorageOpts.params;

    // Caso PDF
    const pdfParams = await paramsFn({}, { mimetype: 'application/pdf', originalname: 'reporte.largo.PDF' });
    expect(pdfParams.folder).toBe('examenes');
    expect(pdfParams.resource_type).toBe('raw');
    expect(pdfParams.type).toBe('private');
    expect(pdfParams.format).toBe('pdf');
    expect(typeof pdfParams.public_id).toBe('string');

    // Caso imagen
    const imgParams = await paramsFn({}, { mimetype: 'image/jpeg', originalname: 'FOTO perfil.jpeg' });
    expect(imgParams.resource_type).toBe('image');
    expect(imgParams.format).toBeUndefined();

    // fileFilter acepta pdf y jpeg
    const resAccept = { ok: false };
    await new Promise((resolve) => arg.fileFilter({}, { mimetype: 'image/jpeg' }, (err, v) => { expect(err).toBeNull(); expect(v).toBe(true); resolve(); }));
    await new Promise((resolve) => arg.fileFilter({}, { mimetype: 'application/pdf' }, (err, v) => { expect(err).toBeNull(); expect(v).toBe(true); resolve(); }));

    // fileFilter rechaza mimetype no permitido
    await new Promise((resolve) => arg.fileFilter({}, { mimetype: 'text/plain' }, (err, v) => { expect(err).toBeInstanceOf(Error); resolve(); }));

    // el upload exportado es objeto tipo middleware de multer mockeado
    expect(upload.__upload).toBe(true);
  });
});
