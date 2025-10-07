jest.mock('../models', () => ({
  historialclinico: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  usuarios: {},
}));

/*
  Propósito del archivo:
  Validar Servicios de Historial Médico: listar/buscar/crear/actualizar por usuario y por id,
  manejo de errores con logs y restricciones al crear duplicados.
*/

describe('Servicios de Historial Médico', () => {
  let svc;
  let models;
  const originalLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    models = require('../models');
    svc = require('../services/HistorialMedicoServices');
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalLog;
  });

  test('listarLosHistorialesClinicos incluye datos de usuario', async () => {
    models.historialclinico.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await svc.listarLosHistorialesClinicos();
    expect(models.historialclinico.findAll).toHaveBeenCalledWith({
      include: {
        model: models.usuarios,
        as: 'usuario',
        attributes: [
          'nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento', 'genero', 'rol', 'ocupacion',
        ],
      },
    });
    expect(res).toEqual([{ id: 1 }]);
  });

  test('buscarLosHistorialesClinicos obtiene por id con include', async () => {
    models.historialclinico.findByPk.mockResolvedValue({ id: 7 });
    const res = await svc.buscarLosHistorialesClinicos(7);
    expect(models.historialclinico.findByPk).toHaveBeenCalledWith(7, expect.objectContaining({ include: expect.any(Object) }));
    expect(res).toEqual({ id: 7 });
  });

  test('buscarLosHistorialesClinicos captura error y loggea', async () => {
    models.historialclinico.findByPk.mockRejectedValue(new Error('db error'));
    const res = await svc.buscarLosHistorialesClinicos(9);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Error en el servidor al buscar el Historialclinico:'), expect.any(Error));
    expect(res).toBeUndefined();
  });

  test('buscarLosHistorialesClinicosPorUsuario retorna uno con include', async () => {
    models.historialclinico.findOne.mockResolvedValue({ id: 2, id_usuario: 3 });
    const res = await svc.buscarLosHistorialesClinicosPorUsuario(3);
    expect(models.historialclinico.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id_usuario: 3 }, include: expect.any(Object) }));
    expect(res).toEqual({ id: 2, id_usuario: 3 });
  });

  test('buscarLosHistorialesClinicosPorUsuario captura error y loggea', async () => {
    models.historialclinico.findOne.mockRejectedValue(new Error('db error'));
    const res = await svc.buscarLosHistorialesClinicosPorUsuario(4);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Error en el servidor al buscar el Historialclinico por usuario:'), expect.any(Error));
    expect(res).toBeUndefined();
  });

  test('crearLosHistorialesClinicos lanza si el usuario ya tiene historial', async () => {
    models.historialclinico.findOne.mockResolvedValue({ id: 5, id_usuario: 11 });
    await expect(svc.crearLosHistorialesClinicos({ id_usuario: 11, dato: 'x' }))
      .rejects.toThrow('El usuario ya tiene un historial médico registrado.');
  });

  test('crearLosHistorialesClinicos crea nuevo cuando no existe', async () => {
    models.historialclinico.findOne.mockResolvedValue(null);
    models.historialclinico.create.mockResolvedValue({ id: 6, id_usuario: 12 });
    const res = await svc.crearLosHistorialesClinicos({ id_usuario: 12, dato: 'y' });
    expect(models.historialclinico.create).toHaveBeenCalledWith({ id_usuario: 12, dato: 'y' });
    expect(res).toEqual({ id: 6, id_usuario: 12 });
  });

  test('actualizarLosHistorialesClinicos actualiza correctamente', async () => {
    models.historialclinico.update.mockResolvedValue([1]);
    const res = await svc.actualizarLosHistorialesClinicos(20, { campo: 'valor' });
    expect(models.historialclinico.update).toHaveBeenCalledWith({ campo: 'valor' }, { where: { id: 20 } });
    expect(res).toEqual([1]);
  });

  test('actualizarLosHistorialesClinicos captura error y loggea', async () => {
    models.historialclinico.update.mockRejectedValue(new Error('update fail'));
    const res = await svc.actualizarLosHistorialesClinicos(21, { a: 1 });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Error en el servidor al actualizar el Historialclinico:'), expect.any(Error));
    expect(res).toBeUndefined();
  });

  test('eliminarLosHistorialesClinicos actualmente produce ReferenceError por sombreado de variable', async () => {
    await expect(svc.eliminarLosHistorialesClinicos(5)).rejects.toBeInstanceOf(ReferenceError);
  });
});
