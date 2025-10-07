const moment = require("moment-timezone");

function ValidarLaCita(data) {
  const ahora = moment.tz("America/Bogota");

  if (!moment(data.fecha, moment.ISO_8601, true).isValid()) {
    throw new Error("Fecha de la cita no válida");
  }

  const fechaCita = moment.tz(data.fecha, "America/Bogota");

  if (fechaCita.isBefore(ahora)) {
    throw new Error("La fecha de la cita no puede ser pasada");
  }
}

module.exports = { ValidarLaCita };
