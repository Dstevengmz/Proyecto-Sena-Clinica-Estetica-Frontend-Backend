const {
  Ordenes,
  Procedimientos,
} = require("../models");

class OrdenServices {
  async listarOrdenesPorUsuario(id_usuario) {
    try {
      return await Ordenes.findAll({
        where: { id_usuario },
        include: [
          {
            model: Procedimientos,
            through: { attributes: [] },
          },
        ],
      });
    } catch (e) {
      console.log("Error al listar órdenes por usuario:", e);
    }
  }

  async listarLasOrdenes() {
    try {
      return await Ordenes.findAll();
    } catch (e) {
      console.log("Error en el servidor al listar las ordenes:", e);
    }
  }

  async buscarLasOrdenes(id) {
    try {
      return await Ordenes.findByPk(id);
    } catch (e) {
      console.log("Error en el servidor al buscar la orden:", e);
    }
  }

  async crearLasOrdenes(data) {
    try {
      const { procedimientos, ...datosOrden } = data;
      const nuevaOrden = await Ordenes.create(datosOrden);
      if (procedimientos && procedimientos.length > 0) {
        await nuevaOrden.addProcedimientos(procedimientos);
      }
      return nuevaOrden;
    } catch (e) {
      console.log("Error en el servidor al crear la orden:", e);
    }
  }

  async eliminarLasOrdenes(id) {
    try {
      return await Ordenes.destroy({ where: { id } });
    } catch (e) {
      console.log("Error en el servidor al eliminar la orden:", e);
    }
  }

  async actualizarLasOrdenes(id, datos) {
    try {
      let actualizado = await Ordenes.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
      console.log("Error en el servidor al actualizar la orden:", e);
    }
  }
}

module.exports = new OrdenServices();
