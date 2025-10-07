const HistorialController = require("../controllers/HistorialMedicoControllers");

jest.mock("../services/HistorialMedicoServices", () => ({
  listarLosHistorialesClinicos: jest.fn(),
  buscarLosHistorialesClinicosPorUsuario: jest.fn(),
  actualizarLosHistorialesClinicos: jest.fn(),
}));
const histService = require("../services/HistorialMedicoServices");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

/*
  Propósito del archivo:
  Pruebas unitarias del Controlador de Historial Médico para cubrir validaciones
  y flujos de acceso a miHistorialMedico y actualización.
*/

describe("Controlador de Historial Médico (unit)", () => {
  beforeEach(() => jest.clearAllMocks());

  test("miHistorialMedico: bloquea acceso si id != token (403)", async () => {
    const req = { params: { id: "2" }, usuario: { id: 1 } };
    const res = mockRes();
    await HistorialController.miHistorialMedico(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("miHistorialMedico: retorna historial si id coincide (200)", async () => {
    const req = { params: { id: "5" }, usuario: { id: 5 } };
    const res = mockRes();
    histService.buscarLosHistorialesClinicosPorUsuario.mockResolvedValueOnce({ id: 5 });
    await HistorialController.miHistorialMedico(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: 5 });
  });

  test("actualizarHistorialMedico: id inválido retorna 400", async () => {
    const req = { params: { id: "abc" }, body: {} };
    const res = mockRes();
    await HistorialController.actualizarHistorialMedico(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
  });
});
