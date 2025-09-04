const ordenService = require("../services/OrdenServices");

class OrdenController {
  async listarOrdenesElegiblesParaProcedimiento(req, res) {
    try {
      const { usuarioId } = req.params;
      if (!usuarioId || isNaN(Number(usuarioId))) {
        return res.status(400).json({ error: "usuarioId inválido" });
      }
      const ordenes = await ordenService.listarOrdenesEvaluacionRealizadaPorUsuario(Number(usuarioId));
      res.json(ordenes);
    } catch (e) {
      console.log("Error al listar órdenes elegibles:", e);
      res.status(500).json({ error: "Error al obtener las órdenes elegibles" });
    }
  }
  async listarMisOrdenes(req, res) {
    try {
      const usuarioId = req.usuario.id;

      const ordenes = await ordenService.listarOrdenesPorUsuario(usuarioId);
      res.json(ordenes);
    } catch (e) {
      console.log("Error al listar las órdenes del usuario:", e);
      res.status(500).json({ error: "Error al obtener las órdenes" });
    }
  }
  async listarOrdenes(req, res) {
    const orden = await ordenService.listarLasOrdenes();
    res.json(orden);
  }

  async buscarOrdenes(req, res) {
    const orden = await ordenService.buscarLasOrdenes(req.params.id);
    orden
      ? res.json(orden)
      : res.status(404).json({ error: "orden no encontrada" });
  }

  async crearOrdenes(req, res) {
    const nuevaorden = await ordenService.crearLasOrdenes(req.body);
    res.status(201).json(nuevaorden);
  }

  async actualizarOrdenes(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario, fecha_creacion, estado } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      let resultado = await ordenService.actualizarLasOrdenes(id, {
        id_usuario,
        fecha_creacion,
        estado,
      });
      if (!resultado[0]) {
        return res.status(404).json({ error: "Orden no encontrado" });
      }
      res.json({ mensaje: "Orden actualizada correctamente" });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Error en el servidor al actualizar la Orden" });
    }
  }

  async eliminarOrdenes(req, res) {
    await ordenService.eliminarLasOrdenes(req.params.id);
    res.json({ message: "Orden eliminada" });
  }
}

module.exports = new OrdenController();
