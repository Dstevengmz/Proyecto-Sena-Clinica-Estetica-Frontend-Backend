/*
  Propósito del archivo:
  Validar el cableado del middleware Multer para Procedimientos con CloudinaryStorage.

  Cobertura de pruebas:
  - Crea upload con storage configurado a carpeta 'procedimientos' y formatos permitidos.
  - Genera public_id como cadena.
*/

describe('Multer (procedimientos) - cableado de middleware', () => {
  beforeAll(() => {
    jest.resetModules();
    jest.doMock('multer', () => jest.fn((opts) => ({ __upload: true, _opts: opts })));
    jest.doMock('multer-storage-cloudinary', () => {
      const CloudinaryStorage = jest.fn(function (opts) {
        this._opts = opts;
        return this; // usado como storage
      });
      return { CloudinaryStorage };
    });
    jest.doMock('../config/cloudinary', () => ({ mocked: 'cloudinary' }));
  });

  afterAll(() => {
    jest.dontMock('multer');
    jest.dontMock('multer-storage-cloudinary');
    jest.dontMock('../config/cloudinary');
  });

  test('crea upload con CloudinaryStorage configurado', () => {
    const multer = require('multer');
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const upload = require('../middleware/Multer');
    expect(upload.__upload).toBe(true);
    expect(multer).toHaveBeenCalledTimes(1);
    const callArg = multer.mock.calls[0][0];
    expect(callArg).toHaveProperty('storage');

    // Validar args de CloudinaryStorage
    expect(CloudinaryStorage).toHaveBeenCalledTimes(1);
    const storageArgs = CloudinaryStorage.mock.calls[0][0];
    expect(storageArgs).toHaveProperty('cloudinary', { mocked: 'cloudinary' });
    expect(storageArgs).toHaveProperty('params');

    // params para procedimientos
    const params = storageArgs.params;
    expect(params.folder).toBe('procedimientos');
    expect(params.allowed_formats).toEqual(expect.arrayContaining(['jpg', 'png', 'jpeg']));
    const publicId = params.public_id({},{ fieldname: 'foto' });
    expect(typeof publicId).toBe('string');
  });
});
