/*
  Propósito del archivo:
  Pruebas unitarias de los servicios de Procedimientos: verifican delegación correcta a los métodos del modelo y retornos.

  Cobertura de pruebas:
  - listarLosProcedimientos: usa findAll con includes y devuelve la lista.
  - buscarLosProcedimientos: usa findByPk con includes y devuelve el registro.
  - crearLosProcedimientos: usa create con los datos recibidos.
  - listarLosProcedimientosPorCategoria: usa findAll con where por categoriaId.
  - eliminarLosProcedimientos: usa destroy con where por id y devuelve el conteo.
  - actualizarLosProcedimientos: usa update con where por id y devuelve el resultado.
*/

jest.mock('../models', () => ({
  procedimientos: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn() },
  usuarios: {},
  categoriaprocedimientos: {},
  procedimientoimagenes: {},
}));
const models = require('../models');

describe('Servicios de Procedimientos', () => {
  let svc;
  beforeEach(() => {
    jest.clearAllMocks();
    svc = require('../services/ProcedimientosServices');
    Object.values(models.procedimientos).forEach(fn => fn.mockReset());
  });

  test('listarLosProcedimientos -> delega a findAll con includes', async () => {
    models.procedimientos.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await svc.listarLosProcedimientos();
    expect(models.procedimientos.findAll).toHaveBeenCalled();
    expect(res).toEqual([{ id: 1 }]);
  });

  test('buscarLosProcedimientos -> delega a findByPk con includes', async () => {
    models.procedimientos.findByPk.mockResolvedValue({ id: 5 });
    const res = await svc.buscarLosProcedimientos(5);
    expect(models.procedimientos.findByPk).toHaveBeenCalledWith(5, expect.any(Object));
    expect(res).toEqual({ id: 5 });
  });

  test('crearLosProcedimientos -> delega a create', async () => {
    models.procedimientos.create.mockResolvedValue({ id: 9 });
    const res = await svc.crearLosProcedimientos({ nombre: 'x' });
    expect(models.procedimientos.create).toHaveBeenCalledWith({ nombre: 'x' });
    expect(res).toEqual({ id: 9 });
  });

  test('listarLosProcedimientosPorCategoria -> delega a findAll con where', async () => {
    models.procedimientos.findAll.mockResolvedValue([{ id: 2 }]);
    const res = await svc.listarLosProcedimientosPorCategoria(7);
    expect(models.procedimientos.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { categoriaId: 7 } }));
    expect(res).toEqual([{ id: 2 }]);
  });

  test('eliminarLosProcedimientos -> delega a destroy', async () => {
    models.procedimientos.destroy.mockResolvedValue(1);
    const res = await svc.eliminarLosProcedimientos(3);
    expect(models.procedimientos.destroy).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(res).toBe(1);
  });

  test('actualizarLosProcedimientos -> delega a update y devuelve resultado', async () => {
    models.procedimientos.update.mockResolvedValue([1]);
    const res = await svc.actualizarLosProcedimientos(4, { nombre: 'y' });
    expect(models.procedimientos.update).toHaveBeenCalledWith({ nombre: 'y' }, { where: { id: 4 } });
    expect(res).toEqual([1]);
  });
});
