class PrimeraMayusculaProcedimiento {
  static capitalizarPrimera(texto) {
    if (typeof texto !== "string") return "";
    const base = texto.trim().replace(/\s+/g, " ").toLowerCase();
    if (!base) return "";
    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  static middleware(req, _res, next) {
    if (req.body && typeof req.body.nombre === "string") {
      req.body.nombre = PrimeraMayusculaProcedimiento.capitalizarPrimera(
        req.body.nombre
      );
    }
    if (typeof req.body.descripcion === "string") {
      req.body.descripcion = PrimeraMayusculaProcedimiento.capitalizarPrimera(
        req.body.descripcion
      );
    }
    if (typeof req.body.recomendaciones_previas === "string") {
        req.body.recomendaciones_previas = PrimeraMayusculaProcedimiento.capitalizarPrimera(
          req.body.recomendaciones_previas
        );
      }
    next();
  }
}

module.exports = PrimeraMayusculaProcedimiento;
