const { Historialclinico, Usuarios } = require("../models");
const bcrypt = require("bcrypt");
class HistorialClinicoService {
  async listarLosHistorialesClinicos() {
    return await Historialclinico.findAll({
      include: {
        model: Usuarios,
        as: "usuario",
        attributes: [
          "nombre",
          "correo",
          "telefono",
          "direccion",
          "fecha_nacimiento",
          "genero",
          "rol",
          "ocupacion",
        ],
      },
    });
  }

  async buscarLosHistorialesClinicos(id) {
    try {
      return await Historialclinico.findByPk(id, {
        include: {
          model: Usuarios,
          as: "usuario",
          attributes: [
            "nombre",
            "correo",
            "telefono",
            "direccion",
            "fecha_nacimiento",
            "genero",
            "rol",
            "ocupacion",
          ],
        },
      });
    } catch (e) {
      console.log("Error en el servidor al buscar el Historialclinico:", e);
    }
  }

  async buscarLosHistorialesClinicosPorUsuario(id_usuario) {
    try {
      return await Historialclinico.findOne({
        where: { id_usuario },
        include: {
          model: Usuarios,
          as: "usuario",
          attributes: [
            "nombre",
            "correo",
            "telefono",
            "direccion",
            "fecha_nacimiento",
            "genero",
            "rol",
            "ocupacion",
          ],
        },
      });
    } catch (e) {
      console.log(
        "Error en el servidor al buscar el Historialclinico por usuario:",
        e
      );
    }
  }

  async crearLosHistorialesClinicos(data) {
    return await Historialclinico.create(data);
  }

  async eliminarLosHistorialesClinicos(id) {
    const historialclinico = await Historialclinico.findByPk(id);
    if (historialclinico) {
      return await historialclinico.destroy();
    }
    return null;
  }

  async actualizarLosHistorialesClinicos(id, datos) {
    try {
      let actualizado = await Historialclinico.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
      console.log("Error en el servidor al actualizar el Historialclinico:", e);
    }
  }
}

module.exports = new HistorialClinicoService();
