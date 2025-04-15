const { Usuarios } = require("../models");
const jwt = require("jsonwebtoken");
class UsuariosService {

  async listarLosUsuarios() {
    return await Usuarios.findAll();
  }

  async buscarLosUsuarios(id) {
    return await Usuarios.findByPk(id);
  }

  async crearLosUsuarios(data) {
    return await Usuarios.create(data);
  }


  async  eliminarLosUsuarios(id) {
    const usuario = await Usuarios.findByPk(id);
    if (usuario) {
      return await usuario.destroy();
    }
    return null;
  }

  async actualizarLosUsuario(id, datos) {
    try {
        let actualizado = await Usuarios.update(datos, { where: { id } });
        return actualizado;
    } catch (e) {
        console.log("Error en el servidor al actualizar el usuario:", e);
    }
}
}

module.exports = new UsuariosService();