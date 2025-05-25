const { Usuarios } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const hashaleatorio  = 10;
class UsuariosService {

  async listarLosUsuarios() {
    return await Usuarios.findAll();
  }

  async buscarLosUsuarios(id) {
    return await Usuarios.findByPk(id);
  }

  async crearLosUsuarios(data) {
    const hashedPassword = await bcrypt.hash(data.contrasena,hashaleatorio);
    return await Usuarios.create({
      ...data,
      contrasena: hashedPassword,
    });
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

async iniciarSesion(correo, contrasena) {
  try{
    const usuario = await Usuarios.findOne({ where: { correo } });
  if (!usuario) {
    return { error: "Correo no registrado" };
  }
  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!contrasenaValida) {
    return { error: "Credenciales incorrectas" };
  }
  const token = jwt.sign({ id: usuario.id, correo: usuario.correo },process.env.JWT_SECRET,{ expiresIn: "3h" });
  console.log("Token generado:", token);
  return { token, usuario };
  }catch (error)
  {
    console.error("Error al procesar la solicitud de inicio de sesión:", error);
    return { error: "Error al procesar la solicitud de inicio de sesión" };
  }
}
}

module.exports = new UsuariosService();