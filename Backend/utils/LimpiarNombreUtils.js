function formatearNombre(nombrecompleto) {
  return nombrecompleto
    .trim()
    .split(/\s+/)
    .map(
      (palabra) =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
    )
    .join(" ");
}

module.exports =  formatearNombre;

