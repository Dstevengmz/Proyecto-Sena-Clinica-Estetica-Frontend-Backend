jest.mock('../services/OrdenProcedimientoServices', () => ({
  listarLasOrdenesProcedimientos: jest.fn(),
  buscarLasOrdenesProcedimientos: jest.fn(),
  crearLasOrdenesProcedimientos: jest.fn(),
  actualizarLasOrdenesProcedimientos: jest.fn(),
  eliminarLasOrdenesProcedimientos: jest.fn(),
}));

const svc = require('../services/OrdenProcedimientoServices');
const controller = require('../controllers/OrdenProcedimientosControllers');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, ...overrides };
  const res = { statusCode: 200, body: undefined, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
  return { req, res };
};

/*  
  Propósito del archivo:
  Validar el Controlador de Órdenes de Procedimiento: listar, buscar, crear, actualizar y eliminar
  con validaciones y estados 200/201/400/404/500.
*/

describe('Controlador de Órdenes de Procedimiento', () => {
  beforeEach(() => jest.clearAllMocks());

  test('listar -> 200', async () => {
    svc.listarLasOrdenesProcedimientos.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes();
    await controller.listarOrdenesProcedimientos(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('buscar -> 200 y 404', async () => {
    svc.buscarLasOrdenesProcedimientos.mockResolvedValue({ id: 1 });
    let ctx = mockReqRes({ params: { id: 2 } });
    await controller.buscarOrdenesProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.buscarLasOrdenesProcedimientos.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: 2 } });
    await controller.buscarOrdenesProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
  });

  test('crear -> 201', async () => {
    svc.crearLasOrdenesProcedimientos.mockResolvedValue({ id: 1 });
    const { req, res } = mockReqRes({ body: { a: 1 } });
    await controller.crearOrdenesProcedimientos(req, res);
    expect(res.statusCode).toBe(201);
  });

  test('actualizar -> 400 inválido, 404, 200 y 500', async () => {
    let ctx = mockReqRes({ params: { id: 'abc' }, body: {} });
    await controller.actualizarOrdenesProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);

    svc.actualizarLasOrdenesProcedimientos.mockResolvedValue([0]);
    ctx = mockReqRes({ params: { id: '7' }, body: { id_orden: 1, id_procedimiento: 2 } });
    await controller.actualizarOrdenesProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    svc.actualizarLasOrdenesProcedimientos.mockResolvedValue([1]);
    ctx = mockReqRes({ params: { id: '7' }, body: { id_orden: 1, id_procedimiento: 2 } });
    await controller.actualizarOrdenesProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.actualizarLasOrdenesProcedimientos.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: '7' }, body: { id_orden: 1, id_procedimiento: 2 } });
    await controller.actualizarOrdenesProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('eliminar -> 200', async () => {
    const { req, res } = mockReqRes({ params: { id: 1 } });
    await controller.eliminaOrdenesProcedimientos(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Orden Procedimiento eliminada' });
    expect(svc.eliminarLasOrdenesProcedimientos).toHaveBeenCalledWith(1);
  });
});
