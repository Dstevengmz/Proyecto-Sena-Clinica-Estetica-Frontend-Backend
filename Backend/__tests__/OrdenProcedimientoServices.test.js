jest.mock('../models', () => ({ ordenprocedimiento: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), destroy: jest.fn(), update: jest.fn() } }));
const models = require('../models');

/*
  Propósito del archivo:
  Validar Servicios de Órdenes de Procedimiento: listar, buscar, crear, actualizar y eliminar.
*/

describe('Servicios de Órdenes de Procedimiento', () => {
  let svc;
  beforeEach(() => {
    jest.clearAllMocks();
    svc = require('../services/OrdenProcedimientoServices');
    Object.values(models.ordenprocedimiento).forEach(fn => fn.mockReset());
  });

  test('listarLasOrdenesProcedimientos', async () => {
    models.ordenprocedimiento.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await svc.listarLasOrdenesProcedimientos();
    expect(res).toEqual([{ id: 1 }]);
  });

  test('buscarLasOrdenesProcedimientos', async () => {
    models.ordenprocedimiento.findByPk.mockResolvedValue({ id: 2 });
    const res = await svc.buscarLasOrdenesProcedimientos(2);
    expect(res).toEqual({ id: 2 });
  });

  test('crearLasOrdenesProcedimientos', async () => {
    models.ordenprocedimiento.create.mockResolvedValue({ id: 3 });
    const res = await svc.crearLasOrdenesProcedimientos({ a: 1 });
    expect(models.ordenprocedimiento.create).toHaveBeenCalledWith({ a: 1 });
    expect(res).toEqual({ id: 3 });
  });

  test('eliminarLasOrdenesProcedimientos', async () => {
    models.ordenprocedimiento.destroy.mockResolvedValue(1);
    const res = await svc.eliminarLasOrdenesProcedimientos(4);
    expect(models.ordenprocedimiento.destroy).toHaveBeenCalledWith({ where: { id: 4 } });
    expect(res).toBe(1);
  });

  test('actualizarLasOrdenesProcedimientos', async () => {
    models.ordenprocedimiento.update.mockResolvedValue([1]);
    const res = await svc.actualizarLasOrdenesProcedimientos(5, { x: 2 });
    expect(models.ordenprocedimiento.update).toHaveBeenCalledWith({ x: 2 }, { where: { id: 5 } });
    expect(res).toEqual([1]);
  });
});
