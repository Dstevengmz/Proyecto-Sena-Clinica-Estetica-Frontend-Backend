/*
  Propósito del archivo:
  Validar los Servicios de Categoría de Procedimientos: listar, buscar, crear, actualizar y eliminar,
  incluyendo normalización de nombres y manejo de errores/duplicados.

  Cobertura de pruebas:
  - Listar/buscar: delegación al modelo y errores.
  - Crear: validaciones, duplicados y creación exitosa.
  - Actualizar: validaciones, duplicados, éxito y errores.
  - Eliminar: éxito y errores.
  - Utilidades: normalizeNombre casos base y cuando no hay nombre a actualizar.
*/

jest.mock("../models", () => ({
  categoriaprocedimientos: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  procedimientos: {},
}));

const {
  service: svc,
  normalizeNombre,
} = require("../services/CategoriaProcedimientosServices");

const models = require("../models");

jest.mock("sequelize", () => ({
  Op: { and: Symbol("and"), ne: Symbol("ne") },
  fn: jest.fn((a, b) => `${a}(${b})`),
  col: jest.fn((c) => `col(${c})`),
  where: jest.fn((a, b) => ({ [a]: b })),
}));

describe("Servicios de Categoría de Procedimientos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listarLasCategorias devuelve lista", async () => {
    const data = [{ id: 1, nombre: "Faciales" }];
    models.categoriaprocedimientos.findAll.mockResolvedValue(data);
    const res = await svc.listarLasCategorias();
    expect(models.categoriaprocedimientos.findAll).toHaveBeenCalled();
    expect(res).toEqual(data);
  });

  test("listarLasCategorias lanza error si falla DB", async () => {
    models.categoriaprocedimientos.findAll.mockRejectedValue(
      new Error("DB error")
    );
    await expect(svc.listarLasCategorias()).rejects.toThrow("DB error");
  });

  test("buscarLaCategoria devuelve categoría por id", async () => {
    models.categoriaprocedimientos.findByPk.mockResolvedValue({
      id: 2,
      nombre: "Corporal",
    });
    const res = await svc.buscarLaCategoria(2);
    expect(models.categoriaprocedimientos.findByPk).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ include: expect.any(Array) })
    );
    expect(res).toEqual({ id: 2, nombre: "Corporal" });
  });

  test("buscarLaCategoria lanza error si falla", async () => {
    models.categoriaprocedimientos.findByPk.mockRejectedValue(
      new Error("fail")
    );
    await expect(svc.buscarLaCategoria(1)).rejects.toThrow("fail");
  });

  test("crearLaCategoria lanza error si nombre vacío", async () => {
    await expect(svc.crearLaCategoria({ nombre: "   " })).rejects.toThrow(
      /requerido/i
    );
  });

  test("crearLaCategoria lanza error si ya existe", async () => {
    models.categoriaprocedimientos.findOne.mockResolvedValue({ id: 1 });
    await expect(svc.crearLaCategoria({ nombre: "Faciales" })).rejects.toThrow(
      /ya existe/i
    );
  });

  test("crearLaCategoria crea una nueva categoría", async () => {
    models.categoriaprocedimientos.findOne.mockResolvedValue(null);
    models.categoriaprocedimientos.create.mockResolvedValue({
      id: 10,
      nombre: "Nueva",
    });
    const res = await svc.crearLaCategoria({ nombre: " Nueva " });
    expect(models.categoriaprocedimientos.create).toHaveBeenCalledWith({
      nombre: "Nueva",
    });
    expect(res).toEqual({ id: 10, nombre: "Nueva" });
  });

  test("crearLaCategoria lanza error genérico si falla DB", async () => {
    models.categoriaprocedimientos.findOne.mockRejectedValue(
      new Error("fallo DB")
    );
    await expect(svc.crearLaCategoria({ nombre: "Test" })).rejects.toThrow(
      "fallo DB"
    );
  });

  test("actualizarLaCategoria lanza error si nombre vacío", async () => {
    await expect(
      svc.actualizarLaCategoria(1, { nombre: "  " })
    ).rejects.toThrow(/requerido/i);
  });
  test("actualizarLaCategoria lanza error si nombre duplicado", async () => {
    models.categoriaprocedimientos.findOne.mockResolvedValue({ id: 9 });
    await expect(
      svc.actualizarLaCategoria(1, { nombre: "Duplicada" })
    ).rejects.toThrow(/ya existe/i);
  });

  test("actualizarLaCategoria actualiza correctamente", async () => {
    models.categoriaprocedimientos.findOne.mockResolvedValue(null);
    models.categoriaprocedimientos.update.mockResolvedValue([1]);
    const res = await svc.actualizarLaCategoria(5, { nombre: "Ok" });
    expect(models.categoriaprocedimientos.update).toHaveBeenCalledWith(
      { nombre: "Ok" },
      { where: { id: 5 } }
    );
    expect(res).toEqual([1]);
  });

  test("actualizarLaCategoria lanza error si falla DB", async () => {
    models.categoriaprocedimientos.update.mockRejectedValue(
      new Error("Fallo update")
    );
    await expect(
      svc.actualizarLaCategoria(1, { nombre: "Nuevo" })
    ).rejects.toThrow("Fallo update");
  });

  test("eliminarLaCategoria elimina correctamente", async () => {
    models.categoriaprocedimientos.destroy.mockResolvedValue(1);
    const res = await svc.eliminarLaCategoria(7);
    expect(models.categoriaprocedimientos.destroy).toHaveBeenCalledWith({
      where: { id: 7 },
    });
    expect(res).toBe(1);
  });

  test("eliminarLaCategoria lanza error si falla", async () => {
    models.categoriaprocedimientos.destroy.mockRejectedValue(new Error("fail"));
    await expect(svc.eliminarLaCategoria(1)).rejects.toThrow("fail");
  });

  test("normalizeNombre devuelve cadena vacía si el valor no es string", () => {
    expect(normalizeNombre(null)).toBe("");
    expect(normalizeNombre(123)).toBe("");
  });

  test("actualizarLaCategoria funciona cuando datos no tiene nombre", async () => {
    models.categoriaprocedimientos.update.mockResolvedValue([1]);
    const res = await svc.actualizarLaCategoria(9, { descripcion: "extra" });
    expect(models.categoriaprocedimientos.update).toHaveBeenCalledWith(
      { descripcion: "extra" },
      { where: { id: 9 } }
    );
    expect(res).toEqual([1]);
  });
});
