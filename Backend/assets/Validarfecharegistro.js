const moment = require("moment-timezone");

function ValidarLaCita(data) {
  const ahora = moment.tz("America/Bogota");
  const fechaCita = moment.tz(data.fecha, "America/Bogota");
  if (!fechaCita.isValid()) {
    throw new Error("Fecha de la cita no válida");
  }
  if (fechaCita.isBefore(ahora)) {
    throw new Error("La fecha de la cita no puede ser pasada");
  }
}

module.exports = { ValidarLaCita };
