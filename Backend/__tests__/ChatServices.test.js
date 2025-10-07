/*
  Propósito del archivo:
  Validar los Servicios de Chat: normalización de texto, extracción de palabras clave,
  búsqueda de procedimientos por keywords y flujo consultarr.

  Cobertura de pruebas:
  - normalizar: minúsculas, eliminación de tildes y casos vacíos.
  - extraerPalabrasClaveBasico: usa normalizar, filtra stopwords y maneja entradas vacías.
  - buscarProcedimientosPorKeywords: valida parámetros, delega al modelo, mapea resultados.
  - consultarr: mensajes cuando no hay keywords, no hay coincidencias y cuando sí hay resultados.
*/

jest.mock("../models", () => ({
  procedimientos: { findAll: jest.fn() },
  categoriaprocedimientos: {}
}));

const { procedimientos } = require("../models");
const ChatServices = require("../services/ChatServices");

describe("Servicios de Chat", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("normalizar convierte texto a minúsculas y quita tildes", async () => {
    const res = await ChatServices.normalizar("Árbol ÉLÉCTRICO");
    expect(res).toBe("arbol electrico");
  });

  test("normalizar devuelve cadena vacía si texto no se pasa", async () => {
    const res = await ChatServices.normalizar();
    expect(res).toBe("");
  });

  test("extraerPalabrasClaveBasico usa normalizar y filtra correctamente", async () => {
    const spyNorm = jest.spyOn(ChatServices, "normalizar");
    const palabras = await ChatServices.extraerPalabrasClaveBasico("Masaje facial con crema");
    expect(spyNorm).toHaveBeenCalledWith("Masaje facial con crema");
    expect(Array.isArray(palabras)).toBe(true);
    expect(palabras.length).toBeGreaterThan(0);
  });

  test("extraerPalabrasClaveBasico devuelve [] si texto vacío", async () => {
    const resultado = await ChatServices.extraerPalabrasClaveBasico("");
    expect(resultado).toEqual([]);
  });

  test("extraerPalabrasClaveBasico sin argumento devuelve []", async () => {
    const resultado = await ChatServices.extraerPalabrasClaveBasico();
    expect(resultado).toEqual([]);
  });

  test("extraerPalabrasClaveBasico devuelve [] si el texto solo contiene palabras vacías", async () => {
    const resultado = await ChatServices.extraerPalabrasClaveBasico("de la y el o a los");
    expect(resultado).toEqual([]);
  });

  test("buscarProcedimientosPorKeywords devuelve [] si lista vacía o no es array", async () => {
    const r1 = await ChatServices.buscarProcedimientosPorKeywords(null);
    const r2 = await ChatServices.buscarProcedimientosPorKeywords([]);
    expect(r1).toEqual([]);
    expect(r2).toEqual([]);
    expect(procedimientos.findAll).not.toHaveBeenCalled();
  });

  test("buscarProcedimientosPorKeywords maneja ambos casos de validación del parámetro", async () => {
    const sinArray = await ChatServices.buscarProcedimientosPorKeywords("texto");
    const vacio = await ChatServices.buscarProcedimientosPorKeywords([]);
    expect(sinArray).toEqual([]);
    expect(vacio).toEqual([]);
  });

  test("buscarProcedimientosPorKeywords sin argumentos retorna [] y no consulta", async () => {
    const res = await ChatServices.buscarProcedimientosPorKeywords();
    expect(res).toEqual([]);
    expect(procedimientos.findAll).not.toHaveBeenCalled();
  });

  test("buscarProcedimientosPorKeywords busca con like y mapea resultados", async () => {
    procedimientos.findAll.mockResolvedValue([
      {
        id: 1,
        nombre: "Limpieza facial",
        descripcion: "Tratamiento de piel",
        precio: 10000,
        imagen: "foto.jpg",
        categoria: { nombre: "Facial" },
      },
      {
        id: 2,
        nombre: "Masaje corporal",
        descripcion: "Relajante",
        precio: 200,
        imagen: "img.jpg",
        categoria: null,
      },
    ]);

    const resultado = await ChatServices.buscarProcedimientosPorKeywords(["facial", "piel"], 10);
    expect(procedimientos.findAll).toHaveBeenCalled();
    expect(resultado.length).toBe(2);
    expect(resultado[0]).toMatchObject({
      id: 1,
      nombre: "Limpieza facial",
      categoria: "Facial",
    });
    expect(resultado[1].categoria).toBe("Sin categoría");
  });

  test("consultarr devuelve mensaje si no hay palabras clave", async () => {
    jest.spyOn(ChatServices, "extraerPalabrasClaveBasico").mockResolvedValueOnce([]);
    const res = await ChatServices.consultarr("de la y el");
    expect(res.ok).toBe(true);
    expect(res.items).toEqual([]);
    expect(res.respuesta).toMatch(/No pude identificar palabras clave/);
  });

  test("consultarr devuelve mensaje si no encuentra coincidencias", async () => {
    jest.spyOn(ChatServices, "extraerPalabrasClaveBasico").mockResolvedValueOnce(["facial"]);
    jest.spyOn(ChatServices, "buscarProcedimientosPorKeywords").mockResolvedValueOnce([]);
    const res = await ChatServices.consultarr("facial");
    expect(res.respuesta).toMatch(/No encontré coincidencias/);
  });


  
  test("consultarr devuelve resultados cuando hay coincidencias", async () => {
    jest.spyOn(ChatServices, "extraerPalabrasClaveBasico").mockResolvedValueOnce(["facial"]);
    jest.spyOn(ChatServices, "buscarProcedimientosPorKeywords").mockResolvedValueOnce([
      { id: 1, nombre: "Facial básico" },
    ]);
    const res = await ChatServices.consultarr("facial");
    expect(res.ok).toBe(true);
    expect(res.items.length).toBe(1);
    expect(res.respuesta).toMatch(/Estos procedimientos/);
  });
});
