
/*
  Propósito del archivo:
  Validar el Controlador de Citas (subset): creación, listado, cancelación, actualización de estado,
  requerimientos, generación de PDFs, horarios y consultas por fecha/rango/tipo.

  Cobertura de pruebas (resumen):
  - crearRequerimiento: 201 ok y 500 en error.
  - listarCitas: flujos por rol doctor/usuario/asistente y 500 en error.
  - cancelar/buscar/crear/editar: 200/400/404/409/500 según casos.
  - PDFs de exámenes/medicamentos: 200 en flujo feliz y 404/400 en retornos tempranos.
  - horarios ocupados y consultas por día/rango/tipo: 200/404/500.
*/


jest.mock("../services/CitasServices", () => ({
  crearRequerimiento: jest.fn(),
  listarPacientesPorDoctor: jest.fn(),
  listarCitasPorUsuarioYDoctor: jest.fn(),
  listarLasCitas: jest.fn(),
  buscarLasCitas: jest.fn(),
  actualizarLasCitas: jest.fn(),
  eliminarLasCitas: jest.fn(),
  notificarTotalCitasCanceladas: jest.fn(),
  notificarTotalCitas: jest.fn(),
  notificarTotalCitasPendientesHoy: jest.fn(),
  notificarTotalCitasCanceladasHoy: jest.fn(),
  notificarTotalCitasRealizadasEvaluacionHoy: jest.fn(),
  notificarTotalCitasRealizadasProcedimientoHoy: jest.fn(),
  notificarTotalesDia: jest.fn(),
  notificarTotalesSemana: jest.fn(),
  notificarTotalesMes: jest.fn(),
  crearLasCitas: jest.fn(),
  crearOrdenDesdeCarrito: jest.fn(),
  obtenerCitasPorFecha: jest.fn(),
  obtenerCitasPorDia: jest.fn(),
  obtenerCitasPorRango: jest.fn(),
  obtenerCitasPorTipo: jest.fn(),
  obtenerMisCitas: jest.fn(),
  cambiarEstadoCita: jest.fn(),
  marcarExamenesSubidos: jest.fn(),
  reagendarCita: jest.fn(),
  consultarTodasLasCitasAsistente: jest.fn(),
}));

const citasService = require("../services/CitasServices");
const controller = require("../controllers/CitasControllers");

const mockReqRes = (overrides = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    usuario: { id: 1, rol: "doctor" },
    ...overrides,
  };
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return { req, res };
};

describe("Controlador de Citas (subset)", () => {
  beforeEach(() => jest.clearAllMocks());

  test("crearRequerimiento -> 201 con id_doctor del req", async () => {
    citasService.crearRequerimiento.mockResolvedValue({ id: 10 });
    const { req, res } = mockReqRes({ body: { x: 1 }, usuario: { id: 99 } });
    await controller.crearRequerimiento(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 10 });
    expect(citasService.crearRequerimiento).toHaveBeenCalledWith({
      x: 1,
      id_doctor: 99,
    });
  });

  test("crearRequerimiento -> 500 si servicio falla", async () => {
    citasService.crearRequerimiento.mockRejectedValue(new Error("down"));
    const { req, res } = mockReqRes({ body: { x: 1 }, usuario: { id: 99 } });
    await controller.crearRequerimiento(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Error al crear requerimiento" });
  });

  test("listarCitas (doctor) -> 200", async () => {
    citasService.listarLasCitas.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes({ usuario: { id: 7, rol: "doctor" } });
    await controller.listarCitas(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
    expect(citasService.listarLasCitas).toHaveBeenCalledWith(7);
  });

  test("listarPacientesPorDoctor -> 200 y 500", async () => {
    citasService.listarPacientesPorDoctor.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes({ usuario: { id: 44 } });
    await controller.listarPacientesPorDoctor(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);

    citasService.listarPacientesPorDoctor.mockRejectedValue(new Error("down"));
    const rr = mockReqRes({ usuario: { id: 44 } });
    await controller.listarPacientesPorDoctor(rr.req, rr.res);
    expect(rr.res.statusCode).toBe(500);
  });

  test("listarCitasPorUsuarioYDoctor -> 200 y 500", async () => {
    citasService.listarCitasPorUsuarioYDoctor.mockResolvedValue([{ id: 1 }]);
    const { req, res } = mockReqRes({
      params: { usuarioId: 77 },
      usuario: { id: 33 },
    });
    await controller.listarCitasPorUsuarioYDoctor(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);

    citasService.listarCitasPorUsuarioYDoctor.mockRejectedValue(new Error("x"));
    const rr = mockReqRes({ params: { usuarioId: 77 }, usuario: { id: 33 } });
    await controller.listarCitasPorUsuarioYDoctor(rr.req, rr.res);
    expect(rr.res.statusCode).toBe(500);
  });

  test("listarCitas (asistente sin doctorId) -> []", async () => {
    const { req, res } = mockReqRes({ usuario: { id: 2, rol: "asistente" } });
    await controller.listarCitas(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("listarCitas (asistente con doctorId válido) -> 200", async () => {
    citasService.listarLasCitas.mockResolvedValue([{ id: 5 }]);
    const { req, res } = mockReqRes({
      usuario: { id: 2, rol: "asistente" },
      query: { doctorId: "12" },
    });
    await controller.listarCitas(req, res);
    expect(res.statusCode).toBe(200);
    expect(citasService.listarLasCitas).toHaveBeenCalledWith(12);
    expect(res.body).toEqual([{ id: 5 }]);
  });

  test("listarCitas -> 500 si service falla", async () => {
    citasService.listarLasCitas.mockRejectedValue(new Error("fail"));
    const { req, res } = mockReqRes({ usuario: { id: 7, rol: "doctor" } });
    await controller.listarCitas(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Error al obtener las citas");
  });

  test("listarCitas (rol desconocido) -> lista global con doctorId null", async () => {
    citasService.listarLasCitas.mockResolvedValue([{ id: 99 }]);
    const { req, res } = mockReqRes({
      usuario: { id: 1, rol: "admin" },
      query: {},
    });
    await controller.listarCitas(req, res);
    expect(res.statusCode).toBe(200);
    expect(citasService.listarLasCitas).toHaveBeenCalledWith(null);
    expect(res.body).toEqual([{ id: 99 }]);
  });

  test("listarCitas (usuario con doctorId inválido) -> 400", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 3, rol: "usuario" },
      query: { doctorId: "abc" },
    });
    await controller.listarCitas(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "doctorId inválido" });
  });

  test("cancelarCita -> 404 si no existe", async () => {
    citasService.buscarLasCitas.mockResolvedValue(null);
    const { req, res } = mockReqRes({ params: { id: 5 } });
    await controller.cancelarCita(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Cita no encontrada" });
  });

  test("cancelarCita -> 200 y dispara notificaciones si hay doctor", async () => {
    citasService.buscarLasCitas.mockResolvedValue({ id: 5, id_doctor: 10 });
    citasService.actualizarLasCitas.mockResolvedValue([1]);
    const { req, res } = mockReqRes({ params: { id: 5 } });
    await controller.cancelarCita(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mensaje: "Cita cancelada correctamente" });
    expect(citasService.notificarTotalCitasCanceladas).toHaveBeenCalledWith(10);
    expect(citasService.notificarTotalesMes).toHaveBeenCalledWith(10);
  });

  test("cancelarCita -> 200 sin id_doctor (no notifica)", async () => {
    citasService.buscarLasCitas.mockResolvedValue({ id: 5, id_doctor: null });
    citasService.actualizarLasCitas.mockResolvedValue([1]);
    const { req, res } = mockReqRes({ params: { id: 5 } });
    await controller.cancelarCita(req, res);
    expect(res.statusCode).toBe(200);
    expect(citasService.notificarTotalCitasCanceladas).not.toHaveBeenCalled();
  });

  test("cancelarCita -> 500 si service falla", async () => {
    citasService.buscarLasCitas.mockRejectedValue(new Error("down"));
    const { req, res } = mockReqRes({ params: { id: 5 } });
    await controller.cancelarCita(req, res);
    expect(res.statusCode).toBe(500);
  });

  test("buscarCitas -> 200, 404 y 500", async () => {
    citasService.buscarLasCitas.mockResolvedValue({ id: 1 });
    const { req, res } = mockReqRes({ params: { id: 9 } });
    await controller.buscarCitas(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 1 });

    citasService.buscarLasCitas.mockResolvedValue(null);
    const r2 = mockReqRes({ params: { id: 9 } });
    await controller.buscarCitas(r2.req, r2.res);
    expect(r2.res.statusCode).toBe(404);

    citasService.buscarLasCitas.mockRejectedValue(new Error("x"));
    const r3 = mockReqRes({ params: { id: 9 } });
    await controller.buscarCitas(r3.req, r3.res);
    expect(r3.res.statusCode).toBe(500);
  });

  test("crearCitas (usuario) -> si no envía tipo, lo fuerza a evaluacion", async () => {
    citasService.crearLasCitas.mockResolvedValue({
      id: 1,
      id_doctor: 9,
      tipo: "evaluacion",
    });
    const { req, res } = mockReqRes({
      usuario: { id: 8, rol: "usuario" },
      body: {},
    });
    await controller.crearCitas(req, res);
    expect(res.statusCode).toBe(201);
    expect(citasService.crearLasCitas).toHaveBeenCalledWith({
      _rol_creador: "usuario",
      tipo: "evaluacion",
    });
    expect(citasService.notificarTotalCitas).toHaveBeenCalledWith(9);
  });

  test("crearCitas -> valida tipo de cita cuando no es usuario", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 8, rol: "doctor" },
      body: { tipo: "otro" },
    });
    await controller.crearCitas(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Tipo de cita inválido." });
  });

  test("crearCitas (usuario) -> tipo procedimiento devuelve 400", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 8, rol: "usuario" },
      body: { tipo: "procedimiento" },
    });
    await controller.crearCitas(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(
      /No es posible crear citas de tipo 'procedimiento'/
    );
  });

  test("crearCitas (no usuario) -> por defecto evaluacion y notifica", async () => {
    citasService.crearLasCitas.mockResolvedValue({
      id: 2,
      id_doctor: 4,
      tipo: "evaluacion",
    });
    const { req, res } = mockReqRes({
      usuario: { id: 1, rol: "asistente" },
      body: {},
    });
    await controller.crearCitas(req, res);
    expect(res.statusCode).toBe(201);
    expect(citasService.crearLasCitas).toHaveBeenCalledWith({
      _rol_creador: "asistente",
      tipo: "evaluacion",
    });
    expect(citasService.notificarTotalesMes).toHaveBeenCalledWith(4);
  });

  test("crearCitas (no usuario - procedimiento) -> notifica procedimiento", async () => {
    citasService.crearLasCitas.mockResolvedValue({
      id: 3,
      id_doctor: 7,
      tipo: "procedimiento",
    });
    const { req, res } = mockReqRes({
      usuario: { id: 1, rol: "doctor" },
      body: { tipo: "procedimiento" },
    });
    await controller.crearCitas(req, res);
    expect(res.statusCode).toBe(201);
    expect(
      citasService.notificarTotalCitasRealizadasProcedimientoHoy
    ).toHaveBeenCalledWith(7);
  });

  test("crearCitas -> 400 si service lanza con status", async () => {
    const err = Object.assign(new Error("bad"), { status: 400 });
    citasService.crearLasCitas.mockRejectedValue(err);
    const { req, res } = mockReqRes({
      usuario: { id: 1, rol: "doctor" },
      body: { tipo: "evaluacion" },
    });
    await controller.crearCitas(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Hubo un error al crear el Citas");
  });

  test("actualizarCitaUsuario -> 200, 404 y 500", async () => {
    citasService.actualizarLasCitas.mockResolvedValue([1]);
    let ctx = mockReqRes({ params: { id: 1 }, body: { fecha: "2025-01-01" } });
    await controller.actualizarCitaUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    citasService.actualizarLasCitas.mockResolvedValue([0]);
    ctx = mockReqRes({ params: { id: 1 }, body: { fecha: "2025-01-01" } });
    await controller.actualizarCitaUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    citasService.actualizarLasCitas.mockRejectedValue(new Error("down"));
    ctx = mockReqRes({ params: { id: 1 }, body: { fecha: "2025-01-01" } });
    await controller.actualizarCitaUsuario(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test("actualizarCitaDoctor -> 404 si no se actualiza", async () => {
    citasService.actualizarLasCitas.mockResolvedValue([0]);
    const { req, res } = mockReqRes({ params: { id: 9 }, body: {} });
    await controller.actualizarCitaDoctor(req, res);
    expect(res.statusCode).toBe(404);
  });

  test("actualizarCitaDoctor -> 200 con requerimientos y notificaciones", async () => {
    citasService.actualizarLasCitas.mockResolvedValue([1]);
    citasService.buscarLasCitas.mockResolvedValue({
      id: 9,
      id_usuario: 10,
      id_doctor: 11,
      tipo: "evaluacion",
    });
    citasService.crearRequerimiento.mockResolvedValue({ id: 1 });

    const { req, res } = mockReqRes({
      params: { id: 9 },
      body: {
        requerimientos: [
          {
            descripcion: "A",
            frecuencia: "3",
            repeticiones: "5",
            fecha_inicio: "2025-01-01",
          },
          {
            descripcion: "B",
            frecuencia: "1",
            repeticiones: "2",
            fecha_inicio: "2025-01-02",
          },
        ],
      },
    });
    let call = 0;
    citasService.crearRequerimiento.mockImplementation(() => {
      call += 1;
      if (call === 2) return Promise.reject(new Error("inner"));
      return Promise.resolve({ id: call });
    });

    await controller.actualizarCitaDoctor(req, res);
    expect(res.statusCode).toBe(200);
    expect(citasService.notificarTotalCitasPendientesHoy).toHaveBeenCalledWith(
      11
    );
  });

  test("actualizarCitaDoctor -> 500 si service falla", async () => {
    citasService.actualizarLasCitas.mockRejectedValue(new Error("x"));
    const { req, res } = mockReqRes({ params: { id: 9 }, body: {} });
    await controller.actualizarCitaDoctor(req, res);
    expect(res.statusCode).toBe(500);
  });

  test("actualizarCitaDoctor -> notifica procedimiento cuando tipo es procedimiento", async () => {
    citasService.actualizarLasCitas.mockResolvedValue([1]);
    citasService.buscarLasCitas.mockResolvedValue({
      id: 7,
      id_usuario: 10,
      id_doctor: 12,
      tipo: "procedimiento",
    });
    const { req, res } = mockReqRes({ params: { id: 7 }, body: {} });
    await controller.actualizarCitaDoctor(req, res);
    expect(res.statusCode).toBe(200);
    expect(
      citasService.notificarTotalCitasRealizadasProcedimientoHoy
    ).toHaveBeenCalledWith(12);
  });

  test("crearOrdenDesdeCarrito -> 201 y 500", async () => {
    citasService.crearOrdenDesdeCarrito.mockResolvedValue({ id: 1 });
    let ctx = mockReqRes({ usuario: { id: 5 } });
    await controller.crearOrdenDesdeCarrito(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(201);

    citasService.crearOrdenDesdeCarrito.mockRejectedValue(new Error("down"));
    ctx = mockReqRes({ usuario: { id: 5 } });
    await controller.crearOrdenDesdeCarrito(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test("eliminarCitas -> 200", async () => {
    const { req, res } = mockReqRes({ params: { id: 12 } });
    await controller.eliminarCitas(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Citas eliminado" });
    expect(citasService.eliminarLasCitas).toHaveBeenCalledWith(12);
  });

  test("obtenerHorariosOcupados -> 400 sin fecha, 200 mapea duraciones, 500 en error", async () => {
    let ctx = mockReqRes({ params: {}, query: {} });
    await controller.obtenerHorariosOcupados(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);

    citasService.obtenerCitasPorFecha.mockResolvedValue([
      { id: 1, fecha: "2025-01-01T10:00:00Z", tipo: "evaluacion" },
      { id: 2, fecha: "2025-01-01T12:00:00Z", tipo: "procedimiento" },
    ]);
    ctx = mockReqRes({
      params: { fecha: "2025-01-01" },
      query: { doctorId: "9" },
    });
    await controller.obtenerHorariosOcupados(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    expect(ctx.res.body[0].duracion).toBe(30);
    expect(ctx.res.body[1].duracion).toBe(150);

    citasService.obtenerCitasPorFecha.mockRejectedValue(new Error("x"));
    ctx = mockReqRes({ params: { fecha: "2025-01-01" }, query: {} });
    await controller.obtenerHorariosOcupados(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test("citasPorDia -> 200, 404 y 500", async () => {
    citasService.obtenerCitasPorDia.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { fecha: "2025-01-01" },
    });
    await controller.citasPorDia(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    citasService.obtenerCitasPorDia.mockResolvedValue([]);
    ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { fecha: "2025-01-01" },
    });
    await controller.citasPorDia(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    citasService.obtenerCitasPorDia.mockRejectedValue(new Error("x"));
    ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { fecha: "2025-01-01" },
    });
    await controller.citasPorDia(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test("citasPorRango -> 200, 404 y 500", async () => {
    citasService.obtenerCitasPorRango.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { desde: "2025-01-01", hasta: "2025-01-07" },
    });
    await controller.citasPorRango(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    citasService.obtenerCitasPorRango.mockResolvedValue([]);
    ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { desde: "2025-01-01", hasta: "2025-01-07" },
    });
    await controller.citasPorRango(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    citasService.obtenerCitasPorRango.mockRejectedValue(new Error("x"));
    ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { desde: "2025-01-01", hasta: "2025-01-07" },
    });
    await controller.citasPorRango(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test("citasPorTipo -> 200, 404 y 500", async () => {
    citasService.obtenerCitasPorTipo.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { tipo: "evaluacion", fecha: "2025-01-02" },
    });
    await controller.citasPorTipo(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    citasService.obtenerCitasPorTipo.mockResolvedValue([]);
    ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { tipo: "evaluacion", fecha: "2025-01-02" },
    });
    await controller.citasPorTipo(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    citasService.obtenerCitasPorTipo.mockRejectedValue(new Error("x"));
    ctx = mockReqRes({
      params: { doctorId: 5 },
      query: { tipo: "evaluacion", fecha: "2025-01-02" },
    });
    await controller.citasPorTipo(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test("misCitas -> 200 y 500", async () => {
    citasService.obtenerMisCitas.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes({ usuario: { id: 88 } });
    await controller.misCitas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    citasService.obtenerMisCitas.mockRejectedValue(new Error("x"));
    ctx = mockReqRes({ usuario: { id: 88 } });
    await controller.misCitas(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test("actualizarEstadoCita -> 400 id inválido, 404 no encontrada, 200 ok y 409 error", async () => {
    let ctx = mockReqRes({ params: { id: "abc" }, body: {} });
    await controller.actualizarEstadoCita(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);

    citasService.cambiarEstadoCita.mockResolvedValue(null);
    ctx = mockReqRes({ params: { id: "9" }, body: {} });
    await controller.actualizarEstadoCita(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    citasService.cambiarEstadoCita.mockResolvedValue({ id: 9 });
    citasService.buscarLasCitas.mockResolvedValue({
      id: 9,
      id_doctor: 3,
      tipo: "evaluacion",
    });
    ctx = mockReqRes({
      params: { id: "9" },
      body: { estado: "realizada" },
      usuario: { id: 3 },
    });
    await controller.actualizarEstadoCita(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    expect(citasService.notificarTotalesMes).toHaveBeenCalledWith(3);

    const err = Object.assign(new Error("conflict"), { status: 409 });
    citasService.cambiarEstadoCita.mockRejectedValue(err);
    ctx = mockReqRes({ params: { id: "9" }, body: {} });
    await controller.actualizarEstadoCita(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(409);
  });

  test("actualizarEstadoCita -> notifica procedimiento cuando tipo es procedimiento", async () => {
    citasService.cambiarEstadoCita.mockResolvedValue({ id: 5 });
    citasService.buscarLasCitas.mockResolvedValue({
      id: 5,
      id_doctor: 2,
      tipo: "procedimiento",
    });
    const ctx = mockReqRes({
      params: { id: "5" },
      body: { estado: "realizada" },
      usuario: { id: 2 },
    });
    await controller.actualizarEstadoCita(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);
    expect(
      citasService.notificarTotalCitasRealizadasProcedimientoHoy
    ).toHaveBeenCalledWith(2);
  });

  test("marcarExamenesSubidos -> 403 no usuario, 200 ok, 500 con status", async () => {
    let ctx = mockReqRes({
      usuario: { id: 1, rol: "doctor" },
      params: { id: 2 },
    });
    await controller.marcarExamenesSubidos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(403);

    citasService.marcarExamenesSubidos.mockResolvedValue({ id: 2 });
    ctx = mockReqRes({ usuario: { id: 1, rol: "usuario" }, params: { id: 2 } });
    await controller.marcarExamenesSubidos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    const err = Object.assign(new Error("fail"), { status: 418 });
    citasService.marcarExamenesSubidos.mockRejectedValue(err);
    ctx = mockReqRes({ usuario: { id: 1, rol: "usuario" }, params: { id: 2 } });
    await controller.marcarExamenesSubidos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(418);
  });

  test("reagendar -> 200 y 500", async () => {
    citasService.reagendarCita.mockResolvedValue({ id: 1 });
    let ctx = mockReqRes({
      params: { id: 1 },
      body: { fecha: "2025-01-01" },
      usuario: { id: 9 },
    });
    await controller.reagendar(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    const err = Object.assign(new Error("x"), { status: 400 });
    citasService.reagendarCita.mockRejectedValue(err);
    ctx = mockReqRes({
      params: { id: 1 },
      body: { fecha: "x" },
      usuario: { id: 9 },
    });
    await controller.reagendar(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
  });

  test("consultarTodasLasCitasAsistente -> 200 y 500", async () => {
    citasService.consultarTodasLasCitasAsistente.mockResolvedValue([{ id: 1 }]);
    let ctx = mockReqRes();
    await controller.consultarTodasLasCitasAsistente(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(200);

    citasService.consultarTodasLasCitasAsistente.mockRejectedValue(
      new Error("x")
    );
    ctx = mockReqRes();
    await controller.consultarTodasLasCitasAsistente(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(500);
  });

  test("generarPDFExamenes -> 404 y 400 (retornos tempranos)", async () => {
    citasService.buscarLasCitas.mockResolvedValue(null);
    let ctx = mockReqRes({ params: { id: 1 } });
    await controller.generarPDFExamenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    citasService.buscarLasCitas.mockResolvedValue({
      id: 1,
      examenes_requeridos: "",
      fecha: "2025-01-01",
    });
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.generarPDFExamenes(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
  });

  test("generarPDFMedicamentos -> 404 y 400 (retornos tempranos)", async () => {
    citasService.buscarLasCitas.mockResolvedValue(null);
    let ctx = mockReqRes({ params: { id: 1 } });
    await controller.generarPDFMedicamentos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(404);

    citasService.buscarLasCitas.mockResolvedValue({
      id: 1,
      medicamentos_recetados: "",
      fecha: "2025-01-01",
    });
    ctx = mockReqRes({ params: { id: 1 } });
    await controller.generarPDFMedicamentos(ctx.req, ctx.res);
    expect(ctx.res.statusCode).toBe(400);
  });

  describe("PDF happy path (mockeando pdfkit)", () => {
    let MockDoc;
    beforeAll(() => {
      jest.resetModules();
      jest.doMock("pdfkit", () => {
        const chain = new Proxy({}, { get: () => () => chain });
        MockDoc = function () {
          this.page = { width: 600, height: 800 };
        };
        MockDoc.prototype.pipe = () => {};
        MockDoc.prototype.end = () => {};
        [
          "lineWidth",
          "rect",
          "stroke",
          "save",
          "fontSize",
          "fillColor",
          "opacity",
          "text",
          "restore",
          "font",
          "moveDown",
          "moveTo",
          "lineTo",
          "image",
        ].forEach((m) => {
          MockDoc.prototype[m] = function () {
            return this;
          };
        });
        return MockDoc;
      });
      jest.doMock("../services/CitasServices", () => citasService);
    });
    afterAll(() => {
      jest.dontMock("pdfkit");
      jest.dontMock("../services/CitasServices");
    });

    test("generarPDFExamenes -> 200 flujo completo", async () => {
      const ctrl = require("../controllers/CitasControllers");
      citasService.buscarLasCitas.mockResolvedValue({
        id: 1,
        fecha: "2025-01-01",
        tipo: "evaluacion",
        examenes_requeridos: "Hematología\nRX",
        doctor: { nombre: "Doc", ocupacion: "Medico" },
        usuario: { nombre: "Paciente" },
      });
      const { req, res } = {
        req: { params: { id: 1 } },
        res: {
          statusCode: 200,
          headers: {},
          setHeader(n, v) {
            this.headers[n] = v;
          },
          status(c) {
            this.statusCode = c;
            return this;
          },
          json(p) {
            this.body = p;
            return this;
          },
        },
      };
      await ctrl.generarPDFExamenes(req, res);
      expect(res.statusCode).toBe(200);
    });

    test("generarPDFMedicamentos -> 200 flujo completo", async () => {
      const ctrl = require("../controllers/CitasControllers");
      citasService.buscarLasCitas.mockResolvedValue({
        id: 2,
        fecha: "2025-01-02",
        tipo: "evaluacion",
        medicamentos_recetados: "Paracetamol 500mg",
        doctor: { nombre: "Doc", ocupacion: "Medico" },
        usuario: { nombre: "Paciente" },
      });
      const { req, res } = {
        req: { params: { id: 2 } },
        res: {
          statusCode: 200,
          headers: {},
          setHeader(n, v) {
            this.headers[n] = v;
          },
          status(c) {
            this.statusCode = c;
            return this;
          },
          json(p) {
            this.body = p;
            return this;
          },
        },
      };
      await ctrl.generarPDFMedicamentos(req, res);
      expect(res.statusCode).toBe(200);
    });

    test("generarPDFExamenes -> cubre observaciones y fallbacks de doctor/usuario", async () => {
      const ctrl = require("../controllers/CitasControllers");
      citasService.buscarLasCitas.mockResolvedValue({
        id: 20,
        fecha: "2025-01-04",
        tipo: "evaluacion",
        examenes_requeridos: "Prueba A",
        observaciones: "Observaciones clínicas importantes",
      });
      const { req, res } = {
        req: { params: { id: 20 } },
        res: {
          statusCode: 200,
          headers: {},
          setHeader(n, v) {
            this.headers[n] = v;
          },
          status(c) {
            this.statusCode = c;
            return this;
          },
          json(p) {
            this.body = p;
            return this;
          },
        },
      };
      await ctrl.generarPDFExamenes(req, res);
      expect(res.statusCode).toBe(200);
    });

    test("generarPDFMedicamentos -> cubre bloque de observaciones", async () => {
      const ctrl = require("../controllers/CitasControllers");
      citasService.buscarLasCitas.mockResolvedValue({
        id: 21,
        fecha: "2025-01-05",
        tipo: "evaluacion",
        medicamentos_recetados: "Medicamento X 1-0-1",
        observaciones: "Tomar con alimentos",
        doctor: { nombre: "Doc", ocupacion: "Medico" },
        usuario: { nombre: "Paciente" },
      });
      const { req, res } = {
        req: { params: { id: 21 } },
        res: {
          statusCode: 200,
          headers: {},
          setHeader(n, v) {
            this.headers[n] = v;
          },
          status(c) {
            this.statusCode = c;
            return this;
          },
          json(p) {
            this.body = p;
            return this;
          },
        },
      };
      await ctrl.generarPDFMedicamentos(req, res);
      expect(res.statusCode).toBe(200);
    });

    test("generarPDFExamenes -> hace warn cuando image lanza", async () => {
      const ctrl = require("../controllers/CitasControllers");
      MockDoc.prototype.image = function () {
        throw new Error("no image");
      };
      citasService.buscarLasCitas.mockResolvedValue({
        id: 3,
        fecha: "2025-01-03",
        tipo: "evaluacion",
        examenes_requeridos: "Lab",
        doctor: { nombre: "Doc", ocupacion: "Medico" },
        usuario: { nombre: "Paciente" },
      });
      const { req, res } = {
        req: { params: { id: 3 } },
        res: {
          statusCode: 200,
          headers: {},
          setHeader(n, v) {
            this.headers[n] = v;
          },
          status(c) {
            this.statusCode = c;
            return this;
          },
          json(p) {
            this.body = p;
            return this;
          },
        },
      };
      await ctrl.generarPDFExamenes(req, res);
      expect(res.statusCode).toBe(200);
      MockDoc.prototype.image = function () {
        return this;
      };
    });

    test("generarPDFMedicamentos -> usa fallback de fecha cuando toLocaleString lanza", async () => {
      const ctrl = require("../controllers/CitasControllers");
      const spy = jest.spyOn(Date.prototype, "toLocaleString");
      spy.mockImplementationOnce(() => {
        throw new Error("bad date");
      });
      spy.mockImplementation(() => "SAFE-DATE");
      citasService.buscarLasCitas.mockResolvedValue({
        id: 4,
        fecha: "X-INVALID",
        tipo: "evaluacion",
        medicamentos_recetados: "Ibuprofeno",
        doctor: { nombre: "Doc", ocupacion: "Medico" },
        usuario: { nombre: "Paciente" },
      });
      const { req, res } = {
        req: { params: { id: 4 } },
        res: {
          statusCode: 200,
          headers: {},
          setHeader(n, v) {
            this.headers[n] = v;
          },
          status(c) {
            this.statusCode = c;
            return this;
          },
          json(p) {
            this.body = p;
            return this;
          },
        },
      };
      await ctrl.generarPDFMedicamentos(req, res);
      expect(res.statusCode).toBe(200);
      spy.mockRestore();
    });
  });

  describe("PDF errores (mockeando pdfkit para lanzar)", () => {
    beforeAll(() => {
      jest.resetModules();
      jest.doMock("pdfkit", () => {
        return function ThrowingDoc() {
          throw new Error("ctor fail");
        };
      });
      jest.doMock("../services/CitasServices", () => citasService);
    });
    afterAll(() => {
      jest.dontMock("pdfkit");
      jest.dontMock("../services/CitasServices");
    });

    test("generarPDFExamenes -> 500 si falla creación documento", async () => {
      const ctrl = require("../controllers/CitasControllers");
      citasService.buscarLasCitas.mockResolvedValue({
        id: 10,
        examenes_requeridos: "Lab",
        fecha: "2025-01-01",
        doctor: {},
        usuario: {},
        tipo: "evaluacion",
      });
      const { req, res } = {
        req: { params: { id: 10 } },
        res: {
          statusCode: 200,
          headers: {},
          setHeader(n, v) {
            this.headers[n] = v;
          },
          status(c) {
            this.statusCode = c;
            return this;
          },
          json(p) {
            this.body = p;
            return this;
          },
        },
      };
      await ctrl.generarPDFExamenes(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Error al generar PDF" });
    });

    test("generarPDFMedicamentos -> 500 si falla creación documento", async () => {
      const ctrl = require("../controllers/CitasControllers");
      citasService.buscarLasCitas.mockResolvedValue({
        id: 11,
        medicamentos_recetados: "Med",
        fecha: "2025-01-01",
        doctor: {},
        usuario: {},
        tipo: "evaluacion",
      });
      const { req, res } = {
        req: { params: { id: 11 } },
        res: {
          statusCode: 200,
          headers: {},
          setHeader(n, v) {
            this.headers[n] = v;
          },
          status(c) {
            this.statusCode = c;
            return this;
          },
          json(p) {
            this.body = p;
            return this;
          },
        },
      };
      await ctrl.generarPDFMedicamentos(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Error al generar PDF" });
    });
  });
});
