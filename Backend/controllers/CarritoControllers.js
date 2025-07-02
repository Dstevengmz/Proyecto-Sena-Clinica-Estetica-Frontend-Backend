const carritoService = require("../services/CarritoServices");

class CarritoController {
  async listarMiCarrito(req, res) {
    try {
      const id_usuario = req.usuario.id;
      const carrito = await carritoService.listarCarritoPorUsuario(id_usuario);
      res.json(carrito);
    } catch (error) {
      console.log("Error en listarMiCarrito:", error);
      res.status(500).json({ error: "Error al obtener el carrito" });
    }
  }

  async agregarAlCarrito(req, res) {
    try {
      const { id_procedimiento } = req.body;
      const id_usuario = req.usuario.id;

      const nuevoItem = await carritoService.agregarAlCarrito({
        id_procedimiento,
        id_usuario,
      });

      res.status(201).json(nuevoItem);
    } catch (error) {
      if (error.message === "El procedimiento ya está en el carrito.") {
        return res.status(400).json({ error: error.message });
      }
      console.log("Error en agregar Al Carrito:", error);
      res.status(500).json({ error: "Error al agregar al carrito" });
    }
  }

  async eliminarDelCarrito(req, res) {
    try {
      const { id } = req.params;
      await carritoService.eliminarDelCarrito(id);
      res.json({ mensaje: "Procedimiento eliminado del carrito" });
    } catch (error) {
      console.log("Error en eliminarDelCarrito:", error);
      res.status(500).json({ error: "Error al eliminar del carrito" });
    }
  }

  async limpiarMiCarrito(req, res) {
    try {
      const id_usuario = req.usuario.id;
      await carritoService.limpiarCarritoUsuario(id_usuario);
      res.json({ mensaje: "Carrito limpiado correctamente" });
    } catch (error) {
      console.log("Error en limpiarMiCarrito:", error);
      res.status(500).json({ error: "Error al limpiar el carrito" });
    }
  }
}

module.exports = new CarritoController();
