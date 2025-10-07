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
}));

// Mock Multer to accept fields and attach files to req.files
jest.mock("../middleware/Multer", () => ({
  fields: () => (req, _res, next) => {
    req.files = req.files || {};
    next();
  },
}));

// Mock title-casing middleware to pass through
jest.mock("../middleware/PrimerMayusculaProcedimientos", () => ({
  middleware: (_req, _res, next) => next(),
}));

const mockProcService = {
  listarLosProcedimientos: jest.fn(),
  listarLosProcedimientosPorCategoria: jest.fn(),
  buscarLosProcedimientos: jest.fn(),
  crearLosProcedimientos: jest.fn(),
  actualizarLosProcedimientos: jest.fn(),
  eliminarLosProcedimientos: jest.fn(),
};
jest.mock("../services/ProcedimientosServices", () => mockProcService);

// Mock models used for images bulkCreate/update
jest.mock("../models", () => ({
  procedimientoimagenes: { bulkCreate: jest.fn(), findAll: jest.fn(), destroy: jest.fn() },
  procedimientos: { update: jest.fn() },
}));

// Mock cloudinary uploader
jest.mock("cloudinary", () => ({
  v2: {
    uploader: { destroy: jest.fn() },
    config: jest.fn(),
  },
}));

const ProcedimientoRouter = require("../routers/ProcedimientoRouters");

/*
  Propósito del archivo:
  Probar integralmente las rutas de Procedimientos (listar, filtrar, buscar, crear, editar, eliminar).

  Cobertura de pruebas:
  - Listado general y por categoría.
  - Búsqueda por id con 200/404.
  - Creación con subida de archivos (mockeada) y actualización con validaciones.
  - Eliminación.
*/

describe("Routers de Procedimientos - integración completa", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/apiprocedimientos", ProcedimientoRouter);
  });

  beforeEach(() => jest.clearAllMocks());

  test("GET /listarprocedimiento devuelve lista", async () => {
    mockProcService.listarLosProcedimientos.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).get("/apiprocedimientos/listarprocedimiento");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test("GET /categorias/:categoriaId/procedimientos filtra por categoría", async () => {
    mockProcService.listarLosProcedimientosPorCategoria.mockResolvedValueOnce([{ id: 2 }]);
    const res = await request(app).get("/apiprocedimientos/categorias/3/procedimientos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 2 }]);
  });

  test("GET /buscarprocedimiento/:id devuelve 200/404", async () => {
    mockProcService.buscarLosProcedimientos.mockResolvedValueOnce({ id: 9 });
    let res = await request(app).get("/apiprocedimientos/buscarprocedimiento/9");
    expect(res.status).toBe(200);
    mockProcService.buscarLosProcedimientos.mockResolvedValueOnce(null);
    res = await request(app).get("/apiprocedimientos/buscarprocedimiento/9");
    expect(res.status).toBe(404);
  });

  test("POST /crearprocedimiento crea con archivos y devuelve 201", async () => {
    mockProcService.crearLosProcedimientos.mockResolvedValueOnce({ id: 5, nombre: "Proc" });
    const res = await request(app)
      .post("/apiprocedimientos/crearprocedimiento")
      .set("x-role", "doctor")
      .send({ nombre: "Proc", precio: "100", duracion: "60", requiere_evaluacion: "true", categoriaId: "1" });
    expect(res.status).toBe(201);
    expect(mockProcService.crearLosProcedimientos).toHaveBeenCalled();
  });

  test("PATCH /editarprocedimiento/:id maneja 400 id inválido, 404 no encontrado y 200 ok", async () => {
    let res = await request(app)
      .patch("/apiprocedimientos/editarprocedimiento/abc")
      .set("x-role", "doctor")
      .send({ nombre: "X", precio: "10", duracion: "30" });
    expect(res.status).toBe(400);

    mockProcService.buscarLosProcedimientos.mockResolvedValueOnce(null);
    res = await request(app)
      .patch("/apiprocedimientos/editarprocedimiento/7")
      .set("x-role", "doctor")
      .send({ nombre: "X", precio: "10", duracion: "30" });
    expect(res.status).toBe(404);

    mockProcService.buscarLosProcedimientos.mockResolvedValueOnce({ id: 7, imagen: null });
    mockProcService.actualizarLosProcedimientos.mockResolvedValueOnce([1]);
    res = await request(app)
      .patch("/apiprocedimientos/editarprocedimiento/7")
      .set("x-role", "doctor")
      .send({ nombre: "X", precio: "10", duracion: "30" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensaje");
  });

  test("DELETE /eliminarprocedimiento/:id devuelve 200", async () => {
    const res = await request(app)
      .delete("/apiprocedimientos/eliminarprocedimiento/3")
      .set("x-role", "doctor");
    expect(res.status).toBe(200);
  });
});
