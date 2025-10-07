jest.mock('../services/HistorialMedicoServices', () => ({
  listarLosHistorialesClinicos: jest.fn(),
  buscarLosHistorialesClinicos: jest.fn(),
  buscarLosHistorialesClinicosPorUsuario: jest.fn(),
  crearLosHistorialesClinicos: jest.fn(),
  actualizarLosHistorialesClinicos: jest.fn(),
  eliminarLosHistorialesClinicos: jest.fn(),
}));

const svc = require('../services/HistorialMedicoServices');
const controller = require('../controllers/HistorialMedicoControllers');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, usuario: { id: 10 }, ...overrides };
  const res = { statusCode: 200, body: undefined, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
  return { req, res };
};

/*
  Propósito del archivo:
  Validar el Controlador de Historial Médico: listar, buscar, por usuario, propio, crear,
  actualizar y eliminar con sus estados de 200/400/403/404/500.
*/

describe('Controlador de Historial Médico', () => {
  beforeEach(() => jest.clearAllMocks());

  test('listarHistorialMedico -> 200', async () => {
    svc.listarLosHistorialesClinicos.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes();
    await controller.listarHistorialMedico(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test('buscarHistorialMedico -> 200 y 404', async () => {
    svc.buscarLosHistorialesClinicos.mockResolvedValue({ id: 2 });
    let ctx = mockReqRes({ params: { id: 2 } });
    await controller.buscarHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.buscarLosHistorialesClinicos.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: 2 } });
    await controller.buscarHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
  });

  test('buscarHistorialMedicoporUsuario -> 200 y 404', async () => {
    svc.buscarLosHistorialesClinicosPorUsuario.mockResolvedValue({ id: 3 });
    let ctx = mockReqRes({ params: { id: 77 } });
    await controller.buscarHistorialMedicoporUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.buscarLosHistorialesClinicosPorUsuario.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: 77 } });
    await controller.buscarHistorialMedicoporUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
  });

  test('miHistorialMedico -> 403 si id distinto, 404 si no hay, 200 si existe y 500 en error', async () => {
    let ctx = mockReqRes({ params: { id: 11 }, usuario: { id: 10 } });
    await controller.miHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(403);

    svc.buscarLosHistorialesClinicosPorUsuario.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: 10 }, usuario: { id: 10 } });
    await controller.miHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    svc.buscarLosHistorialesClinicosPorUsuario.mockResolvedValue({ id: 1 });
    ctx = mockReqRes({ params: { id: 10 }, usuario: { id: 10 } });
    await controller.miHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.buscarLosHistorialesClinicosPorUsuario.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: 10 }, usuario: { id: 10 } });
    await controller.miHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('crearHistorialMedico -> 201 y 500', async () => {
    svc.crearLosHistorialesClinicos.mockResolvedValue({ id: 9 });
    let ctx = mockReqRes({ body: { a: 1 } });
    await controller.crearHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(201);

    svc.crearLosHistorialesClinicos.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ body: { a: 1 } });
    await controller.crearHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('actualizarHistorialMedico -> 400 id inválido, 404 y 200, 500', async () => {
    let ctx = mockReqRes({ params: { id: 'abc' }, body: {} });
    await controller.actualizarHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);

    svc.actualizarLosHistorialesClinicos.mockResolvedValue([0]);
    ctx = mockReqRes({ params: { id: '5' }, body: {} });
    await controller.actualizarHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    svc.actualizarLosHistorialesClinicos.mockResolvedValue([1]);
    ctx = mockReqRes({ params: { id: '5' }, body: {} });
    await controller.actualizarHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.actualizarLosHistorialesClinicos.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { id: '5' }, body: {} });
    await controller.actualizarHistorialMedico(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('eliminarHistorialMedico -> 200', async () => {
    const { req, res } = mockReqRes({ params: { id: 1 } });
    await controller.eliminarHistorialMedico(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Historialmedico eliminado' });
    expect(svc.eliminarLosHistorialesClinicos).toHaveBeenCalledWith(1);
  });
});
