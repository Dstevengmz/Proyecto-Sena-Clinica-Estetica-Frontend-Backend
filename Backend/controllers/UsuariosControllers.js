  const usuariosService = require("../services/UsuariosServices");

class UsuariosController {

  async listarUsuarios(req, res) {
    const usuarios = await usuariosService.listarLosUsuarios();
    res.json(usuarios);
  }

  async buscarUsuarios(req, res) {
    const usuario = await usuariosService.buscarLosUsuarios(req.params.id);
    usuario
      ? res.json(usuario)
      : res.status(404).json({ error: "Usuario no encontrado" });
  }

  async crearUsuarios(req, res) {
    try {
      const nuevoUsuario = await usuariosService.crearLosUsuarios(req.body);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.status(500).json({
        message: "Hubo un error al crear el usuario",error: error.message,});
    }
  }

  async perfilUsuario(req, res) {
    const id = req.usuario.id;
  
    const usuario = await usuariosService.buscarLosUsuarios(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
  
    res.json({ usuario });
  }

  async actualizarUsuario(req, res) {
    try {
        const { id } = req.params;
        const { nombre,tipodocumento,numerodocumento,correo,contrasena,rol,telefono,direccion,genero,fecha_nacimiento,ocupacion,estado_civil } = req.body;
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        let resultado = await usuariosService.actualizarLosUsuario(id, {nombre,tipodocumento,numerodocumento,correo,contrasena,rol,telefono,direccion,genero,fecha_nacimiento,ocupacion,estado_civil});

        if (!resultado[0]) {
            return res.status(404).json({ error: "usuario no encontrado" });
        }

        res.json({ mensaje: "usuario actualizado correctamente" });
    } catch (e) {
        res.status(500).json({ error: "Error en el servidor al actualizar el usuario" });
    }
}

  async eliminarUsuarios(req, res) {
    await usuariosService.eliminarLosUsuarios(req.params.id);
    res.json({ message: "Usuario eliminado" });
  }

  async iniciarSesion(req, res) {
    const { correo, contrasena } = req.body;
    const resultado = await usuariosService.iniciarSesion(correo, contrasena);
    if (resultado.error) {
      return res.status(401).json({ mensaje: resultado.error });
    }
    res.json(resultado);
  }
}

module.exports = new UsuariosController();