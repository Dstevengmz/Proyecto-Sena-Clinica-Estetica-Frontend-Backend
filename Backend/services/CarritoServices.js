const { carrito, procedimientos } = require("../models");

class CarritoService {
  async listarCarritoPorUsuario(id_usuario) {
    try {
      return await carrito.findAll({
        where: { id_usuario },
        include: [
          {
            model: procedimientos,
            as: "procedimiento",
          },
        ],
      });
    } catch (error) {
      console.log("Error al listar carrito por usuario:", error);
      throw error;
    }
  }

  async agregarAlCarrito(data) {
    try {
      const verificarItemenLista = await carrito.findOne({
        where: {
          id_procedimiento: data.id_procedimiento,
          id_usuario: data.id_usuario,
        },
      });
      if (verificarItemenLista) {
        throw new Error("El procedimiento ya está en el carrito.");
      } else {
        const nuevo = await carrito.create(data);
        const procedimiento = await procedimientos.findByPk(
          data.id_procedimiento
        );
        return {
          id: nuevo.id,
          procedimiento: procedimiento,
        };
      }
    } catch (error) {
      console.log("Error al agregar al carrito:", error);
      throw error;
    }
  }

  async eliminarDelCarrito(id) {
    try {
      return await carrito.destroy({ where: { id } });
    } catch (error) {
      console.log("Error al eliminar del carrito:", error);
      throw error;
    }
  }

  async limpiarCarritoUsuario(id_usuario) {
    try {
      return await carrito.destroy({ where: { id_usuario } });
    } catch (error) {
      console.log("Error al limpiar el carrito del usuario:", error);
      throw error;
    }
  }
}

module.exports = new CarritoService();
