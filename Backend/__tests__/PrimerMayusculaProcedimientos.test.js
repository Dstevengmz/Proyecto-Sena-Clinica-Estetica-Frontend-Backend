/*
  Propósito del archivo:
  Pruebas unitarias para el middleware PrimerMayusculaProcedimientos: capitaliza y normaliza campos de texto de procedimientos.

  Cobertura de pruebas:
  - capitalizarPrimera(): normaliza espacios, capitaliza primera letra y maneja entradas vacías o indefinidas.
  - middleware: transforma nombre, descripcion y recomendaciones_previas si son cadenas; ignora tipos no string y siempre llama a next().
*/

const Proc = require('../middleware/PrimerMayusculaProcedimientos');

describe('Middleware PrimerMayusculaProcedimientos', () => {
  test('capitalizarPrimera: normaliza espacios y capitaliza', () => {
    expect(Proc.capitalizarPrimera('   lA  DESCripcion   ')).toBe('La descripcion');
    expect(Proc.capitalizarPrimera('')).toBe('');
    expect(Proc.capitalizarPrimera('   ')).toBe('');
    expect(Proc.capitalizarPrimera(undefined)).toBe('');
  });

  test('middleware: transforma nombre, descripcion y recomendaciones_previas', () => {
    const req = { body: { nombre: '  PROCeDimiento   X ', descripcion: '   DesC  extensa ', recomendaciones_previas: '  AGUA  ayuno   ' } };
    const res = {};
    const next = jest.fn();
    Proc.middleware(req, res, next);
    expect(req.body.nombre).toBe('Procedimiento x');
    expect(req.body.descripcion).toBe('Desc extensa');
    expect(req.body.recomendaciones_previas).toBe('Agua ayuno');
    expect(next).toHaveBeenCalled();
  });

  test('middleware: ignora campos no string y sigue con next', () => {
    const req = { body: { nombre: 10, descripcion: null, recomendaciones_previas: {} } };
    const res = {};
    const next = jest.fn();
    Proc.middleware(req, res, next);
    expect(req.body.nombre).toBe(10);
    expect(req.body.descripcion).toBeNull();
    expect(typeof req.body.recomendaciones_previas).toBe('object');
    expect(next).toHaveBeenCalled();
  });
});
