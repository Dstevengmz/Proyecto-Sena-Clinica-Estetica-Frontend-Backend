const usuariosService = require("../services/UsuariosServices");
const {
  registrarIntentoFallido,
  limpiarIntentos,
} = require("../middleware/intentosfallidos");
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
        message: "Hubo un error al crear el usuario",
        error: error.message,
      });
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
      const {
        nombre,
        estado,
        tipodocumento,
        numerodocumento,
        correo,
        contrasena,
        rol,
        telefono,
        direccion,
        genero,
        fecha_nacimiento,
        ocupacion,
        estado_civil,
      } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      let resultado = await usuariosService.actualizarLosUsuario(id, {
        nombre,
        estado,
        tipodocumento,
        numerodocumento,
        correo,
        contrasena,
        rol,
        telefono,
        direccion,
        genero,
        fecha_nacimiento,
        ocupacion,
        estado_civil,
      });

      if (!resultado[0]) {
        return res.status(404).json({ error: "usuario no encontrado" });
      }

      res.json({ mensaje: "usuario actualizado correctamente" });
    } catch (e) {
      res
        .status(500)
        .json({ error: "Error en el servidor al actualizar el usuario" });
    }
  }

  async eliminarUsuarios(req, res) {
    await usuariosService.eliminarLosUsuarios(req.params.id);
    res.json({ message: "Usuario eliminado" });
  }

  async iniciarSesion(req, res) {
    const { correo, contrasena } = req.body;
    try {
      const resultado = await usuariosService.iniciarSesion(correo, contrasena);
      if (resultado.error) {
        console.log("Error al iniciar sesión:", resultado.error);
        registrarIntentoFallido(correo);
        return res.status(401).json({ mensaje: resultado.error });
      }

      limpiarIntentos(correo);
      console.log("Inicio de sesión exitoso:", resultado);
      res.json(resultado);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ mensaje: "Error al iniciar sesión" });
    }
  }

  async activacionUsario(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      if (typeof estado !== "boolean") {
        return res
          .status(400)
          .json({
            mensaje: "El estado debe ser un valor booleano (true o false).",
          });
      }
      const resultado = await usuariosService.activarUsuario(id, estado);
      if (resultado.error) {
        return res.status(401).json({ mensaje: resultado.error });
      }
      res.json(resultado);
      console.log("Estado de usuario actualizado:", resultado.usuario.estado);
    } catch (e) {
      console.error("Error al actualizar el estado:", e);
      res.status(500).json({ mensaje: "Error al actualizar el usuario" });
    }
  }

  async obtenerNotificaciones(req, res) {
    try {
      const { id } = req.params;
      const notificaciones = await usuariosService.obtenerNotificacionesDoctor(id);
      res.json(notificaciones);
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      res.status(500).json({ error: "Error al obtener notificaciones" });
    }
  }

  async marcarNotificacionComoLeida(req, res) {
    try {
      const { id } = req.params;
      const { index } = req.body;
      const resultado = await usuariosService.marcarNotificacionComoLeida(id, index);
      
      if (resultado.success) {
        res.json({ message: "Notificación marcada como leída" });
      } else {
        res.status(400).json({ error: resultado.error });
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      res.status(500).json({ error: "Error al marcar notificación como leída" });
    }
  }

  async marcarTodasNotificacionesComoLeidas(req, res) {
    try {
      const { id } = req.params;
      const resultado = await usuariosService.marcarTodasNotificacionesComoLeidas(id);
      
      if (resultado.success) {
        res.json({ message: "Todas las notificaciones marcadas como leídas" });
      } else {
        res.status(400).json({ error: resultado.error });
      }
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error);
      res.status(500).json({ error: "Error al marcar todas las notificaciones como leídas" });
    }
  }

  async archivarNotificacionesLeidas(req, res) {
    try {
      const { id } = req.params;
      const resultado = await usuariosService.archivarNotificacionesLeidas(id);
      
      if (resultado.success) {
        res.json({ 
          message: "Notificaciones leídas archivadas correctamente",
          archivadas: resultado.archivadas,
          activas: resultado.activas
        });
      } else {
        res.status(400).json({ error: resultado.error });
      }
    } catch (error) {
      console.error("Error al archivar notificaciones:", error);
      res.status(500).json({ error: "Error al archivar notificaciones" });
    }
  }

  async obtenerHistorialNotificaciones(req, res) {
    try {
      const { id } = req.params;
      const historial = await usuariosService.obtenerHistorialNotificaciones(id);
      res.json(historial);
    } catch (error) {
      console.error("Error al obtener historial de notificaciones:", error);
      res.status(500).json({ error: "Error al obtener historial de notificaciones" });
    }
  }
}

module.exports = new UsuariosController();
