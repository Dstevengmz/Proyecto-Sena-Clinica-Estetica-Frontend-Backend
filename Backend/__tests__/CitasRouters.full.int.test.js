const request = require("supertest");
const express = require("express");

jest.mock("../middleware/Authorization", () => ({
  authorization: (req, _res, next) => {
    const role = req.headers["x-role"] || "doctor";
    const id = parseInt(req.headers["x-user-id"] || "1", 10);
    req.usuario = { id, rol: role };
    next();
  },
  verificarRol: () => (_req, _res, next) => next(),
  permitirDoctorOPropietarioPorIdHistorial: (_req, _res, next) => next(),
  permitirDoctorOPropietarioPorIdUsuario: (_req, _res, next) => next(),
}));

const mockCitasService = {
  listarLasCitas: jest.fn(),
  buscarLasCitas: jest.fn(),
  crearLasCitas: jest.fn(),
  actualizarLasCitas: jest.fn(),
  eliminarLasCitas: jest.fn(),
  obtenerCitasPorFecha: jest.fn(),
  crearOrdenDesdeCarrito: jest.fn(),
  obtenerCitasPorDia: jest.fn(),
  obtenerCitasPorRango: jest.fn(),
  obtenerCitasPorTipo: jest.fn(),
  obtenerMisCitas: jest.fn(),
  cambiarEstadoCita: jest.fn(),
  notificarTotalCitasCanceladas: jest.fn(),
  notificarTotalCitas: jest.fn(),
  notificarTotalCitasPendientesHoy: jest.fn(),
  notificarTotalCitasCanceladasHoy: jest.fn(),
  notificarTotalCitasRealizadasEvaluacionHoy: jest.fn(),
  notificarTotalCitasRealizadasProcedimientoHoy: jest.fn(),
  notificarTotalesDia: jest.fn(),
  notificarTotalesSemana: jest.fn(),
  notificarTotalesMes: jest.fn(),
  marcarExamenesSubidos: jest.fn(),
  crearRequerimiento: jest.fn(),
  reagendarCita: jest.fn(),
  consultarTodasLasCitasAsistente: jest.fn(),
};
jest.mock("../services/CitasServices", () => mockCitasService);

const CitasRouter = require("../routers/CitasRouters");

/*
  Propósito del archivo:
  Validar integralmente las rutas de Citas (controller + router), cubriendo listados, búsquedas, creación,
  edición, cancelación, generación de PDFs y reglas de permisos.

  Cobertura de pruebas:
  - Listado por rol (doctor/usuario) y validaciones de query.
  - Búsqueda por id con 200/404.
  - Creación por usuario (tipo por defecto evaluacion) y validación de tipo para doctor.
  - Edición por usuario/doctor, incluyendo requerimientos y notificaciones.
  - Cancelación con efectos colaterales (notificaciones de totales).
  - Generación de PDFs de órdenes (exámenes y medicamentos) y validaciones previas.
  - Reglas de autorización para marcar exámenes y acceso a "mis citas".
*/

describe("Routers de Citas - integración completa (controller + router)", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/apicitas", CitasRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /listarcitas como doctor llama al servicio con doctorId y devuelve lista", async () => {
    mockCitasService.listarLasCitas.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app)
      .get("/apicitas/listarcitas")
      .set("x-role", "doctor")
      .set("x-user-id", "42");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
    expect(mockCitasService.listarLasCitas).toHaveBeenCalledWith(42);
  });

  test("GET /listarcitas como usuario requiere doctorId en query o devuelve []", async () => {
    const res = await request(app)
      .get("/apicitas/listarcitas")
      .set("x-role", "usuario")
      .set("x-user-id", "7");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(mockCitasService.listarLasCitas).not.toHaveBeenCalled();
  });

  test("GET /listarcitas doctorId inválido para usuario devuelve 400", async () => {
    const res = await request(app)
      .get("/apicitas/listarcitas?doctorId=abc")
      .set("x-role", "usuario");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "doctorId inválido");
  });

  test("GET /buscarcitas/:id devuelve 200 cuando existe, 404 cuando no", async () => {
    mockCitasService.buscarLasCitas.mockResolvedValueOnce({ id: 10 });
    let res = await request(app)
      .get("/apicitas/buscarcitas/10")
      .set("x-role", "doctor");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 10 });

    mockCitasService.buscarLasCitas.mockResolvedValueOnce(null);
    res = await request(app)
      .get("/apicitas/buscarcitas/999")
      .set("x-role", "doctor");
    expect(res.status).toBe(404);
  });

  test("POST /crearcitas por usuario sin tipo pone por defecto evaluacion", async () => {
    mockCitasService.crearLasCitas.mockImplementation(async (payload) => ({
      ...payload,
      id: 1,
      id_doctor: 3,
      tipo: payload.tipo,
    }));
    const body = { fecha: "2025-01-01T10:00:00Z" };
    const res = await request(app)
      .post("/apicitas/crearcitas")
      .set("x-role", "usuario")
      .send(body);
    expect(res.status).toBe(201);
    expect(mockCitasService.crearLasCitas).toHaveBeenCalled();
    const calledPayload = mockCitasService.crearLasCitas.mock.calls[0][0];
    expect(calledPayload.tipo).toBe("evaluacion");
    expect(calledPayload._rol_creador).toBe("usuario");
  });

  test("POST /crearcitas tipo inválido para doctor devuelve 400", async () => {
    const res = await request(app)
      .post("/apicitas/crearcitas")
      .set("x-role", "doctor")
      .send({ tipo: "otra", fecha: "2025-01-01T10:00:00Z" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Tipo de cita inválido.");
  });

  test("PATCH /editarcitausuario/:id devuelve 200 cuando actualiza, 404 cuando no", async () => {
    mockCitasService.actualizarLasCitas.mockResolvedValueOnce([1]);
    let res = await request(app)
      .patch("/apicitas/editarcitausuario/5")
      .set("x-role", "usuario")
      .send({ fecha: "2025-01-02T12:00:00Z" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensaje");

    mockCitasService.actualizarLasCitas.mockResolvedValueOnce([0]);
    res = await request(app)
      .patch("/apicitas/editarcitausuario/5")
      .set("x-role", "usuario")
      .send({ fecha: "2025-01-02T12:00:00Z" });
    expect(res.status).toBe(404);
  });

  test("PATCH /editarcita-doctor/:id actualiza y crea requerimientos", async () => {
    mockCitasService.actualizarLasCitas.mockResolvedValueOnce([1]);
    mockCitasService.buscarLasCitas.mockResolvedValueOnce({
      id: 8,
      tipo: "evaluacion",
      id_doctor: 2,
      id_usuario: 9,
    });
    const res = await request(app)
      .patch("/apicitas/editarcita-doctor/8")
      .set("x-role", "doctor")
      .send({
        estado: "realizada",
        requerimientos: [
          {
            descripcion: "Medicamento A",
            frecuencia: "1",
            repeticiones: "2",
            fecha_inicio: "2025-01-03",
          },
          {
            descripcion: "Medicamento B",
            frecuencia: "2",
            repeticiones: "3",
            fecha_inicio: "2025-01-04",
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(mockCitasService.crearRequerimiento).toHaveBeenCalledTimes(2);
    expect(
      mockCitasService.notificarTotalCitasPendientesHoy
    ).toHaveBeenCalledWith(2);
  });

  test("PATCH /cancelarcita/:id devuelve 404 si no existe, 200 si cancela", async () => {
    mockCitasService.buscarLasCitas.mockResolvedValueOnce(null);
    let res = await request(app)
      .patch("/apicitas/cancelarcita/123")
      .set("x-role", "usuario");
    expect(res.status).toBe(404);

    mockCitasService.buscarLasCitas.mockResolvedValueOnce({
      id: 11,
      id_doctor: 5,
    });
    mockCitasService.actualizarLasCitas.mockResolvedValueOnce([1]);
    res = await request(app)
      .patch("/apicitas/cancelarcita/11")
      .set("x-role", "usuario");
    expect(res.status).toBe(200);
    expect(mockCitasService.notificarTotalesMes).toHaveBeenCalledWith(5);
  });

  test("GET /horarios/:fecha mapea citas a duraciones", async () => {
    mockCitasService.obtenerCitasPorFecha.mockResolvedValueOnce([
      { id: 1, fecha: "2025-01-01T10:00:00Z", tipo: "evaluacion" },
      { id: 2, fecha: "2025-01-01T13:00:00Z", tipo: "procedimiento" },
    ]);
    const res = await request(app)
      .get("/apicitas/horarios/2025-01-01")
      .set("x-role", "doctor");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 1,
        fecha: "2025-01-01T10:00:00Z",
        tipo: "evaluacion",
        duracion: 30,
      },
      {
        id: 2,
        fecha: "2025-01-01T13:00:00Z",
        tipo: "procedimiento",
        duracion: 150,
      },
    ]);
  });

  test("PATCH /editarestadocita/:id valida id, 404 si no existe, 200 en caso contrario", async () => {
    let res = await request(app)
      .patch("/apicitas/editarestadocita/abc")
      .set("x-role", "doctor")
      .send({});
    expect(res.status).toBe(400);

    mockCitasService.cambiarEstadoCita.mockResolvedValueOnce(null);
    res = await request(app)
      .patch("/apicitas/editarestadocita/15")
      .set("x-role", "doctor")
      .send({ estado: "realizada" });
    expect(res.status).toBe(404);

    mockCitasService.cambiarEstadoCita.mockResolvedValueOnce({
      id: 15,
      estado: "realizada",
    });
    mockCitasService.buscarLasCitas.mockResolvedValueOnce({
      id: 15,
      tipo: "evaluacion",
      id_doctor: 2,
    });
    res = await request(app)
      .patch("/apicitas/editarestadocita/15")
      .set("x-role", "doctor")
      .send({ estado: "realizada" });
    expect(res.status).toBe(200);
    expect(mockCitasService.notificarTotalesDia).toHaveBeenCalledWith(2);
  });

  test("GET /orden-examenes/pdf/:id maneja 404, 400 y 200", async () => {
    mockCitasService.buscarLasCitas.mockResolvedValueOnce(null);
    let res = await request(app)
      .get("/apicitas/orden-examenes/pdf/1")
      .set("x-role", "doctor");
    expect(res.status).toBe(404);

    mockCitasService.buscarLasCitas.mockResolvedValueOnce({
      id: 1,
      examenes_requeridos: null,
    });
    res = await request(app)
      .get("/apicitas/orden-examenes/pdf/1")
      .set("x-role", "doctor");
    expect(res.status).toBe(400);

    mockCitasService.buscarLasCitas.mockResolvedValueOnce({
      id: 1,
      examenes_requeridos: "Hemograma completo\nRadiografía",
      fecha: "2025-01-01T10:00:00Z",
      doctor: { nombre: "Dr. Test", ocupacion: "Médico" },
      usuario: { nombre: "Juan" },
      tipo: "evaluacion",
    });
    res = await request(app)
      .get("/apicitas/orden-examenes/pdf/1")
      .set("x-role", "doctor");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/pdf/);
  });

  test("GET /orden-medicamentos/pdf/:id maneja 404, 400 y 200", async () => {
    mockCitasService.buscarLasCitas.mockResolvedValueOnce(null);
    let res = await request(app)
      .get("/apicitas/orden-medicamentos/pdf/1")
      .set("x-role", "doctor");
    expect(res.status).toBe(404);

    mockCitasService.buscarLasCitas.mockResolvedValueOnce({
      id: 1,
      medicamentos_recetados: null,
    });
    res = await request(app)
      .get("/apicitas/orden-medicamentos/pdf/1")
      .set("x-role", "doctor");
    expect(res.status).toBe(400);

    mockCitasService.buscarLasCitas.mockResolvedValueOnce({
      id: 1,
      medicamentos_recetados: "Paracetamol 500mg\nIbuprofeno 400mg",
      fecha: "2025-01-01T10:00:00Z",
      doctor: { nombre: "Dr. Test", ocupacion: "Médico" },
      usuario: { nombre: "Juan" },
      tipo: "evaluacion",
    });
    res = await request(app)
      .get("/apicitas/orden-medicamentos/pdf/1")
      .set("x-role", "doctor");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/pdf/);
  });

  test("PATCH /marcar-examenes-subidos/:id devuelve 403 para no-usuario y 200 para usuario", async () => {
    let res = await request(app)
      .patch("/apicitas/marcar-examenes-subidos/1")
      .set("x-role", "doctor");
    expect(res.status).toBe(403);

    mockCitasService.marcarExamenesSubidos.mockResolvedValueOnce({ id: 1 });
    res = await request(app)
      .patch("/apicitas/marcar-examenes-subidos/1")
      .set("x-role", "usuario")
      .set("x-user-id", "9");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensaje");
  });

  test("GET /miscitas devuelve lista para usuario autenticado", async () => {
    mockCitasService.obtenerMisCitas.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app)
      .get("/apicitas/miscitas")
      .set("x-role", "usuario")
      .set("x-user-id", "17");
    expect(res.status).toBe(200);
    expect(mockCitasService.obtenerMisCitas).toHaveBeenCalledWith(17);
  });

  test("POST /requerimientos crea requerimiento (doctor)", async () => {
    mockCitasService.crearRequerimiento.mockResolvedValueOnce({ id: 99 });
    const res = await request(app)
      .post("/apicitas/requerimientos")
      .set("x-role", "doctor")
      .set("x-user-id", "2")
      .send({ descripcion: "Algo" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 99 });
    expect(mockCitasService.crearRequerimiento).toHaveBeenCalled();
  });

  test('PATCH /reagendarcita/:id actualiza cita usando service.reagendarCita', async () => {
    mockCitasService.reagendarCita.mockResolvedValueOnce({
      id: 4,
      fecha: "2025-02-01",
    });
    const res = await request(app)
      .patch("/apicitas/reagendarcita/4")
      .set("x-role", "usuario")
      .set("x-user-id", "50")
      .send({ fecha: "2025-02-01" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("cita");
    expect(mockCitasService.reagendarCita).toHaveBeenCalledWith(
      "4",
      { id: 50, rol: "usuario" },
      "2025-02-01"
    );
  });

  test('GET /listarcitastodosusuariodesdeasistente devuelve lista para asistente', async () => {
    mockCitasService.consultarTodasLasCitasAsistente.mockResolvedValueOnce([
      { id: 1 },
    ]);
    const res = await request(app)
      .get("/apicitas/listarcitastodosusuariodesdeasistente")
      .set("x-role", "asistente");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });
});
