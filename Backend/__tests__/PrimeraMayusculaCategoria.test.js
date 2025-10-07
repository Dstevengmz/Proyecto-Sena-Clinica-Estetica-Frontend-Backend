/*
  Propósito del archivo:
  Pruebas unitarias para el middleware PrimeraMayusculaCategoria: normaliza y capitaliza el campo nombre en categorías.

  Cobertura de pruebas:
  - capitalizarPrimera(): maneja strings, casos borde y acentos.
  - middleware: transforma req.body.nombre cuando es string; no se rompe con tipos no string y siempre llama a next().
*/

const Categoria = require('../middleware/PrimeraMayusculaCategoria');

describe('Middleware PrimeraMayusculaCategoria', () => {
  test('capitalizarPrimera: strings y casos borde', () => {
    expect(Categoria.capitalizarPrimera('  hola MUNDO  ')).toBe('Hola mundo');
    expect(Categoria.capitalizarPrimera('')).toBe('');
    expect(Categoria.capitalizarPrimera('   ')).toBe('');
    expect(Categoria.capitalizarPrimera(null)).toBe('');
    expect(Categoria.capitalizarPrimera(123)).toBe('');
    expect(Categoria.capitalizarPrimera('áÉ í')).toBe('Áé í');
  });

  test('middleware: transforma req.body.nombre cuando es string', () => {
    const req = { body: { nombre: '   MULTI   Palabras   ' } };
    const res = {};
    const next = jest.fn();
    Categoria.middleware(req, res, next);
    expect(req.body.nombre).toBe('Multi palabras');
    expect(next).toHaveBeenCalled();
  });

  test('middleware: no rompe si no hay body o no es string', () => {
    const req = { body: { nombre: 77 } };
    const res = {};
    const next = jest.fn();
    Categoria.middleware(req, res, next);
    expect(req.body.nombre).toBe(77);
    expect(next).toHaveBeenCalled();
  });
});
