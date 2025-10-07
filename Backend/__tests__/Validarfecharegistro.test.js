/*
  Propósito del archivo:
  Pruebas unitarias para la validación de fechas de registro de citas: verifica formato, pasado/futuro según zona horaria.

  Cobertura de pruebas:
  - Lanza error si la fecha es inválida.
  - Lanza error si la fecha está en el pasado (America/Bogota).
  - No lanza error si la fecha es futura.
*/

const { ValidarLaCita } = require('../assets/Validarfecharegistro');
const moment = require('moment-timezone');

describe('Validación de fecha de registro de cita', () => {
  it('lanza error si la fecha es inválida', () => {
    expect(() => ValidarLaCita({ fecha: 'fecha-mala' })).toThrow('Fecha de la cita no válida');
  });

  it('lanza error si la fecha es en el pasado', () => {
    const ayer = moment.tz('America/Bogota').subtract(1, 'day').format();
    expect(() => ValidarLaCita({ fecha: ayer })).toThrow('La fecha de la cita no puede ser pasada');
  });

  it('no lanza error si la fecha es futura', () => {
    const manana = moment.tz('America/Bogota').add(1, 'day').format();
    expect(() => ValidarLaCita({ fecha: manana })).not.toThrow();
  });
});
