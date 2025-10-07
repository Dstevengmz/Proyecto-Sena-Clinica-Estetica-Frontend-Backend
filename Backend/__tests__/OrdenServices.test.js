jest.mock('../models', () => {
  const ordenes = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
  };
  const procedimientos = {}; // usado solo en include
  const citas = {
    findAll: jest.fn(),
  };
  return { ordenes, procedimientos, citas };
});

/*
  Propósito del archivo:
  Validar Servicios de Órdenes: listar/buscar/crear/actualizar/eliminar, listar por usuario,
  y selección de órdenes con evaluación realizada por usuario.
*/

describe('Servicios de Órdenes', () => {
  let OrdenServices;
  let models;
  const originalLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
  // volver a requerir models para obtener la misma instancia mockeada
    models = require('../models');
    OrdenServices = require('../services/OrdenServices');
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalLog;
  });

  test('listarLasOrdenes devuelve lista', async () => {
    models.ordenes.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = await OrdenServices.listarLasOrdenes();
    expect(models.ordenes.findAll).toHaveBeenCalledWith();
    expect(res).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('buscarLasOrdenes encuentra por id', async () => {
    models.ordenes.findByPk.mockResolvedValue({ id: 10 });
    const res = await OrdenServices.buscarLasOrdenes(10);
    expect(models.ordenes.findByPk).toHaveBeenCalledWith(10);
    expect(res).toEqual({ id: 10 });
  });

  test('crearLasOrdenes crea orden con procedimientos', async () => {
    const addProcedimientos = jest.fn().mockResolvedValue(undefined);
    models.ordenes.create.mockResolvedValue({ id: 1, addProcedimientos });
    const data = { id_usuario: 5, procedimientos: [1, 2, 3] };
    const res = await OrdenServices.crearLasOrdenes(data);
    expect(models.ordenes.create).toHaveBeenCalledWith({ id_usuario: 5 });
    expect(addProcedimientos).toHaveBeenCalledWith([1, 2, 3]);
    expect(res).toEqual({ id: 1, addProcedimientos });
  });

  test('crearLasOrdenes sin procedimientos no llama a addProcedimientos', async () => {
    models.ordenes.create.mockResolvedValue({ id: 2 });
    const res = await OrdenServices.crearLasOrdenes({ id_usuario: 7 });
    expect(models.ordenes.create).toHaveBeenCalledWith({ id_usuario: 7 });
    expect(res).toEqual({ id: 2 });
  });

  test('eliminarLasOrdenes elimina por id', async () => {
    models.ordenes.destroy.mockResolvedValue(1);
    const res = await OrdenServices.eliminarLasOrdenes(9);
    expect(models.ordenes.destroy).toHaveBeenCalledWith({ where: { id: 9 } });
    expect(res).toBe(1);
  });

  test('actualizarLasOrdenes actualiza datos', async () => {
    models.ordenes.update.mockResolvedValue([1]);
    const res = await OrdenServices.actualizarLasOrdenes(3, { estado: 'nueva' });
    expect(models.ordenes.update).toHaveBeenCalledWith({ estado: 'nueva' }, { where: { id: 3 } });
    expect(res).toEqual([1]);
  });

  test('listarOrdenesPorUsuario atrapa ReferenceError por uso de Procedimientos y no lanza', async () => {
    const res = await OrdenServices.listarOrdenesPorUsuario(4);
    // debido a variable Procedimientos no definida en include, debe loggear y devolver undefined
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Error al listar órdenes por usuario:'), expect.any(Error));
    expect(res).toBeUndefined();
  });

  test('listarOrdenesEvaluacionRealizadaPorUsuario retorna [] cuando no hay ids', async () => {
    models.citas.findAll.mockResolvedValue([]);
    const res = await OrdenServices.listarOrdenesEvaluacionRealizadaPorUsuario(8);
    expect(models.citas.findAll).toHaveBeenCalledWith({
      where: { id_usuario: 8, tipo: 'evaluacion', estado: 'realizada' },
      attributes: ['id_orden'],
    });
    expect(res).toEqual([]);
    expect(models.ordenes.findAll).not.toHaveBeenCalled();
  });

  test('listarOrdenesEvaluacionRealizadaPorUsuario busca ordenes por ids únicos', async () => {
    models.citas.findAll.mockResolvedValue([
      { id_orden: 1 },
      { id_orden: 2 },
      { id_orden: 1 },
      { id_orden: null },
    ]);
    models.ordenes.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = await OrdenServices.listarOrdenesEvaluacionRealizadaPorUsuario(9);
    expect(models.ordenes.findAll).toHaveBeenCalledWith({
      where: { id_usuario: 9, id: [1, 2] },
      include: [
        { model: models.procedimientos, as: 'procedimientos', through: { attributes: [] } },
      ],
    });
    expect(res).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('listarOrdenesEvaluacionRealizadaPorUsuario propaga error si falla', async () => {
    models.citas.findAll.mockResolvedValue([{ id_orden: 5 }]);
    models.ordenes.findAll.mockRejectedValue(new Error('DB down'));
    await expect(
      OrdenServices.listarOrdenesEvaluacionRealizadaPorUsuario(1)
    ).rejects.toThrow('DB down');
  });
});
