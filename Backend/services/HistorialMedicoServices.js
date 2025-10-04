const { historialclinico, usuarios } = require("../models");
const bcrypt = require("bcrypt");
class HistorialClinicoService {
  async listarLosHistorialesClinicos() {
    return await historialclinico.findAll({
      include: {
        model: usuarios,
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
      return await historialclinico.findByPk(id, {
        include: {
          model: usuarios,
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
      return await historialclinico.findOne({
        where: { id_usuario },
        include: {
          model: usuarios,
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
    const existingRecord = await historialclinico.findOne({
      where: { id_usuario: data.id_usuario },
    });
    if (existingRecord) {
      throw new Error("El usuario ya tiene un historial médico registrado.");
    }
    return await historialclinico.create(data);
  }

  async eliminarLosHistorialesClinicos(id) {
    const historialclinico = await historialclinico.findByPk(id);
    if (historialclinico) {
      return await historialclinico.destroy();
    }
    return null;
  }

  async actualizarLosHistorialesClinicos(id, datos) {
    try {
      let actualizado = await historialclinico.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
      console.log("Error en el servidor al actualizar el Historialclinico:", e);
    }
  }
}

module.exports = new HistorialClinicoService();
