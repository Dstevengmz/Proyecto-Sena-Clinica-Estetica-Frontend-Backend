// Mock models and cloudinary BEFORE requiring the controller
jest.mock("../models", () => ({
  procedimientoimagenes: { bulkCreate: jest.fn(), findAll: jest.fn(), destroy: jest.fn() },
  procedimientos: { update: jest.fn() },
}));
jest.mock("cloudinary", () => ({
  v2: { config: jest.fn(), uploader: { destroy: jest.fn() } },
}));

jest.mock("../services/ProcedimientosServices", () => ({
  listarLosProcedimientos: jest.fn(),
  listarLosProcedimientosPorCategoria: jest.fn(),
  buscarLosProcedimientos: jest.fn(),
  actualizarLosProcedimientos: jest.fn(),
}));
const procService = require("../services/ProcedimientosServices");

const ProcedimientosController = require("../controllers/ProcedimientoControllers");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

/*
  Propósito del archivo:
  Pruebas unitarias del Controlador de Procedimientos: rutas clave de listado y actualización con validaciones.
*/

describe("Controlador de Procedimientos (unit)", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listarProcedimientos: sin categoria, retorna lista (200)", async () => {
    const req = { query: {} };
    const res = mockRes();
    procService.listarLosProcedimientos.mockResolvedValueOnce([{ id: 1 }]);
    await ProcedimientosController.listarProcedimientos(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test("actualizarProcedimientos: id inválido retorna 400", async () => {
    const req = { params: { id: "abc" }, body: {} };
    const res = mockRes();
    await ProcedimientosController.actualizarProcedimientos(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
  });

  test("actualizarProcedimientos: no encontrado retorna 404", async () => {
    const req = { params: { id: "7" }, body: { precio: "10", duracion: "30" } };
    const res = mockRes();
    procService.buscarLosProcedimientos.mockResolvedValueOnce(null);
    await ProcedimientosController.actualizarProcedimientos(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Procedimiento no encontrado" });
  });
});
