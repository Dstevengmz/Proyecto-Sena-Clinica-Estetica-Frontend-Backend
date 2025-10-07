jest.mock('../services/ProcedimientosServices', () => ({
  listarLosProcedimientos: jest.fn(),
  listarLosProcedimientosPorCategoria: jest.fn(),
  buscarLosProcedimientos: jest.fn(),
  crearLosProcedimientos: jest.fn(),
  actualizarLosProcedimientos: jest.fn(),
  eliminarLosProcedimientos: jest.fn(),
}));

jest.mock('../models', () => ({
  procedimientoimagenes: { bulkCreate: jest.fn(), findAll: jest.fn(), destroy: jest.fn() },
  procedimientos: { update: jest.fn() },
}));

jest.mock('cloudinary', () => ({
  v2: { config: jest.fn(), uploader: { destroy: jest.fn().mockResolvedValue({}) } }
}));

const svc = require('../services/ProcedimientosServices');
const controller = require('../controllers/ProcedimientoControllers');
const { procedimientoimagenes, procedimientos } = require('../models');

const mockReqRes = (overrides = {}) => {
  const req = { body: {}, params: {}, query: {}, files: undefined, ...overrides };
  const res = { statusCode: 200, body: undefined, status(c){this.statusCode=c;return this;}, json(p){this.body=p;return this;} };
  return { req, res };
};

/*
  Propósito del archivo:
  Validar el Controlador de Procedimientos: listar/buscar/crear/actualizar/eliminar,
  manejo de imágenes y validaciones de IDs.
*/

describe('Controlador de Procedimientos', () => {
  beforeEach(() => jest.clearAllMocks());

  test('listarProcedimientos -> por categoria y general, 500 en error', async () => {
    svc.listarLosProcedimientosPorCategoria.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes({ query: { categoriaId: '5' } });
    await controller.listarProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.listarLosProcedimientos.mockResolvedValue([{ id: 2 }]);
    ctx = mockReqRes({ query: {} });
    await controller.listarProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.listarLosProcedimientos.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ query: {} });
    await controller.listarProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('buscarProcedimientos -> 200 y 404', async () => {
    svc.buscarLosProcedimientos.mockResolvedValue({ id: 1 });
    let ctx = mockReqRes({ params: { id: 3 } });
    await controller.buscarProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.buscarLosProcedimientos.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: 3 } });
    await controller.buscarProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
  });

  test('crearProcedimientos -> 201 crea y guarda imagenes', async () => {
    svc.crearLosProcedimientos.mockResolvedValue({ id: 9, imagen: null });
    const files = { imagen: [{ path: '/img/p.png' }], imagenes: [{ path: '/img/a.png' }, { path: '/img/b.png' }] };
    const { req, res } = mockReqRes({ body: { precio: '12.5', duracion: '45', requiere_evaluacion: 'true', categoriaId: '3', nombre: 'proc' }, files });
    await controller.crearProcedimientos(req, res);
    expect(res.statusCode).toBe(201);
    expect(procedimientoimagenes.bulkCreate).toHaveBeenCalled();
  });

  test('crearProcedimientos -> 500 en error', async () => {
    svc.crearLosProcedimientos.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes({ body: { precio: '12', duracion: '30' } });
    await controller.crearProcedimientos(req, res);
    expect(res.statusCode).toBe(500);
  });

  test('actualizarProcedimientos -> 400 id inválido, 404 no existe', async () => {
    let ctx = mockReqRes({ params: { id: 'abc' }, body: {} });
    await controller.actualizarProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);

    svc.buscarLosProcedimientos.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: '7' }, body: {} });
    await controller.actualizarProcedimientos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);
  });

  test('actualizarProcedimientos -> 200 con cambios, elimina imagenes por ids/urls', async () => {
    svc.buscarLosProcedimientos.mockResolvedValue({ id: 7, imagen: '/img/principal.png' });
    svc.actualizarLosProcedimientos.mockResolvedValue([1]);
    procedimientoimagenes.findAll.mockResolvedValue([{ id: 1, url: '/cloud/v123/prod/a.png' }]);
    const { req, res } = mockReqRes({ params: { id: '7' }, body: { precio: '10', duracion: '30', requiere_evaluacion: 'false', 'imagenes_eliminar[]': ['1', '/cloud/v999/prod/principal.png'] }, files: { imagenes: [{ path: '/new/x.png' }] } });
    await controller.actualizarProcedimientos(req, res);
    expect(res.statusCode).toBe(200);
    expect(procedimientoimagenes.destroy).toHaveBeenCalled();
  });

  test('actualizarProcedimientos -> 500 en error servicio', async () => {
    svc.buscarLosProcedimientos.mockResolvedValue({ id: 7, imagen: null });
    svc.actualizarLosProcedimientos.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes({ params: { id: '7' }, body: { precio: '10', duracion: '30' } });
    await controller.actualizarProcedimientos(req, res);
    expect(res.statusCode).toBe(500);
  });

  test('listarProcedimientosPorCategoria -> 400 inválido y 200 ok, 500 error', async () => {
    let ctx = mockReqRes({ params: { categoriaId: 'abc' } });
    await controller.listarProcedimientosPorCategoria(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);

    svc.listarLosProcedimientosPorCategoria.mockResolvedValue([{ id: 1 }]);
    ctx = mockReqRes({ params: { categoriaId: '3' } });
    await controller.listarProcedimientosPorCategoria(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    svc.listarLosProcedimientosPorCategoria.mockRejectedValue(new Error('x'));
    ctx = mockReqRes({ params: { categoriaId: '3' } });
    await controller.listarProcedimientosPorCategoria(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test('eliminarProcedimientos -> 200', async () => {
    const { req, res } = mockReqRes({ params: { id: 1 } });
    await controller.eliminarProcedimientos(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Procedimiento eliminado' });
    expect(svc.eliminarLosProcedimientos).toHaveBeenCalledWith(1);
  });
});
