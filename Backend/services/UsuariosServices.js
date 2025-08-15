const { Usuarios } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { EnviarCorreo } = require("../assets/corre");
const redis = require("../config/redis");
const hashaleatorio = 10;
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
    const hashedPassword = await bcrypt.hash(data.contrasena, hashaleatorio);
    const nuevoUsuario = await Usuarios.create({
      ...data,
      nombre: nombreLimpio,
      contrasena: hashedPassword,
    });
    try {
      await EnviarCorreo({
        receipients: data.correo,
        subject: "Bienvenido a Clínica Rejuvenezk",
        message: `
      <h2>Hola ${nombreLimpio}</h2>
      <p>Tu registro en <strong>Clínica Rejuvenezk</strong> fue exitoso.</p>
      <p>Gracias por confiar en nosotros. Te estaremos contactando pronto.</p>
    `,
      });
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }
    return nuevoUsuario;
  }

    async crearLosUsuariosAdmin(data) {
    const nombreLimpio = LimpiarNombre(data.nombre);
    data.nombre = nombreLimpio;
    const hashedPassword = await bcrypt.hash(data.contrasena, hashaleatorio);
    const nuevoUsuario = await Usuarios.create({
      ...data,
      nombre: nombreLimpio,
      contrasena: hashedPassword,
    });
    try {
      await EnviarCorreo({
        receipients: data.correo,
        subject: "Bienvenido a Clínica Rejuvenezk",
        message: `
      <h2>Hola ${nombreLimpio}</h2>
      <p>Tu registro en <strong>Clínica Rejuvenezk</strong> fue exitoso.</p>
      <p>Gracias por confiar en nosotros. Te estaremos contactando pronto.</p>
    `,
      });
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }
    return nuevoUsuario;
  }


  async eliminarLosUsuarios(id) {
    const usuario = await Usuarios.findByPk(id);
    if (usuario) {
      return await usuario.destroy();
    }
    return null;
  }

  async actualizarLosUsuario(id, datos) {
    try {
      const usuario = await Usuarios.findByPk(id);
      if (!usuario) {
        return { error: "Correo no registrado" };
      }
      let actualizado = await Usuarios.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
      console.log("Error en el servidor al actualizar el usuario:", e);
    }
  }

  async iniciarSesion(correo, contrasena) {
    try {
      const usuario = await Usuarios.findOne({ where: { correo } });
      if (!usuario) {
        return { error: "Correo no registrado" };
      }
      if (!usuario.estado) {
        console.log(`Cuenta desactivada para el correo: ${correo}`);
        return { error: "Usuario inactivo, por favor contactese con soporte" };
      }
      const contrasenaValida = await bcrypt.compare(
        contrasena,
        usuario.contrasena
      );
      if (!contrasenaValida) {
        return { error: "Credenciales incorrectas" };
      }
      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
      );
      console.log("Token generado:", token);
      return { token, usuario };
    } catch (error) {
      console.error(
        "Error al procesar la solicitud de inicio de sesión:",
        error
      );
      return { error: "Error al procesar la solicitud de inicio de sesión" };
    }
  }
  async activarUsuario(id, estado) {
    try {
      const usuario = await Usuarios.findByPk(id);
      if (!usuario) {
        return { error: "Usuario no encontrado" };
      }
      usuario.estado = estado;
      await usuario.save();
      console.log("Estado de usuario actualizado:", usuario.estado);
      return {
        mensaje: "Estado de usuario actualizado correctamente",
        usuario,
      };
    } catch (error) {
      console.error("Error al activar/desactivar usuario:", error);
      return { error: "Error al activar/desactivar usuario" };
    }
  }

  async obtenerNotificacionesPorUsuario(usuarioId) {
    try{
      const clave = `notificaciones:usuario:${usuarioId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      const notificacionesMigradas = notificaciones.map(notif => {
        const notificacion = JSON.parse(notif);
        if (notificacion.leida === undefined) {
          notificacion.leida = false;
        }
        return notificacion;
      });
      // Si hubo migración, actualizar Redis
      if (notificacionesMigradas.some((notif, index) => JSON.stringify(notif) !== notificaciones[index])) {
        await redis.del(clave);
        if (notificacionesMigradas.length > 0) {
          // Insertar en orden reverso para mantener el orden original
          const notificacionesString = notificacionesMigradas.map(notif => JSON.stringify(notif));
          for (let i = notificacionesString.length - 1; i >= 0; i--) {
            await redis.lPush(clave, notificacionesString[i]);
          }
        }
      }
      return notificacionesMigradas;
    }catch(e){
      console.error("Error al obtener notificaciones por usuario:", e);
      return { error: "Error al obtener notificaciones" };
    }
  }

  async obtenerNotificacionesDoctor(doctorId) {
    try {
      const clave = `notificaciones:doctor:${doctorId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      
      const notificacionesMigradas = notificaciones.map(notif => {
        const notificacion = JSON.parse(notif);
        if (notificacion.leida === undefined) {
          notificacion.leida = false;
        }
        return notificacion;
      });
      
      // Si hubo migración, actualizar Redis
      if (notificacionesMigradas.some((notif, index) => JSON.stringify(notif) !== notificaciones[index])) {
        await redis.del(clave);
        if (notificacionesMigradas.length > 0) {
          // Insertar en orden reverso para mantener el orden original
          const notificacionesString = notificacionesMigradas.map(notif => JSON.stringify(notif));
          for (let i = notificacionesString.length - 1; i >= 0; i--) {
            await redis.lPush(clave, notificacionesString[i]);
          }
        }
      }
      
      return notificacionesMigradas;
    } catch (error) {
      console.error("Error al obtener notificaciones de Redis:", error);
      return [];
    }
  }




  async marcarNotificacionComoLeida(doctorId, notificacionIndex) {
    try {
      const clave = `notificaciones:doctor:${doctorId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      
      if (notificacionIndex >= 0 && notificacionIndex < notificaciones.length) {
        // Obtener todas las notificaciones, modificar la específica, y reemplazar la lista completa
        const notificacionesArray = notificaciones.map(notif => JSON.parse(notif));
        notificacionesArray[notificacionIndex].leida = true;
        
        // Reemplazar toda la lista en Redis
        await redis.del(clave);
        if (notificacionesArray.length > 0) {
          // Insertar en orden reverso para mantener el orden original
          const notificacionesString = notificacionesArray.map(notif => JSON.stringify(notif));
          for (let i = notificacionesString.length - 1; i >= 0; i--) {
            await redis.lPush(clave, notificacionesString[i]);
          }
        }
        
        console.log(`Notificación ${notificacionIndex} marcada como leída para doctor ${doctorId}`);
        return { success: true };
      }
      
      return { error: "Índice de notificación no válido" };
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      return { error: "Error al marcar notificación como leída" };
    }
  }

  async marcarTodasNotificacionesComoLeidas(doctorId) {
    try {
      const clave = `notificaciones:doctor:${doctorId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      
      // Marcar todas como leídas manteniendo el orden
      const notificacionesActualizadas = notificaciones.map(notif => {
        const notificacion = JSON.parse(notif);
        notificacion.leida = true;
        return notificacion;
      });
      
      // Reemplazar toda la lista
      await redis.del(clave);
      if (notificacionesActualizadas.length > 0) {
        // Insertar en orden reverso para mantener el orden original
        const notificacionesString = notificacionesActualizadas.map(notif => JSON.stringify(notif));
        for (let i = notificacionesString.length - 1; i >= 0; i--) {
          await redis.lPush(clave, notificacionesString[i]);
        }
      }
      
      console.log(`Todas las notificaciones marcadas como leídas para doctor ${doctorId}`);
      return { success: true };
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error);
      return { error: "Error al marcar todas las notificaciones como leídas" };
    }
  }

  async archivarNotificacionesLeidas(doctorId) {
    try {
      const clave = `notificaciones:doctor:${doctorId}`;
      const claveArchivo = `notificaciones_archivo:doctor:${doctorId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      
      const notificacionesActivas = [];
      const notificacionesArchivadas = [];
      
      notificaciones.forEach(notif => {
        const notificacion = JSON.parse(notif);
        if (notificacion.leida) {
          // Agregar timestamp de archivado
          notificacion.fechaArchivado = new Date().toISOString();
          notificacionesArchivadas.push(notificacion);
        } else {
          notificacionesActivas.push(notificacion);
        }
      });
      
      // Actualizar notificaciones activas
      await redis.del(clave);
      if (notificacionesActivas.length > 0) {
        const notificacionesString = notificacionesActivas.map(notif => JSON.stringify(notif));
        for (let i = notificacionesString.length - 1; i >= 0; i--) {
          await redis.lPush(clave, notificacionesString[i]);
        }
      }
      
      // Agregar a archivo (mantener hasta 50 notificaciones archivadas)
      if (notificacionesArchivadas.length > 0) {
        const archivadosString = notificacionesArchivadas.map(notif => JSON.stringify(notif));
        for (let i = archivadosString.length - 1; i >= 0; i--) {
          await redis.lPush(claveArchivo, archivadosString[i]);
        }
        await redis.lTrim(claveArchivo, 0, 49); // Mantener solo 50
      }
      
      console.log(`${notificacionesArchivadas.length} notificaciones archivadas para doctor ${doctorId}`);
      return { 
        success: true, 
        archivadas: notificacionesArchivadas.length,
        activas: notificacionesActivas.length 
      };
    } catch (error) {
      console.error("Error al archivar notificaciones:", error);
      return { error: "Error al archivar notificaciones" };
    }
  }

  async obtenerHistorialNotificaciones(doctorId) {
    try {
      const claveActivas = `notificaciones:doctor:${doctorId}`;
      const claveArchivo = `notificaciones_archivo:doctor:${doctorId}`;
      
      const notificacionesActivas = await redis.lRange(claveActivas, 0, -1);
      const notificacionesArchivadas = await redis.lRange(claveArchivo, 0, -1);
      
      const activas = notificacionesActivas.map(notif => {
        const notificacion = JSON.parse(notif);
        notificacion.estado = 'activa';
        return notificacion;
      });
      
      const archivadas = notificacionesArchivadas.map(notif => {
        const notificacion = JSON.parse(notif);
        notificacion.estado = 'archivada';
        return notificacion;
      });
      
      // Combinar y ordenar por fecha
      const todasLasNotificaciones = [...activas, ...archivadas];
      todasLasNotificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      return todasLasNotificaciones;
    } catch (error) {
      console.error("Error al obtener historial de notificaciones:", error);
      return [];
    }
  }

  // Métodos para manejar notificaciones de usuarios
  async marcarNotificacionUsuarioComoLeida(usuarioId, notificacionIndex) {
    try {
      const clave = `notificaciones:usuario:${usuarioId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      
      if (notificacionIndex >= 0 && notificacionIndex < notificaciones.length) {
        // Obtener todas las notificaciones, modificar la específica, y reemplazar la lista completa
        const notificacionesArray = notificaciones.map(notif => JSON.parse(notif));
        notificacionesArray[notificacionIndex].leida = true;
        
        // Reemplazar toda la lista en Redis
        await redis.del(clave);
        if (notificacionesArray.length > 0) {
          // Insertar en orden reverso para mantener el orden original
          const notificacionesString = notificacionesArray.map(notif => JSON.stringify(notif));
          for (let i = notificacionesString.length - 1; i >= 0; i--) {
            await redis.lPush(clave, notificacionesString[i]);
          }
        }
        
        console.log(`Notificación ${notificacionIndex} marcada como leída para usuario ${usuarioId}`);
        return { success: true };
      }
      
      return { error: "Índice de notificación no válido" };
    } catch (error) {
      console.error("Error al marcar notificación de usuario como leída:", error);
      return { error: "Error al marcar notificación como leída" };
    }
  }

  async marcarTodasNotificacionesUsuarioComoLeidas(usuarioId) {
    try {
      const clave = `notificaciones:usuario:${usuarioId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      
      // Marcar todas como leídas manteniendo el orden
      const notificacionesActualizadas = notificaciones.map(notif => {
        const notificacion = JSON.parse(notif);
        notificacion.leida = true;
        return notificacion;
      });
      
      // Reemplazar toda la lista
      await redis.del(clave);
      if (notificacionesActualizadas.length > 0) {
        // Insertar en orden reverso para mantener el orden original
        const notificacionesString = notificacionesActualizadas.map(notif => JSON.stringify(notif));
        for (let i = notificacionesString.length - 1; i >= 0; i--) {
          await redis.lPush(clave, notificacionesString[i]);
        }
      }
      
      console.log(`Todas las notificaciones marcadas como leídas para usuario ${usuarioId}`);
      return { success: true };
    } catch (error) {
      console.error("Error al marcar todas las notificaciones de usuario como leídas:", error);
      return { error: "Error al marcar todas las notificaciones como leídas" };
    }
  }

  async archivarNotificacionesLeidasUsuario(usuarioId) {
    try {
      const clave = `notificaciones:usuario:${usuarioId}`;
      const claveArchivo = `notificaciones_archivo:usuario:${usuarioId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      
      const notificacionesActivas = [];
      const notificacionesArchivadas = [];
      
      notificaciones.forEach(notif => {
        const notificacion = JSON.parse(notif);
        if (notificacion.leida) {
          // Agregar timestamp de archivado
          notificacion.fechaArchivado = new Date().toISOString();
          notificacionesArchivadas.push(notificacion);
        } else {
          notificacionesActivas.push(notificacion);
        }
      });
      
      // Actualizar notificaciones activas
      await redis.del(clave);
      if (notificacionesActivas.length > 0) {
        const notificacionesString = notificacionesActivas.map(notif => JSON.stringify(notif));
        for (let i = notificacionesString.length - 1; i >= 0; i--) {
          await redis.lPush(clave, notificacionesString[i]);
        }
      }
      
      // Agregar a archivo (mantener hasta 50 notificaciones archivadas)
      if (notificacionesArchivadas.length > 0) {
        const archivadosString = notificacionesArchivadas.map(notif => JSON.stringify(notif));
        for (let i = archivadosString.length - 1; i >= 0; i--) {
          await redis.lPush(claveArchivo, archivadosString[i]);
        }
        await redis.lTrim(claveArchivo, 0, 49); // Mantener solo 50
      }
      
      console.log(`${notificacionesArchivadas.length} notificaciones archivadas para usuario ${usuarioId}`);
      return { 
        success: true, 
        archivadas: notificacionesArchivadas.length,
        activas: notificacionesActivas.length 
      };
    } catch (error) {
      console.error("Error al archivar notificaciones de usuario:", error);
      return { error: "Error al archivar notificaciones" };
    }
  }

  async obtenerHistorialNotificacionesUsuario(usuarioId) {
    try {
      const claveActivas = `notificaciones:usuario:${usuarioId}`;
      const claveArchivo = `notificaciones_archivo:usuario:${usuarioId}`;
      
      const notificacionesActivas = await redis.lRange(claveActivas, 0, -1);
      const notificacionesArchivadas = await redis.lRange(claveArchivo, 0, -1);
      
      const activas = notificacionesActivas.map(notif => {
        const notificacion = JSON.parse(notif);
        notificacion.estado = 'activa';
        return notificacion;
      });
      
      const archivadas = notificacionesArchivadas.map(notif => {
        const notificacion = JSON.parse(notif);
        notificacion.estado = 'archivada';
        return notificacion;
      });
      
      // Combinar y ordenar por fecha
      const todasLasNotificaciones = [...activas, ...archivadas];
      todasLasNotificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      return todasLasNotificaciones;
    } catch (error) {
      console.error("Error al obtener historial de notificaciones de usuario:", error);
      return [];
    }
  }
  
}

module.exports = new UsuariosService();