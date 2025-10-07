/*
  Propósito del archivo:
  Pruebas unitarias para la utilidad HorariosDisponibles (generación de horarios disponibles y mapa de duraciones).

  Cobertura de pruebas:
  - horarios(): retorna un arreglo de horas desde 08:00 hasta 18:00 en intervalos de 30 minutos, excluye 12:00 por pausa de almuerzo,
    valida elementos inicial y final, y verifica incrementos de 30 minutos entre valores consecutivos (muestra).
  - duraciones(): retorna el mapa esperado de duraciones por tipo de cita.
*/

const Horarios = require('../assets/HorariosDisponibles');

describe('HorariosDisponibles - utilidades de agenda', () => {
  test('horarios retorna lista esperada (08:00 a 18:00 con intervalos de 30m)', () => {
    const hs = Horarios.horarios();
    expect(Array.isArray(hs)).toBe(true);
    expect(hs.length).toBeGreaterThan(0);
    expect(hs[0]).toBe('08:00');
    // En este proyecto hay pausa de almuerzo (no incluye 12:00)
    expect(hs.includes('12:00')).toBe(false);
    expect(hs.at(-1)).toBe('18:00');

    // Verificar presencia de 11:30 y 13:00 (pausa)
    expect(hs.includes('11:30')).toBe(true);
    expect(hs.includes('13:00')).toBe(true);

    // Verificar incremento de 30 min entre algunos consecutivos (muestra)
    const toMin = (s) => {
      const [h, m] = s.split(':').map(Number);
      return h * 60 + m;
    };
    const idx = hs.indexOf('10:00');
    if (idx > 0) {
      expect(toMin(hs[idx + 1]) - toMin(hs[idx])).toBe(30);
    }
  });

  test('duraciones retorna mapa esperado', () => {
    const d = Horarios.duraciones();
    expect(d).toEqual({ evaluacion: 30, procedimiento: 60 });
  });
});
