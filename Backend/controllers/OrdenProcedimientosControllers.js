const OrdenProcedimientoServices = require("../services/OrdenProcedimientoServices");

class OrdenProcedimientoController {
  async listarOrdenesProcedimientos(req, res) {
    const ordenprocedimiento = await OrdenProcedimientoServices.listarLasOrdenesProcedimientos();
    res.json(ordenprocedimiento);
  }

  async buscarOrdenesProcedimientos(req, res) {
    const ordenprocedimiento = await OrdenProcedimientoServices.buscarLasOrdenesProcedimientos(req.params.id);
    ordenprocedimiento ? res.json(ordenprocedimiento) : res.status(404).json({ error: "Orden Procedimiento no encontrada" });
  }

  async crearOrdenesProcedimientos(req, res) {
    const nuevaordenprocedimiento = await OrdenProcedimientoServices.crearLasOrdenesProcedimientos(req.body);
    res.status(201).json(nuevaordenprocedimiento);
  }
  
    async actualizarOrdenesProcedimientos(req, res)
    {
      try {
          const { id } = req.params;
          const {id_orden,id_procedimiento} = req.body;
          if (isNaN(id))
          {
              return res.status(400).json({ error: "ID inválido" });
          }
          let resultado = await OrdenProcedimientoServices.actualizarLasOrdenesProcedimientos(id, {id_orden,id_procedimiento});
          if (!resultado[0]) {
              return res.status(404).json({ error: "Orden Procedimiento no encontrado" });
          }
          res.json({ mensaje: "Orden Procedimiento actualizada correctamente" });
      } catch (e) {
          res.status(500).json({ error: "Error en el servidor al actualizar la Orden Procedimiento" });
      }
  }
  

  async eliminaOrdenesProcedimientos(req, res) {
    await OrdenProcedimientoServices.eliminarLasOrdenesProcedimientos(req.params.id);
    res.json({ message: "Orden Procedimiento eliminada" });
  }
}

module.exports = new OrdenProcedimientoController();