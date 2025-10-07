/*
  Propósito del archivo:
  Validar el Controlador de Chat: endpoint consultarchat, validaciones y manejo de errores.

  Cobertura de pruebas:
  - 400 cuando el mensaje es inválido o ausente.
  - 200 con respuesta del servicio.
  - 500 cuando el servicio falla.
*/


jest.mock('../services/ChatServices', () => ({
  consultarr: jest.fn(),
}));

const ChatServices = require('../services/ChatServices');
const ChatController = require('../controllers/ChatControllers');

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

describe('Controlador de Chat - consultarchat', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 si mensaje inválido', async () => {
    const { req, res } = mockReqRes({ body: {} });
    await ChatController.consultarchat(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ ok: false, mensaje: 'Mensaje inválido' });
  });

  
  test('200 con respuesta del servicio', async () => {
    ChatServices.consultarr.mockResolvedValue({ ok: true, respuesta: 'hola', items: [] });
    const { req, res } = mockReqRes({ body: { mensaje: 'botox' } });
    await ChatController.consultarchat(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, respuesta: 'hola', items: [] });
    expect(ChatServices.consultarr).toHaveBeenCalledWith('botox');
  });

  test('500 cuando el servicio falla', async () => {
    ChatServices.consultarr.mockRejectedValue(new Error('down'));
    const { req, res } = mockReqRes({ body: { mensaje: 'botox' } });
    await ChatController.consultarchat(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ ok: false, mensaje: 'Error en el chat' });
  });
});
