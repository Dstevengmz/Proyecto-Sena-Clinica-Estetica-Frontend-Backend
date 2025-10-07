/*
  Propósito del archivo:
  Validar el controlador del Carrito (listar, agregar, eliminar y limpiar) y su manejo de errores.

  Cobertura de pruebas:
  - listarMiCarrito: 200 con datos y 500 en error.
  - agregarAlCarrito: 201 con item, 400 si ya existe, 500 en otros errores.
  - eliminarDelCarrito: 200 y 500 en error.
  - limpiarMiCarrito: 200 y 500 en error.
*/

jest.mock('../services/CarritoServices', () => ({
  listarCarritoPorUsuario: jest.fn(),
  agregarAlCarrito: jest.fn(),
  eliminarDelCarrito: jest.fn(),
  limpiarCarritoUsuario: jest.fn(),
}));

const carritoService = require('../services/CarritoServices');
const controller = require('../controllers/CarritoControllers');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, usuario: { id: 7 }, ...overrides };
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return { req, res };
};

describe('Controlador de Carrito', () => {
  beforeEach(() => jest.clearAllMocks());

  test('listarMiCarrito -> 200 con items', async () => {
    carritoService.listarCarritoPorUsuario.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes();
    await controller.listarMiCarrito(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
    expect(carritoService.listarCarritoPorUsuario).toHaveBeenCalledWith(7);
  });

  test('listarMiCarrito -> 500 en error', async () => {
    carritoService.listarCarritoPorUsuario.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes();
    await controller.listarMiCarrito(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al obtener el carrito' });
  });

  test('agregarAlCarrito -> 201 con item', async () => {
    carritoService.agregarAlCarrito.mockResolvedValue({ id: 2 });
    const { req, res } = mockReqRes({ body: { id_procedimiento: 5 } });
    await controller.agregarAlCarrito(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 2 });
    expect(carritoService.agregarAlCarrito).toHaveBeenCalledWith({ id_procedimiento: 5, id_usuario: 7 });
  });

  test('agregarAlCarrito -> 400 si ya existe', async () => {
    carritoService.agregarAlCarrito.mockRejectedValue(new Error('El procedimiento ya está en el carrito.'));
    const { req, res } = mockReqRes({ body: { id_procedimiento: 5 } });
    await controller.agregarAlCarrito(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'El procedimiento ya está en el carrito.' });
  });

  test('agregarAlCarrito -> 500 en otro error', async () => {
    carritoService.agregarAlCarrito.mockRejectedValue(new Error('db down'));
    const { req, res } = mockReqRes({ body: { id_procedimiento: 5 } });
    await controller.agregarAlCarrito(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al agregar al carrito' });
  });

  test('eliminarDelCarrito -> 200', async () => {
    carritoService.eliminarDelCarrito.mockResolvedValue(1);
    const { req, res } = mockReqRes({ params: { id: 9 } });
    await controller.eliminarDelCarrito(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mensaje: 'Procedimiento eliminado del carrito' });
    expect(carritoService.eliminarDelCarrito).toHaveBeenCalledWith(9);
  });

  test('eliminarDelCarrito -> 500 en error', async () => {
    carritoService.eliminarDelCarrito.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes({ params: { id: 9 } });
    await controller.eliminarDelCarrito(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al eliminar del carrito' });
  });

  test('limpiarMiCarrito -> 200', async () => {
      carritoService.limpiarCarritoUsuario.mockResolvedValue(1);
    const { req, res } = mockReqRes();
    await controller.limpiarMiCarrito(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mensaje: 'Carrito limpiado correctamente' });
    expect(carritoService.limpiarCarritoUsuario).toHaveBeenCalledWith(7);
  });

  test('limpiarMiCarrito -> 500 en error', async () => {
    carritoService.limpiarCarritoUsuario.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes();
    await controller.limpiarMiCarrito(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al limpiar el carrito' });
  });
});
