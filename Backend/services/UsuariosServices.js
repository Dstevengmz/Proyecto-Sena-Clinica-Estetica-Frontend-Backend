const { Usuarios } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { EnviarCorreo } = require('../assets/corre');
const hashaleatorio  = 10;
const LimpiarNombre = require("../assets/LimpiarNombreUtils");
class UsuariosService {

  async listarLosUsuarios() {
    return await Usuarios.findAll();
  }

  async buscarLosUsuarios(id) {
    return await Usuarios.findByPk(id);
  }

  async crearLosUsuarios(data) {
    const nombreLimpio = LimpiarNombre(data.nombre);
    data.nombre = nombreLimpio;
    const hashedPassword = await bcrypt.hash(data.contrasena,hashaleatorio);
    const nuevoUsuario = await Usuarios.create({
    ...data,
    nombre: nombreLimpio,
    contrasena: hashedPassword,
  });
  try{
    await EnviarCorreo({
    receipients: data.correo,
    subject: 'Bienvenido a Clínica Rejuvenezk',
    message: `
      <h2>Hola ${nombreLimpio}</h2>
      <p>Tu registro en <strong>Clínica Rejuvenezk</strong> fue exitoso.</p>
      <p>Gracias por confiar en nosotros. Te estaremos contactando pronto.</p>
    `,
  });
  }catch (error) {
      console.error('Error al enviar correo:', error);
  }
  return nuevoUsuario;
    
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
  const token = jwt.sign({ id: usuario.id, correo: usuario.correo,rol:usuario.rol },process.env.JWT_SECRET,{ expiresIn: "3h" });
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