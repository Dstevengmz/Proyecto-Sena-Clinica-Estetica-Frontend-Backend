/*
  Propósito del archivo:
  Validar la lógica de Servicios de Carrito (consultas, creación y borrado) contra modelos mockeados.

  Cobertura de pruebas:
  - listarCarritoPorUsuario: delega a findAll con include y errores propagados.
  - agregarAlCarrito: evita duplicados, crea item y retorna procedimiento; maneja errores.
  - eliminarDelCarrito: delega a destroy y maneja errores.
  - limpiarCarritoUsuario: delega a destroy por usuario y loguea errores.
*/

jest.mock("../models", () => ({
  carrito: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  procedimientos: { findByPk: jest.fn() },
}));
const models = require("../models");
jest.spyOn(console, "log").mockImplementation(() => {});

describe("Servicios de Carrito", () => {
  let svc;
  beforeEach(() => {
    jest.clearAllMocks();
    svc = require("../services/CarritoServices");
  });

  test("listarCarritoPorUsuario delega a findAll con include", async () => {
    models.carrito.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await svc.listarCarritoPorUsuario(9);
    expect(models.carrito.findAll).toHaveBeenCalledWith({
      where: { id_usuario: 9 },
      include: [{ model: models.procedimientos, as: "procedimiento" }],
    });
    expect(res).toEqual([{ id: 1 }]);
  });

  test("agregarAlCarrito evita duplicados", async () => {
    models.carrito.findOne.mockResolvedValue({ id: 1 });
    await expect(
      svc.agregarAlCarrito({ id_usuario: 1, id_procedimiento: 2 })
    ).rejects.toThrow(/ya está en el carrito/);
  });

  test("agregarAlCarrito crea item y devuelve procedimiento", async () => {
    models.carrito.findOne.mockResolvedValue(null);
    models.carrito.create.mockResolvedValue({ id: 10 });
    models.procedimientos.findByPk.mockResolvedValue({ id: 2, nombre: "Proc" });
    const res = await svc.agregarAlCarrito({
      id_usuario: 1,
      id_procedimiento: 2,
    });
    expect(models.carrito.create).toHaveBeenCalledWith({
      id_usuario: 1,
      id_procedimiento: 2,
    });
    expect(models.procedimientos.findByPk).toHaveBeenCalledWith(2);
    expect(res).toEqual({ id: 10, procedimiento: { id: 2, nombre: "Proc" } });
  });

  test("eliminarDelCarrito delega a destroy", async () => {
    models.carrito.destroy.mockResolvedValue(1);
    const res = await svc.eliminarDelCarrito(3);
    expect(models.carrito.destroy).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(res).toBe(1);
  });

  test("limpiarCarritoUsuario delega a destroy por usuario", async () => {
    models.carrito.destroy.mockResolvedValue(2);
    const res = await svc.limpiarCarritoUsuario(7);
    expect(models.carrito.destroy).toHaveBeenCalledWith({
      where: { id_usuario: 7 },
    });
    expect(res).toBe(2);
  });
  test("listarCarritoPorUsuario lanza error si findAll falla", async () => {
    models.carrito.findAll.mockRejectedValue(new Error("DB error"));
    await expect(svc.listarCarritoPorUsuario(1)).rejects.toThrow("DB error");
  });

  test("agregarAlCarrito lanza error si create falla", async () => {
    models.carrito.findOne.mockResolvedValue(null);
    models.carrito.create.mockRejectedValue(new Error("insert fail"));
    await expect(
      svc.agregarAlCarrito({ id_usuario: 1, id_procedimiento: 2 })
    ).rejects.toThrow("insert fail");
  });

  test("eliminarDelCarrito lanza error si destroy falla", async () => {
    models.carrito.destroy.mockRejectedValue(new Error("falló eliminar"));
    await expect(svc.eliminarDelCarrito(5)).rejects.toThrow("falló eliminar");
  });

  test("limpiarCarritoUsuario maneja errores correctamente", async () => {
    // Simula que falla la base de datos
    const fakeError = new Error("DB error");
    models.carrito.destroy.mockRejectedValue(fakeError);

    // Ejecuta el método
    await expect(svc.limpiarCarritoUsuario(7)).rejects.toThrow("DB error");

    // Verifica que el log fue llamado (opcional)
    expect(console.log).toHaveBeenCalledWith(
      "Error al limpiar el carrito del usuario:",
      fakeError
    );
  });
  
});

afterAll(() => {
  jest.restoreAllMocks();
});
