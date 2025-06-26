 function ValidarLaCita(data) {
  let ahora = new Date();
  let fechaCita = new Date(data.fecha);
  if (fechaCita < ahora) {
    throw new Error("La fecha de la cita no puede ser pasada");
  }
}

module.exports = { ValidarLaCita };
