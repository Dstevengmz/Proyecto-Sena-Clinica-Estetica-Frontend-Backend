const { OrdenProcedimiento } = require("../models");

class OrdenProcedimientoServices {
  async listarLasOrdenesProcedimientos() {
    try {
      return await OrdenProcedimiento.findAll();
    } catch (e) {
      console.log("Error en el servidor al listar las  Ordenes Procedimientos:", e);
    }
  }

  async buscarLasOrdenesProcedimientos(id) {
    try {
      return await OrdenProcedimiento.findByPk(id);
    } catch (e) {
      console.log("Error en el servidor al buscar las Ordenes Procedimientos:", e);
    }
  }

  async crearLasOrdenesProcedimientos(data) {
    try {
      return await OrdenProcedimiento.create(data);
    } catch (e) {
      console.log("Error en el servidor al crear las Ordenes Procedimientos:", e);
    }
  }

  async eliminarLasOrdenesProcedimientos(id) {
    try {
      return await OrdenProcedimiento.destroy({ where: { id } });
    } catch (e) {
      console.log("Error en el servidor al eliminar las Ordenes Procedimientos:", e);
    }
  }
  
  async actualizarLasOrdenesProcedimientos(id, datos) {
    try {
      let actualizado = await OrdenProcedimiento.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
        console.log("Error en el servidor al actualizar  las Ordenes Procedimientos:", e);
    }
  }
}

module.exports = new OrdenProcedimientoServices ();
