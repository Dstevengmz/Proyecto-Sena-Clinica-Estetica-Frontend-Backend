const categoriaService = require("../services/CategoriaProcedimientosServices");

class CategoriaProcedimientosController {
  async listarCategorias(req, res) {
    try {
      const categorias = await categoriaService.listarLasCategorias();
      res.json(categorias);
    } catch (error) {
      console.error("Error al listar categorías:", error);
      res.status(500).json({ error: "Error al listar categorías" });
    }
  }

  async buscarCategoria(req, res) {
    try {
      const categoria = await categoriaService.buscarLaCategoria(req.params.id);
      if (!categoria) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      res.json(categoria);
    } catch (error) {
      console.error("Error al buscar categoría:", error);
      res.status(500).json({ error: "Error al buscar categoría" });
    }
  }

  async crearCategoria(req, res) {
    try {
      const datos = req.body;
      if (typeof datos.estado === "string") {
        datos.estado = datos.estado === "true";
      }
      const nueva = await categoriaService.crearLaCategoria(datos);
      res.status(201).json(nueva);
    } catch (error) {
      console.error("Error al crear categoría:", error);
      const status = error.status || 500;
      const payload =
        status === 409
          ? { message: "Ya existe una categoría con ese nombre" }
          : status === 400
          ? { message: "El nombre de la categoría es requerido" }
          : { message: "Hubo un error al crear la categoría", error: error.message };
      res.status(status).json(payload);
    }
  }

  async actualizarCategoria(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const actual = await categoriaService.buscarLaCategoria(id);
      if (!actual) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      const payload = { ...req.body };
      if (typeof payload.estado === "string") {
        payload.estado = payload.estado === "true";
      }
      const resultado = await categoriaService.actualizarLaCategoria(
        id,
        payload
      );
      if (!resultado[0]) {
        return res
          .status(400)
          .json({ error: "No se pudo actualizar la categoría" });
      }
      res.json({ mensaje: "Categoría actualizada correctamente" });
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      res.status(500).json({
        error: "Error en el servidor al actualizar la categoría",
        detalle: error.message,
      });
    }
  }

  async eliminarCategoria(req, res) {
    try {
      const eliminado = await categoriaService.eliminarLaCategoria(
        req.params.id
      );
      if (!eliminado) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      res.json({ message: "Categoría eliminada" });
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      res.status(500).json({ error: "Error al eliminar la categoría" });
    }
  }
}

module.exports = new CategoriaProcedimientosController();
