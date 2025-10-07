const CitasController = require("../controllers/CitasControllers");

jest.mock("../services/CitasServices", () => ({
  crearLasCitas: jest.fn(),
  cambiarEstadoCita: jest.fn(),
}));
const citasService = require("../services/CitasServices");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res;
}

describe("CitasControllers (unit)", () => {
  beforeEach(() => jest.clearAllMocks());

  test("crearCitas: usuario no puede crear tipo procedimiento (400)", async () => {
    const req = {
      usuario: { id: 5, rol: "usuario" },
      body: { tipo: "procedimiento", fecha: "2025-01-01T10:00:00Z" },
    };
    const res = mockRes();
    await CitasController.crearCitas(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
    expect(citasService.crearLasCitas).not.toHaveBeenCalled();
  });

  test("actualizarEstadoCita: id inválido retorna 400", async () => {
    const req = { usuario: { id: 1, rol: "doctor" }, params: { id: "abc" }, body: {} };
    const res = mockRes();
    await CitasController.actualizarEstadoCita(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
  });
});
