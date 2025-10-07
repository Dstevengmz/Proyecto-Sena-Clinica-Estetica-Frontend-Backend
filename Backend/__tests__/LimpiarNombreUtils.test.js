/*
  Propósito del archivo:
  Pruebas unitarias para la utilidad de formateo de nombres (normalización de espacios y capitalización por palabra).

  Cobertura de pruebas:
  - Capitaliza cada palabra y elimina espacios extra.
  - Maneja mayúsculas/minúsculas mixtas y acentos.
  - Devuelve cadena vacía cuando la entrada contiene solo espacios.
*/

const formatearNombre = require('../assets/LimpiarNombreUtils');

describe('Utilidad formatearNombre', () => {
  it('capitaliza cada palabra y quita espacios extra', () => {
    expect(formatearNombre('  juan   perez  gomez ')).toBe('Juan Perez Gomez');
  });

  it('maneja nombres con mayúsculas/minúsculas mixtas', () => {
    expect(formatearNombre('mArÍa loPeZ')).toBe('María Lopez');
  });

  it('retorna cadena vacía si recibe solo espacios', () => {
    expect(formatearNombre('   ')).toBe('');
  });
});
