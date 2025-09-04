const {
  ordenes,
  procedimientos,
  citas,
} = require("../models");

class OrdenServices {
  async listarOrdenesPorUsuario(id_usuario) {
    try {
      return await ordenes.findAll({
        where: { id_usuario },
        include: [
          {
            model: Procedimientos,
            as: "procedimientos",
            through: { attributes: [] },
          },
        ],
      });
    } catch (e) {
      console.log("Error al listar órdenes por usuario:", e);
    }
  }

  async listarOrdenesEvaluacionRealizadaPorUsuario(id_usuario) {
    try {
      const citasEvaluacion = await citas.findAll({
        where: {
          id_usuario,
          tipo: "evaluacion",
          estado: "realizada",
        },
        attributes: ["id_orden"],
      });

      const ordenIds = [...new Set(citasEvaluacion.map((c) => c.id_orden).filter(Boolean))];
      if (ordenIds.length === 0) return [];

      return await ordenes.findAll({
        where: { id_usuario, id: ordenIds },
        include: [
          {
            model: procedimientos,
            as: "procedimientos",
            through: { attributes: [] },
          },
        ],
      });
    } catch (e) {
      console.log("Error al listar órdenes con evaluación realizada por usuario:", e);
      throw e;
    }
  }

  async listarLasOrdenes() {
    try {
      return await ordenes.findAll();
    } catch (e) {
      console.log("Error en el servidor al listar las ordenes:", e);
    }
  }

  async buscarLasOrdenes(id) {
    try {
      return await ordenes.findByPk(id);
    } catch (e) {
      console.log("Error en el servidor al buscar la orden:", e);
    }
  }

  async crearLasOrdenes(data) {
    try {
      const { procedimientos, ...datosOrden } = data;
      const nuevaOrden = await ordenes.create(datosOrden);
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
      return await ordenes.destroy({ where: { id } });
    } catch (e) {
      console.log("Error en el servidor al eliminar la orden:", e);
    }
  }

  async actualizarLasOrdenes(id, datos) {
    try {
      let actualizado = await ordenes.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
      console.log("Error en el servidor al actualizar la orden:", e);
    }
  }
}

module.exports = new OrdenServices();
