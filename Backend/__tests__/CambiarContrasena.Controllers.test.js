/*
  Propósito del archivo:
  Validar el controlador de Cambio de Contraseña (cambiar, solicitar reset y resetear) con manejo de estados 200/400.

  Cobertura de pruebas:
  - cambiarcontrasena: 200 con resultado del servicio, 400 cuando el servicio lanza error.
  - solicitarReset: 200 con resultado del servicio, 400 cuando el servicio lanza error.
  - resetearPassword: 200 con resultado del servicio, 400 cuando el servicio lanza error.
*/

jest.mock('../services/CambiarContrasenaServices', () => ({
  cambiarcontrasena: jest.fn(),
  solicitarReset: jest.fn(),
  resetearPassword: jest.fn(),
}));

const usuarioService = require('../services/CambiarContrasenaServices');
const controller = require('../controllers/CambiarContrasena.Controllers');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, usuario: { id: 1 }, ...overrides };
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return { req, res };
};

describe('Controlador de Cambio de Contraseña', () => {
  beforeEach(() => jest.clearAllMocks());

  test('cambiarcontrasena -> 200 con result del servicio', async () => {
    usuarioService.cambiarcontrasena.mockResolvedValue({ message: 'ok' });
    const { req, res } = mockReqRes({ body: { actual: 'a', nueva: 'b' } });
    await controller.cambiarcontrasena(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'ok' });
    expect(usuarioService.cambiarcontrasena).toHaveBeenCalledWith(1, 'a', 'b');
  });

  test('cambiarcontrasena -> 400 cuando servicio lanza error', async () => {
    usuarioService.cambiarcontrasena.mockRejectedValue(new Error('boom'));
    const { req, res } = mockReqRes({ body: { actual: 'a', nueva: 'b' } });
    await controller.cambiarcontrasena(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'boom' });
  });

  test('solicitarReset -> 200 con result del servicio', async () => {
    usuarioService.solicitarReset.mockResolvedValue({ message: 'enviado' });
    const { req, res } = mockReqRes({ body: { correo: 'test@gmail.com' } });
    await controller.solicitarReset(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'enviado' });
    expect(usuarioService.solicitarReset).toHaveBeenCalledWith('test@gmail.com');
  });

  test('solicitarReset -> 400 cuando servicio lanza error', async () => {
    usuarioService.solicitarReset.mockRejectedValue(new Error('correo no existe'));
    const { req, res } = mockReqRes({ body: { correo: 'bad@x.com' } });
    await controller.solicitarReset(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'correo no existe' });
  });

  test('resetearPassword -> 200 con result del servicio', async () => {
    usuarioService.resetearPassword.mockResolvedValue({ message: 'ok' });
    const { req, res } = mockReqRes({ params: { token: 't' }, body: { nueva: 'x' } });
    await controller.resetearPassword(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'ok' });
    expect(usuarioService.resetearPassword).toHaveBeenCalledWith('t', 'x');
  });

  test('resetearPassword -> 400 cuando servicio lanza error', async () => {
    usuarioService.resetearPassword.mockRejectedValue(new Error('token invalido'));
    const { req, res } = mockReqRes({ params: { token: 't' }, body: { nueva: 'x' } });
    await controller.resetearPassword(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'token invalido' });
  });
});
