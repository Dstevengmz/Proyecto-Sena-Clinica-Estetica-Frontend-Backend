const { usuarios } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { EnviarCorreo } = require("../assets/corre");
const redis = require("../config/redis");
const hashaleatorio = 10;
const LimpiarNombre = require("../assets/LimpiarNombreUtils");
class UsuariosService {
  async listarLosUsuarios() {
    return await usuarios.findAll();
  }

  async listarSoloDoctores() {
    try {
      return await usuarios.findAll({
        where: { rol: "doctor", estado: true },
        attributes: ["id", "nombre", "correo"],
      });
    } catch (error) {
      console.error("Error al listar solo doctores:", error);
      throw error;
    }
  }

  async listarSoloUsuarios() {
    try {
      return await usuarios.findAll({
        where: { rol: "usuario", estado: true },
        attributes: [
          "id",
          "nombre",
          "tipodocumento",
          "numerodocumento",
          "correo",
          "rol",
          "estado",
          "genero",
        ],
      });
    } catch (error) {
      console.error("Error al listar solo usuarios:", error);
      throw error;
    }
  }

  async buscarLosUsuarios(id) {
    return await usuarios.findByPk(id);
  }

  async crearLosUsuarios(data) {
    const nombreLimpio = LimpiarNombre(data.nombre);
    data.nombre = nombreLimpio;
    const hashedPassword = await bcrypt.hash(data.contrasena, hashaleatorio);
    const nuevoUsuario = await usuarios.create({
      ...data,
      nombre: nombreLimpio,
      contrasena: hashedPassword,
    });
    try {
      await EnviarCorreo({
        receipients: data.correo,
        subject: "Bienvenido a Clinestetica",
        message: `
      <h2>Hola ${nombreLimpio}</h2>
      <p>Tu registro en <strong>Clinestetica</strong> fue exitoso.</p>
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
    const nuevoUsuario = await usuarios.create({
      ...data,
      nombre: nombreLimpio,
      contrasena: hashedPassword,
    });
    try {
      await EnviarCorreo({
        receipients: data.correo,
        subject: "Bienvenido a Clinestetica",
        message: `
      <h2>Hola ${nombreLimpio}</h2>
      <p>Tu registro en <strong>Clinestetica</strong> fue exitoso.</p>
      <p>Gracias por confiar en nosotros. Te estaremos contactando pronto.</p>
    `,
      });
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }
    return nuevoUsuario;
  }

  async eliminarLosUsuarios(id) {
    const usuario = await usuarios.findByPk(id);
    if (usuario) {
      return await usuario.destroy();
    }
    return null;
  }

  async actualizarLosUsuario(id, datos) {
    try {
      const usuario = await usuarios.findByPk(id);
      if (!usuario) {
        return { error: "Correo no registrado" };
      }
      let actualizado = await usuarios.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
      console.log("Error en el servidor al actualizar el usuario:", e);
    }
  }

  async iniciarSesion(correo, contrasena) {
    try {
      const usuario = await usuarios.findOne({ where: { correo } });
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
      try {
        await EnviarCorreo({
          receipients: usuario.correo,
          subject: "Ha iniciado sesion en Clinestetica",
          message: `
      <h2>Hola ${usuario.nombre}</h2>
      <p>Has iniciado sesión en <strong>Clinestetica</strong>.</p>
      <p>Gracias por confiar en nosotros. Te estaremos contactando pronto.</p>
    `,
        });
      } catch (error) {
        console.error("Error al enviar correo:", error);
      }
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
      const usuario = await usuarios.findByPk(id);
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
    try {
      const clave = `notificaciones:usuario:${usuarioId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);
      const notificacionesMigradas = notificaciones.map((notif) => {
        const notificacion = JSON.parse(notif);
        if (notificacion.leida === undefined) {
          notificacion.leida = false;
        }
        return notificacion;
      });
      // Si hubo migración, actualizar Redis
      if (
        notificacionesMigradas.some(
          (notif, index) => JSON.stringify(notif) !== notificaciones[index]
        )
      ) {
        await redis.del(clave);
        if (notificacionesMigradas.length > 0) {
          // Insertar en orden reverso para mantener el orden original
          const notificacionesString = notificacionesMigradas.map((notif) =>
            JSON.stringify(notif)
          );
          for (let i = notificacionesString.length - 1; i >= 0; i--) {
            await redis.lPush(clave, notificacionesString[i]);
          }
        }
      }
      return notificacionesMigradas;
    } catch (e) {
      console.error("Error al obtener notificaciones por usuario:", e);
      return { error: "Error al obtener notificaciones" };
    }
  }

  async obtenerNotificacionesDoctor(doctorId) {
    try {
      const clave = `notificaciones:doctor:${doctorId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);

      const notificacionesMigradas = notificaciones.map((notif) => {
        const notificacion = JSON.parse(notif);
        if (notificacion.leida === undefined) {
          notificacion.leida = false;
        }
        return notificacion;
      });

      // Si hubo migración, actualizar Redis
      if (
        notificacionesMigradas.some(
          (notif, index) => JSON.stringify(notif) !== notificaciones[index]
        )
      ) {
        await redis.del(clave);
        if (notificacionesMigradas.length > 0) {
          // Insertar en orden reverso para mantener el orden original
          const notificacionesString = notificacionesMigradas.map((notif) =>
            JSON.stringify(notif)
          );
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
        const notificacionesArray = notificaciones.map((notif) =>
          JSON.parse(notif)
        );
        notificacionesArray[notificacionIndex].leida = true;

        // Reemplazar toda la lista en Redis
        await redis.del(clave);
        if (notificacionesArray.length > 0) {
          // Insertar en orden reverso para mantener el orden original
          const notificacionesString = notificacionesArray.map((notif) =>
            JSON.stringify(notif)
          );
          for (let i = notificacionesString.length - 1; i >= 0; i--) {
            await redis.lPush(clave, notificacionesString[i]);
          }
        }

        console.log(
          `Notificación ${notificacionIndex} marcada como leída para doctor ${doctorId}`
        );
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
      const notificacionesActualizadas = notificaciones.map((notif) => {
        const notificacion = JSON.parse(notif);
        notificacion.leida = true;
        return notificacion;
      });

      // Reemplazar toda la lista
      await redis.del(clave);
      if (notificacionesActualizadas.length > 0) {
        // Insertar en orden reverso para mantener el orden original
        const notificacionesString = notificacionesActualizadas.map((notif) =>
          JSON.stringify(notif)
        );
        for (let i = notificacionesString.length - 1; i >= 0; i--) {
          await redis.lPush(clave, notificacionesString[i]);
        }
      }

      console.log(
        `Todas las notificaciones marcadas como leídas para doctor ${doctorId}`
      );
      return { success: true };
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
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

      notificaciones.forEach((notif) => {
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
        const notificacionesString = notificacionesActivas.map((notif) =>
          JSON.stringify(notif)
        );
        for (let i = notificacionesString.length - 1; i >= 0; i--) {
          await redis.lPush(clave, notificacionesString[i]);
        }
      }

      // Agregar a archivo (mantener hasta 50 notificaciones archivadas)
      if (notificacionesArchivadas.length > 0) {
        const archivadosString = notificacionesArchivadas.map((notif) =>
          JSON.stringify(notif)
        );
        for (let i = archivadosString.length - 1; i >= 0; i--) {
          await redis.lPush(claveArchivo, archivadosString[i]);
        }
        await redis.lTrim(claveArchivo, 0, 49); // Mantener solo 50
      }

      console.log(
        `${notificacionesArchivadas.length} notificaciones archivadas para doctor ${doctorId}`
      );
      return {
        success: true,
        archivadas: notificacionesArchivadas.length,
        activas: notificacionesActivas.length,
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

      const activas = notificacionesActivas.map((notif) => {
        const notificacion = JSON.parse(notif);
        notificacion.estado = "activa";
        return notificacion;
      });

      const archivadas = notificacionesArchivadas.map((notif) => {
        const notificacion = JSON.parse(notif);
        notificacion.estado = "archivada";
        return notificacion;
      });

      // Combinar y ordenar por fecha
      const todasLasNotificaciones = [...activas, ...archivadas];
      todasLasNotificaciones.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );

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
        const notificacionesArray = notificaciones.map((notif) =>
          JSON.parse(notif)
        );
        notificacionesArray[notificacionIndex].leida = true;

        // Reemplazar toda la lista en Redis
        await redis.del(clave);
        if (notificacionesArray.length > 0) {
          // Insertar en orden reverso para mantener el orden original
          const notificacionesString = notificacionesArray.map((notif) =>
            JSON.stringify(notif)
          );
          for (let i = notificacionesString.length - 1; i >= 0; i--) {
            await redis.lPush(clave, notificacionesString[i]);
          }
        }

        console.log(
          `Notificación ${notificacionIndex} marcada como leída para usuario ${usuarioId}`
        );
        return { success: true };
      }

      return { error: "Índice de notificación no válido" };
    } catch (error) {
      console.error(
        "Error al marcar notificación de usuario como leída:",
        error
      );
      return { error: "Error al marcar notificación como leída" };
    }
  }

  async marcarTodasNotificacionesUsuarioComoLeidas(usuarioId) {
    try {
      const clave = `notificaciones:usuario:${usuarioId}`;
      const notificaciones = await redis.lRange(clave, 0, -1);

      // Marcar todas como leídas manteniendo el orden
      const notificacionesActualizadas = notificaciones.map((notif) => {
        const notificacion = JSON.parse(notif);
        notificacion.leida = true;
        return notificacion;
      });

      // Reemplazar toda la lista
      await redis.del(clave);
      if (notificacionesActualizadas.length > 0) {
        // Insertar en orden reverso para mantener el orden original
        const notificacionesString = notificacionesActualizadas.map((notif) =>
          JSON.stringify(notif)
        );
        for (let i = notificacionesString.length - 1; i >= 0; i--) {
          await redis.lPush(clave, notificacionesString[i]);
        }
      }

      console.log(
        `Todas las notificaciones marcadas como leídas para usuario ${usuarioId}`
      );
      return { success: true };
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones de usuario como leídas:",
        error
      );
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

      notificaciones.forEach((notif) => {
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
        const notificacionesString = notificacionesActivas.map((notif) =>
          JSON.stringify(notif)
        );
        for (let i = notificacionesString.length - 1; i >= 0; i--) {
          await redis.lPush(clave, notificacionesString[i]);
        }
      }

      // Agregar a archivo (mantener hasta 50 notificaciones archivadas)
      if (notificacionesArchivadas.length > 0) {
        const archivadosString = notificacionesArchivadas.map((notif) =>
          JSON.stringify(notif)
        );
        for (let i = archivadosString.length - 1; i >= 0; i--) {
          await redis.lPush(claveArchivo, archivadosString[i]);
        }
        await redis.lTrim(claveArchivo, 0, 49); // Mantener solo 50
      }

      console.log(
        `${notificacionesArchivadas.length} notificaciones archivadas para usuario ${usuarioId}`
      );
      return {
        success: true,
        archivadas: notificacionesArchivadas.length,
        activas: notificacionesActivas.length,
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

      const activas = notificacionesActivas.map((notif) => {
        const notificacion = JSON.parse(notif);
        notificacion.estado = "activa";
        return notificacion;
      });

      const archivadas = notificacionesArchivadas.map((notif) => {
        const notificacion = JSON.parse(notif);
        notificacion.estado = "archivada";
        return notificacion;
      });

      // Combinar y ordenar por fecha
      const todasLasNotificaciones = [...activas, ...archivadas];
      todasLasNotificaciones.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );

      return todasLasNotificaciones;
    } catch (error) {
      console.error(
        "Error al obtener historial de notificaciones de usuario:",
        error
      );
      return [];
    }
  }
  async enviarCodigoVerificacion(correo) {
    const generarCodigo = () =>
      Math.floor(100000 + Math.random() * 900000).toString();

    const TIEMPO_CODIGO_MINUTOS = 10;
    const bloqueado = await redis.get(`bloqueo:${correo}`);
    if (bloqueado) {
      throw new Error(
        "Has superado el número de intentos. Espera 5 minutos para volver a intentarlo."
      );
    }
    const codigo = generarCodigo();
    await redis.setEx(`codigo:${correo}`, TIEMPO_CODIGO_MINUTOS * 60, codigo);
    await redis.del(`intentos:${correo}`);
    await EnviarCorreo({
      receipients: correo,
      subject: "Código de Verificación",
      message: `Tu código de verificación es: <b>${codigo}</b> (expira en ${TIEMPO_CODIGO_MINUTOS} minutos).`,
    });
    return true;
  }

  async verificarCodigo(correo, codigoIngresado) {
    const ENVIOS_PERMITIDOS = 3;
    const BLOQUEO_MINUTOS = 5;
    const codigoGuardado = await redis.get(`codigo:${correo}`);

    if (!codigoGuardado) {
      throw new Error("No hay código activo o ha expirado.");
    }

    if (codigoIngresado !== codigoGuardado) {
      // Manejo de intentos fallidos
      const intentos = await redis.incr(`intentos:${correo}`);

      // Expira en 5 minutos desde el primer intento fallido
      if (intentos === 1) {
        await redis.expire(`intentos:${correo}`, BLOQUEO_MINUTOS * 60);
      }

      if (intentos >= ENVIOS_PERMITIDOS) {
        await redis.setEx(`bloqueo:${correo}`, BLOQUEO_MINUTOS * 60, "1");
        return {
          success: false,
          blocked: true,
          message:
            "Has sido bloqueado por 5 minutos debido a múltiples intentos fallidos.",
        };
      }

      return {
        success: false,
        blocked: false,
        message: `Código incorrecto. Intento ${intentos} de ${ENVIOS_PERMITIDOS}`,
      };
    }

    // Código correcto: limpiar todo
    await redis.del(`codigo:${correo}`);
    await redis.del(`intentos:${correo}`);
    await redis.del(`bloqueo:${correo}`);

    return { success: true };
  }

  // === Registro con verificación previa ===
  // Almacena temporalmente los datos del usuario en Redis y envía código.
  async preRegistrarUsuario(data) {
    try {
      const { correo } = data;
      if (!correo) return { error: "Correo es requerido" };

      // ¿Existe ya usuario definitivo?
      const existente = await usuarios.findOne({ where: { correo } });
      if (existente) {
        return { error: "El correo ya está registrado." };
      }

      const key = `registro_pendiente:${correo}`;
      // Hash de contraseña ahora para no guardar texto plano
      if (!data.contrasena) return { error: "La contraseña es requerida" };
      const hashedPassword = await bcrypt.hash(data.contrasena, hashaleatorio);

      // Limpiar nombre si viene
      if (data.nombre) {
        data.nombre = LimpiarNombre(data.nombre);
      }

      const payload = {
        ...data,
        contrasena: hashedPassword,
        rol: "usuario",
        estado: true, // usuario activo una vez se confirme
        fechaPreRegistro: new Date().toISOString(),
      };

      // TTL de 1 hora (3600s)
      await redis.setEx(key, 3600, JSON.stringify(payload));

      // Enviar código reutilizando lógica existente
      await this.enviarCodigoVerificacion(correo);

      return {
        success: true,
        mensaje: "Código enviado. Revisa tu correo para confirmarlo.",
      };
    } catch (e) {
      console.error("Error en preRegistro:", e);
      return { error: "Error en el pre-registro" };
    }
  }

  // Confirma el registro: valida código, crea el usuario en DB y limpia Redis
  async confirmarRegistro(correo, codigo) {
    try {
      if (!correo || !codigo)
        return { error: "Correo y código son requeridos" };

      // Validar código
      const verif = await this.verificarCodigo(correo, codigo);
      if (!verif.success) {
        return verif; // puede traer blocked o mensaje
      }

      const key = `registro_pendiente:${correo}`;
      const dataStr = await redis.get(key);
      if (!dataStr) {
        return { error: "Registro pendiente no encontrado o expirado." };
      }
      const data = JSON.parse(dataStr);

      // Seguridad extra: evitar duplicado si otro proceso ya creó
      const ya = await usuarios.findOne({ where: { correo } });
      if (ya) {
        await redis.del(key);
        return { error: "El correo ya está registrado." };
      }

      const nuevoUsuario = await usuarios.create({
        nombre: data.nombre,
        correo: data.correo,
        contrasena: data.contrasena,
        rol: data.rol || "usuario",
        estado: true,
        tipodocumento: data.tipodocumento,
        numerodocumento: data.numerodocumento,
        telefono: data.telefono,
        direccion: data.direccion,
        genero: data.genero,
        fecha_nacimiento: data.fecha_nacimiento,
        ocupacion: data.ocupacion,
        estado_civil: data.estado_civil,
      });

      await redis.del(key);

      // Correo de bienvenida
      try {
        await EnviarCorreo({
          receipients: correo,
          subject: "Bienvenido a Clinestetica",
          message: `<h2>Hola ${nuevoUsuario.nombre}</h2><p>Tu cuenta ha sido verificada exitosamente.</p>`,
        });
      } catch (e) {
        console.error("Error enviando correo bienvenida:", e);
      }
      return {
        success: true,
        message:
          "Cuenta verificada exitosamente. Ahora puedes iniciar sesión con tu correo y contraseña.",
      };
    } catch (e) {
      console.error("Error confirmando registro:", e);
      return { error: "Error al confirmar el registro" };
    }
  }
}
module.exports = new UsuariosService();
