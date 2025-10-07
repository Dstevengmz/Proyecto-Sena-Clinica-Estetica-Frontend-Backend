jest.mock('../services/ContactoServices', () => ({
  enviar: jest.fn(),
}));

const ContactoService = require('../services/ContactoServices');
const ContactoController = require('../controllers/ContactoControllers');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, ...overrides };
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return { req, res };
};

/*
  Propósito del archivo:
  Validar el Controlador de Contacto: validaciones de entrada y envío mediante servicio.

  Cobertura de pruebas:
  - 200 con messageId cuando datos válidos.
  - 400 para nombre faltante, email inválido y asunto demasiado largo.
  - 500 cuando el servicio lanza error sin status.
*/

describe('Controlador de Contacto - enviar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 y messageId cuando datos válidos', async () => {
    ContactoService.enviar.mockResolvedValue({ messageId: '123' });
    const { req, res } = mockReqRes({ body: { nombre: 'Ana', email: 'ana@test.com', asunto: 'Hola', mensaje: 'Mensaje' } });
    await ContactoController.enviar(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, messageId: '123' });
    expect(ContactoService.enviar).toHaveBeenCalledWith({ nombre: 'Ana', email: 'ana@test.com', asunto: 'Hola', mensaje: 'Mensaje' });
  });

  test('400 cuando falta nombre', async () => {
    const { req, res } = mockReqRes({ body: { email: 'ana@test.com', mensaje: 'Mensaje' } });
    await ContactoController.enviar(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'El campo nombre es obligatorio' });
  });

  test('400 email inválido', async () => {
    const { req, res } = mockReqRes({ body: { nombre: 'Ana', email: 'mal', mensaje: 'Mensaje' } });
    await ContactoController.enviar(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'El email no es válido' });
  });

  test('400 asunto muy largo', async () => {
    const asunto = 'x'.repeat(151);
    const { req, res } = mockReqRes({ body: { nombre: 'Ana', email: 'ana@test.com', asunto, mensaje: 'Mensaje' } });
    await ContactoController.enviar(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'El asunto es demasiado largo (máx 150)' });
  });

  test('500 cuando servicio lanza error sin status', async () => {
    ContactoService.enviar.mockRejectedValue(new Error('fail')); 
    const { req, res } = mockReqRes({ body: { nombre: 'Ana', email: 'ana@test.com', mensaje: 'Mensaje' } });
    await ContactoController.enviar(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'fail' });
  });
});
