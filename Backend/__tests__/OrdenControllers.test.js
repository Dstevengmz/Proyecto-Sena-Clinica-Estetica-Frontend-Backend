jest.mock('../services/OrdenServices', () => ({
  listarOrdenesEvaluacionRealizadaPorUsuario: jest.fn(),
  listarOrdenesPorUsuario: jest.fn(),
  listarLasOrdenes: jest.fn(),
  buscarLasOrdenes: jest.fn(),
  crearLasOrdenes: jest.fn(),
  actualizarLasOrdenes: jest.fn(),
  eliminarLasOrdenes: jest.fn(),
}));

const svc = require('../services/OrdenServices');
const controller = require('../controllers/OrdenControllers');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, usuario: { id: 1 }, ...overrides };
  const res = { statusCode: 200, body: undefined, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
  return { req, res };
};

/*
  Propósito del archivo:
  Validar el Controlador de Órdenes: listas por usuario/elegibles, CRUD y validaciones de ID con estados 200/400/404/500.
*/

describe('Controlador de Órdenes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('listarOrdenesElegiblesParaProcedimiento -> 400 inválido, 200 ok y 500 error', async () => {
    let ctx = mockReqRes({ params: { usuarioId: 'abc' } });
    await controller.listarOrdenesElegiblesParaProcedimiento(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);

    svc.listarOrdenesEvaluacionRealizadaPorUsuario.mockResolvedValue([{ id: 1 }]);
    ctx = mockReqRes({ params: { usuarioId: '7' } });
    await controller.listarOrdenesElegiblesParaProcedimiento(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.listarOrdenesEvaluacionRealizadaPorUsuario.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { usuarioId: '7' } });
    await controller.listarOrdenesElegiblesParaProcedimiento(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('listarMisOrdenes -> 200 y 500', async () => {
    svc.listarOrdenesPorUsuario.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes({ usuario: { id: 9 } });
    await controller.listarMisOrdenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.listarOrdenesPorUsuario.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ usuario: { id: 9 } });
    await controller.listarMisOrdenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('listarOrdenes -> 200', async () => {
    svc.listarLasOrdenes.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes();
    await controller.listarOrdenes(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('buscarOrdenes -> 200 y 404', async () => {
    svc.buscarLasOrdenes.mockResolvedValue({ id: 1 });
    let ctx = mockReqRes({ params: { id: 3 } });
    await controller.buscarOrdenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.buscarLasOrdenes.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: 3 } });
    await controller.buscarOrdenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
  });

  test('crearOrdenes -> 201', async () => {
    svc.crearLasOrdenes.mockResolvedValue({ id: 1 });
    const { req, res } = mockReqRes({ body: { a: 1 } });
    await controller.crearOrdenes(req, res);
    expect(res.statusCode).toBe(201);
  });

  test('actualizarOrdenes -> 400 inválido, 404, 200 y 500', async () => {
    let ctx = mockReqRes({ params: { id: 'abc' }, body: {} });
    await controller.actualizarOrdenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);

    svc.actualizarLasOrdenes.mockResolvedValue([0]);
    ctx = mockReqRes({ params: { id: '7' }, body: {} });
    await controller.actualizarOrdenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    svc.actualizarLasOrdenes.mockResolvedValue([1]);
    ctx = mockReqRes({ params: { id: '7' }, body: {} });
    await controller.actualizarOrdenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.actualizarLasOrdenes.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: '7' }, body: {} });
    await controller.actualizarOrdenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('eliminarOrdenes -> 200', async () => {
    const { req, res } = mockReqRes({ params: { id: 1 } });
    await controller.eliminarOrdenes(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Orden eliminada' });
    expect(svc.eliminarLasOrdenes).toHaveBeenCalledWith(1);
  });
});
