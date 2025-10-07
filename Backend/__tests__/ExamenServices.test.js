jest.mock('../models', () => ({
  examen: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
  citas: { findByPk: jest.fn() },
}));
const models = require('../models');

/*
  Propósito del archivo:
  Validar la capa de Servicios de Exámenes: subir archivos, listar por cita y eliminar.

  Cobertura de pruebas:
  - subirArchivos: valida archivos, existencia de cita, finalización y creación de registros.
  - listarPorCita: delega al modelo con filtros y orden.
  - eliminar: retorna null si no existe y true si elimina.
*/

describe('Servicios de Exámenes', () => {
  let svc;
  beforeEach(() => {
    jest.clearAllMocks();
    svc = require('../services/ExamenServices');
    Object.values(models.examen).forEach(fn => fn.mockReset());
    Object.values(models.citas).forEach(fn => fn.mockReset());
  });

  test('subirArchivos -> error sin archivos', async () => {
    await expect(svc.subirArchivos({ id_cita: 1, archivos: [] })).rejects.toThrow('No se enviaron archivos');
  });

  test('subirArchivos -> error si cita no existe', async () => {
    models.citas.findByPk.mockResolvedValue(null);
    await expect(svc.subirArchivos({ id_cita: 1, archivos: [{ originalname: 'a', filename: 'id' }] }))
      .rejects.toThrow('Cita no encontrada');
  });

  test('subirArchivos -> error si examenes_cargados true', async () => {
    models.citas.findByPk.mockResolvedValue({ id: 1, examenes_cargados: true });
    await expect(svc.subirArchivos({ id_cita: 1, archivos: [{ originalname: 'a', filename: 'id' }] }))
      .rejects.toThrow(/marcados como finalizados/);
  });

  test('subirArchivos -> crea registros para cada archivo', async () => {
    models.citas.findByPk.mockResolvedValue({ id: 1, examenes_cargados: false });
    models.examen.create.mockImplementation(async (data) => data);
    const archivos = [
      { originalname: 'A.pdf', filename: 'pub1', path:'', secure_url:'', url:'', mimetype:'application/pdf', size:1 },
      { originalname: 'B.png', filename: 'pub2', path:'', secure_url:'', url:'', mimetype:'image/png', size:1 },
    ];
    const res = await svc.subirArchivos({ id_cita: 1, archivos });
    expect(res).toHaveLength(2);
    expect(models.examen.create).toHaveBeenCalledTimes(2);
  });

  test('subirArchivos -> error si falta public_id (filename) en algún archivo', async () => {
    models.citas.findByPk.mockResolvedValue({ id: 1, examenes_cargados: false });
    await expect(svc.subirArchivos({ id_cita: 1, archivos: [ { originalname: 'X', /* filename ausente */ } ] }))
      .rejects.toThrow('No se obtuvo public_id del archivo');
    expect(models.examen.create).not.toHaveBeenCalled();
  });

  test('listarPorCita -> delega en examen.findAll', async () => {
    models.examen.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await svc.listarPorCita(7);
    expect(models.examen.findAll).toHaveBeenCalledWith({ where: { id_cita: 7 }, order: [['id','ASC']] });
    expect(res).toEqual([{ id: 1 }]);
  });

  test('eliminar -> retorna null si no existe y true si elimina', async () => {
    models.examen.findByPk.mockResolvedValue(null);
    let res = await svc.eliminar(9);
    expect(res).toBeNull();

    const destroy = jest.fn();
    models.examen.findByPk.mockResolvedValue({ id: 9, destroy });
    res = await svc.eliminar(9);
    expect(destroy).toHaveBeenCalled();
    expect(res).toBe(true);
  });
});
