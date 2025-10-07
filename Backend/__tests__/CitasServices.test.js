jest.mock('../models', () => ({
  citas: { findAll: jest.fn(), count: jest.fn(), create: jest.fn() },
  usuarios: {}, sequelize: {}, carrito: {}, ordenes: {}, ordenprocedimiento: {}, historialclinico: {},
  procedimientos: {}, examen: {}, notificaciones: {}, requerimientos: { create: jest.fn() }, consentimiento: {},
}));
jest.mock('../assets/HorariosDisponibles', () => ({
  horarios: jest.fn(() => ['09:00']),
  duraciones: jest.fn(() => ({ procedimiento: 60, evaluacion: 30 })),
}));
jest.mock('../config/redis', () => ({ publish: jest.fn(), get: jest.fn(), set: jest.fn() }));

const models = require('../models');
const HorariosDisponibles = require('../assets/HorariosDisponibles');

describe('CitasServices (subset)', () => {
  let svc;
  let room;
  beforeEach(() => {
    jest.clearAllMocks();
    room = { emit: jest.fn() };
    global.io = { to: jest.fn(() => room) };
    svc = require('../services/CitasServices');
  });

  test('calcularTotalesPorRango cuenta por estado y tipo', async () => {
    models.citas.findAll.mockResolvedValue([
      { estado: 'cancelada', tipo: 'evaluacion' },
      { estado: 'pendiente', tipo: 'procedimiento' },
      { estado: 'realizada', tipo: 'evaluacion' },
      { estado: 'realizada', tipo: 'procedimiento' },
      { estado: 'realizada', tipo: 'procedimiento' },
    ]);
    const res = await svc.calcularTotalesPorRango(7, new Date(), new Date());
    expect(res).toEqual({ total: 5, canceladas: 1, pendientes: 1, realizadasEvaluacion: 1, realizadasProcedimiento: 2 });
  });

  test('notificarTotalesDia emite al room del doctor', async () => {
    const fake = { total: 1 };
    jest.spyOn(svc, 'calcularTotalesPorRango').mockResolvedValueOnce(fake);
    await svc.notificarTotalesDia(7);
    expect(global.io.to).toHaveBeenCalledWith('doctor_7');
    expect(room.emit).toHaveBeenCalledWith('totalesDia', fake);
  });

  test('crearRequerimiento crea requerimiento y agenda primer slot disponible', async () => {
    const data = { id_usuario: 1, id_doctor: 2, fecha_inicio: '2025-10-06', repeticiones: 1, frecuencia: 1, descripcion: 'desc' };
    models.requerimientos.create.mockResolvedValue({ id: 99 });
    models.citas.findAll.mockResolvedValue([]);
    models.citas.create.mockResolvedValue({ id: 123 });

    const res = await svc.crearRequerimiento(data);
    expect(models.requerimientos.create).toHaveBeenCalledWith(data);
    expect(models.citas.create).toHaveBeenCalledWith(expect.objectContaining({ id_usuario: 1, id_doctor: 2, tipo: 'procedimiento', estado: 'pendiente' }));
    expect(res).toEqual({ id: 99 });
  });

  test('crearRequerimiento lanza error si no hay horarios en varios intentos', async () => {
    HorariosDisponibles.horarios.mockImplementation(() => []);
    models.requerimientos.create.mockResolvedValue({ id: 1 });
    models.citas.findAll.mockResolvedValue([]);
    await expect(svc.crearRequerimiento({ id_usuario: 1, id_doctor: 2, fecha_inicio: '2025-10-06', repeticiones: 1, frecuencia: 1, descripcion: 'x' }))
      .rejects.toThrow(/No se pudo asignar la cita/);
  });

  test('notificarTotalCitasRealizadasProcedimientoHoy emite y retorna total', async () => {
    models.citas.count.mockResolvedValue(5);
    const total = await svc.notificarTotalCitasRealizadasProcedimientoHoy(3);
    expect(models.citas.count).toHaveBeenCalled();
    expect(global.io.to).toHaveBeenCalledWith('doctor_3');
    expect(room.emit).toHaveBeenCalledWith('totalCitasRealizadasProcedimientoHoy', { total: 5 });
    expect(total).toBe(5);
  });

  test('notificarTotalCitasRealizadasProcedimientoHoy maneja error devolviendo 0', async () => {
    models.citas.count.mockRejectedValue(new Error('db'));
    const total = await svc.notificarTotalCitasRealizadasProcedimientoHoy();
    expect(total).toBe(0);
  });

  test('notificarTotalCitasRealizadasEvaluacionHoy emite y retorna total', async () => {
    models.citas.count.mockResolvedValue(7);
    const total = await svc.notificarTotalCitasRealizadasEvaluacionHoy(4);
    expect(models.citas.count).toHaveBeenCalled();
    expect(global.io.to).toHaveBeenCalledWith('doctor_4');
    expect(room.emit).toHaveBeenCalledWith('totalCitasRealizadasEvaluacionHoy', { total: 7 });
    expect(total).toBe(7);
  });

  test('notificarTotalCitasRealizadasEvaluacionHoy maneja error devolviendo 0', async () => {
    models.citas.count.mockRejectedValue(new Error('db'));
    const total = await svc.notificarTotalCitasRealizadasEvaluacionHoy();
    expect(total).toBe(0);
  });

  test('notificarTotalCitasCanceladasHoy emite y retorna total', async () => {
    models.citas.count.mockResolvedValue(3);
    const total = await svc.notificarTotalCitasCanceladasHoy(8);
    expect(models.citas.count).toHaveBeenCalled();
    expect(global.io.to).toHaveBeenCalledWith('doctor_8');
    expect(room.emit).toHaveBeenCalledWith('totalCitasCanceladasHoy', { total: 3 });
    expect(total).toBe(3);
  });

  test('notificarTotalCitasCanceladasHoy maneja error devolviendo 0', async () => {
    models.citas.count.mockRejectedValue(new Error('db'));
    const total = await svc.notificarTotalCitasCanceladasHoy();
    expect(total).toBe(0);
  });
});


