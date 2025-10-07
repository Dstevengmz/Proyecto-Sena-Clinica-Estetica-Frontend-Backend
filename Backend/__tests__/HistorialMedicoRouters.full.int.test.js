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

const mockHistService = {
  listarLosHistorialesClinicos: jest.fn(),
  buscarLosHistorialesClinicos: jest.fn(),
  buscarLosHistorialesClinicosPorUsuario: jest.fn(),
  crearLosHistorialesClinicos: jest.fn(),
  actualizarLosHistorialesClinicos: jest.fn(),
  eliminarLosHistorialesClinicos: jest.fn(),
};
jest.mock("../services/HistorialMedicoServices", () => mockHistService);

const HistorialRouter = require("../routers/HistorialMedicoRouters");

/*
  Propósito del archivo:
  Probar integralmente las rutas de Historial Médico, incluyendo permisos y validaciones.

  Cobertura de pruebas:
  - Listado, búsqueda por id y por usuario.
  - Restricción de acceso al historial propio.
  - Creación, edición con validaciones (400/404) y eliminación.
*/

describe("Routers de Historial Médico - integración completa", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/apihistorial", HistorialRouter);
  });

  beforeEach(() => jest.clearAllMocks());

  test("GET /listarhistorialclinico devuelve lista", async () => {
    mockHistService.listarLosHistorialesClinicos.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app)
      .get("/apihistorial/listarhistorialclinico")
      .set("x-role", "asistente");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test("GET /buscarhistorialclinico/:id devuelve 200/404", async () => {
    mockHistService.buscarLosHistorialesClinicos.mockResolvedValueOnce({ id: 9 });
    let res = await request(app)
      .get("/apihistorial/buscarhistorialclinico/9")
      .set("x-role", "doctor");
    expect(res.status).toBe(200);

    mockHistService.buscarLosHistorialesClinicos.mockResolvedValueOnce(null);
    res = await request(app)
      .get("/apihistorial/buscarhistorialclinico/9")
      .set("x-role", "doctor");
    expect(res.status).toBe(404);
  });

  test("GET /buscarhistorialclinicoporusuario/:id devuelve 200/404", async () => {
    mockHistService.buscarLosHistorialesClinicosPorUsuario.mockResolvedValueOnce({ id: 4 });
    let res = await request(app)
      .get("/apihistorial/buscarhistorialclinicoporusuario/4")
      .set("x-role", "doctor");
    expect(res.status).toBe(200);

    mockHistService.buscarLosHistorialesClinicosPorUsuario.mockResolvedValueOnce(null);
    res = await request(app)
      .get("/apihistorial/buscarhistorialclinicoporusuario/4")
      .set("x-role", "doctor");
    expect(res.status).toBe(404);
  });

  test("GET /mihistorialclinico/:id exige propietario", async () => {
  // Acceso denegado cuando id != usuario del token
    let res = await request(app)
      .get("/apihistorial/mihistorialclinico/2")
      .set("x-role", "usuario")
      .set("x-user-id", "1");
    expect(res.status).toBe(403);

    mockHistService.buscarLosHistorialesClinicosPorUsuario.mockResolvedValueOnce({ id: 1 });
    res = await request(app)
      .get("/apihistorial/mihistorialclinico/5")
      .set("x-role", "usuario")
      .set("x-user-id", "5");
    expect(res.status).toBe(200);
  });

  test("POST /crearhistorialclinico devuelve 201", async () => {
    mockHistService.crearLosHistorialesClinicos.mockResolvedValueOnce({ id: 3 });
    const res = await request(app)
      .post("/apihistorial/crearhistorialclinico")
      .set("x-role", "doctor")
      .send({ usuario_id: 1 });
    expect(res.status).toBe(201);
  });

  test("PATCH /editarhistorialclinico/:id valida id y no encontrado", async () => {
  // 400 id inválido
    let res = await request(app)
      .patch("/apihistorial/editarhistorialclinico/abc")
      .set("x-role", "doctor")
      .send({ enfermedades: "X" });
    expect(res.status).toBe(400);

  // 404 no encontrado
    mockHistService.actualizarLosHistorialesClinicos.mockResolvedValueOnce([0]);
    res = await request(app)
      .patch("/apihistorial/editarhistorialclinico/9")
      .set("x-role", "doctor")
      .send({ enfermedades: "X" });
    expect(res.status).toBe(404);

  // 200 ok
    mockHistService.actualizarLosHistorialesClinicos.mockResolvedValueOnce([1]);
    res = await request(app)
      .patch("/apihistorial/editarhistorialclinico/9")
      .set("x-role", "doctor")
      .send({ enfermedades: "X" });
    expect(res.status).toBe(200);
  });

  test("DELETE /eliminarhistorialclinico/:id devuelve 200", async () => {
    const res = await request(app)
      .delete("/apihistorial/eliminarhistorialclinico/2")
      .set("x-role", "asistente");
    expect(res.status).toBe(200);
  });
});
