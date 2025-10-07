jest.mock('../services/CategoriaProcedimientosServices', () => ({
  listarLasCategorias: jest.fn(),
  buscarLaCategoria: jest.fn(),
  crearLaCategoria: jest.fn(),
  actualizarLaCategoria: jest.fn(),
  eliminarLaCategoria: jest.fn(),
}));

const categoriaService = require('../services/CategoriaProcedimientosServices');
const controller = require('../controllers/CategoriaProcedimientosControllers');

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
  Validar el Controlador de Categoría de Procedimientos: listar, buscar, crear, actualizar y eliminar.

  Cobertura de pruebas:
  - Listar/buscar: 200, 404 y 500.
  - Crear: 201, 409 duplicado, 400 validaciones, 500 error genérico.
  - Actualizar: validación de ID, 404 no existe, 200 actualizado, 400 sin cambios y 500 error servicio.
  - Eliminar: 200 eliminado, 404 no encontrado y 500 error.
*/

describe('Controlador de Categoría de Procedimientos', () => {
  beforeEach(() => jest.clearAllMocks());

  test('listarCategorias -> 200', async () => {
    categoriaService.listarLasCategorias.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes();
    await controller.listarCategorias(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test('listarCategorias -> 500 en error', async () => {
    categoriaService.listarLasCategorias.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes();
    await controller.listarCategorias(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al listar categorías' });
  });

  test('buscarCategoria -> 200 cuando existe', async () => {
    categoriaService.buscarLaCategoria.mockResolvedValue({ id: 5 });
    const { req, res } = mockReqRes({ params: { id: 5 } });
    await controller.buscarCategoria(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 5 });
  });

  test('buscarCategoria -> 404 cuando no existe', async () => {
    categoriaService.buscarLaCategoria.mockResolvedValue(null);
    const { req, res } = mockReqRes({ params: { id: 5 } });
    await controller.buscarCategoria(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Categoría no encontrada' });
  });

  test('buscarCategoria -> 500 en error', async () => {
    categoriaService.buscarLaCategoria.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes({ params: { id: 5 } });
    await controller.buscarCategoria(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al buscar categoría' });
  });

  test('crearCategoria -> 201 con body boolean string a boolean', async () => {
    categoriaService.crearLaCategoria.mockResolvedValue({ id: 10, nombre: 'Facial', estado: true });
    const { req, res } = mockReqRes({ body: { nombre: 'Facial', estado: 'true' } });
    await controller.crearCategoria(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 10, nombre: 'Facial', estado: true });
    expect(categoriaService.crearLaCategoria).toHaveBeenCalledWith({ nombre: 'Facial', estado: true });
  });

  test('crearCategoria -> 409 conflicto nombre', async () => {
    const e = new Error('dup'); e.status = 409;
    categoriaService.crearLaCategoria.mockRejectedValue(e);
    const { req, res } = mockReqRes({ body: { nombre: 'Facial' } });
    await controller.crearCategoria(req, res);
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ message: 'Ya existe una categoría con ese nombre' });
  });

  test('crearCategoria -> 400 nombre requerido', async () => {
    const e = new Error('faltan datos'); e.status = 400;
    categoriaService.crearLaCategoria.mockRejectedValue(e);
    const { req, res } = mockReqRes({ body: { estado: true } });
    await controller.crearCategoria(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'El nombre de la categoría es requerido' });
  });

  test('crearCategoria -> 500 error genérico', async () => {
    const e = new Error('boom');
    categoriaService.crearLaCategoria.mockRejectedValue(e);
    const { req, res } = mockReqRes({ body: { nombre: 'Facial' } });
    await controller.crearCategoria(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Hubo un error al crear la categoría', error: 'boom' });
  });


  test('actualizarCategoria -> 400 id inválido', async () => {
    const { req, res } = mockReqRes({ params: { id: 'abc' } });
    await controller.actualizarCategoria(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'ID inválido' });
  });


  test('actualizarCategoria -> 404 cuando no existe', async () => {
    categoriaService.buscarLaCategoria.mockResolvedValue(null);
    const { req, res } = mockReqRes({ params: { id: '5' } });
    await controller.actualizarCategoria(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Categoría no encontrada' });
  });





  test('actualizarCategoria -> 200 cuando actualiza', async () => {
    categoriaService.buscarLaCategoria.mockResolvedValue({ id: 5, estado: false });
    categoriaService.actualizarLaCategoria.mockResolvedValue([1]);
    const { req, res } = mockReqRes({ params: { id: '5' }, body: { estado: 'true' } });
    await controller.actualizarCategoria(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mensaje: 'Categoría actualizada correctamente' });
    expect(categoriaService.actualizarLaCategoria).toHaveBeenCalledWith('5', { estado: true });
  });




  test('actualizarCategoria -> 400 si no actualiza', async () => {
    categoriaService.buscarLaCategoria.mockResolvedValue({ id: 5, estado: false });
    categoriaService.actualizarLaCategoria.mockResolvedValue([0]);
    const { req, res } = mockReqRes({ params: { id: '5' }, body: { estado: true } });
    await controller.actualizarCategoria(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No se pudo actualizar la categoría' });
  });




  test('actualizarCategoria -> 500 en error', async () => {
    categoriaService.buscarLaCategoria.mockResolvedValue({ id: 5 });
    categoriaService.actualizarLaCategoria.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes({ params: { id: '5' }, body: { estado: true } });
    await controller.actualizarCategoria(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: 'Error en el servidor al actualizar la categoría',
      detalle: 'x',
    });
  });

  test('eliminarCategoria -> 200 cuando elimina', async () => {
    categoriaService.eliminarLaCategoria.mockResolvedValue(1);
    const { req, res } = mockReqRes({ params: { id: '8' } });
    await controller.eliminarCategoria(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Categoría eliminada' });
  });



  



  test('eliminarCategoria -> 404 cuando no existe', async () => {
    categoriaService.eliminarLaCategoria.mockResolvedValue(0);
    const { req, res } = mockReqRes({ params: { id: '8' } });
    await controller.eliminarCategoria(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Categoría no encontrada' });
  });



  test('eliminarCategoria -> 500 en error', async () => {
    categoriaService.eliminarLaCategoria.mockRejectedValue(new Error('x'));
    const { req, res } = mockReqRes({ params: { id: '8' } });
    await controller.eliminarCategoria(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Error al eliminar la categoría' });
  });
});
