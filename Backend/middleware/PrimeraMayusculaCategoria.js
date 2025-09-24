class PrimeraMayusculaCategoria {
  static capitalizarPrimera(nombre) {
    if (typeof nombre !== "string") return "";
    const base = nombre
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
    if (!base) return "";
    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  static middleware(req, _res, next) {
    if (req.body && typeof req.body.nombre === "string") {
      req.body.nombre = PrimeraMayusculaCategoria.capitalizarPrimera(
        req.body.nombre
      );
    }
    next();
  }
}

module.exports = PrimeraMayusculaCategoria;
