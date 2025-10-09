const { usuarios, notificaciones } = require("../models");
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
    // Validar duplicados muy importante: correo y número de documento
    const existeCorreo = await usuarios.findOne({ where: { correo: data.correo } });
    if (existeCorreo) {
      const err = new Error("El correo ya está registrado.");
      err.status = 409;
      throw err;
    }

    if (data.numerodocumento) {
      const existeDocumento = await usuarios.findOne({ where: { numerodocumento: data.numerodocumento } });
      if (existeDocumento) {
        const err = new Error("El número de documento ya está registrado.");
        err.status = 409;
        throw err;
      }
    }

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

    const existeCorreo = await usuarios.findOne({ where: { correo: data.correo } });
  if (existeCorreo) {
    const err = new Error("El correo ya está registrado.");
    err.status = 400;
    throw err;
  }
   const existeDocumento = await usuarios.findOne({ where: { numerodocumento: data.numerodocumento } });
  if (existeDocumento) {
    const err = new Error("El número de documento ya está registrado.");
    err.status = 400;
    throw err;
  }
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

  async actualizarLosUsuario(id, datos, rolDelSolicitante) {
    try {
      if (datos.rol && rolDelSolicitante !== "doctor") {
        delete datos.rol;
      }

      const usuario = await usuarios.findByPk(id);
      if (!usuario) {
        return { error: "Usuario no encontrado" };
      }

      if (datos.correo) {
        const nuevoCorreo = (datos.correo || "").trim().toLowerCase();
        const correoActual = (usuario.correo || "").trim().toLowerCase();
        if (nuevoCorreo && nuevoCorreo !== correoActual) {
          const existe = await usuarios.findOne({ where: { correo: nuevoCorreo } });
          if (existe && String(existe.id) !== String(id)) {
            const err = new Error("El correo ya está registrado.");
            err.status = 409;
            throw err;
          }
        }
      }

      if (datos.numerodocumento) {
        const nuevoDoc = (datos.numerodocumento || "").toString();
        const docActual = (usuario.numerodocumento || "").toString();
        if (nuevoDoc && nuevoDoc !== docActual) {
          const existeDoc = await usuarios.findOne({ where: { numerodocumento: nuevoDoc } });
          if (existeDoc && String(existeDoc.id) !== String(id)) {
            const err = new Error("El número de documento ya está registrado.");
            err.status = 409;
            throw err;
          }
        }
      }

      await usuarios.update(datos, { where: { id } });
      const actualizado = await usuarios.findByPk(id);
      return { success: true, usuario: actualizado };
    } catch (e) {
      console.log("Error en el servidor al actualizar el usuario:", e);
      throw e;
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

  async marcarNotificacionComoLeida(doctorId, notificacionId) {
    try {
      const notif = await notificaciones.findOne({
        where: { id: notificacionId, id_usuario: doctorId },
      });
      if (!notif) return { error: "Notificación no encontrada" };

      notif.leida = true;
      await notif.save();

      const clave = `notificaciones:doctor:${doctorId}`;
      const lista = await redis.lRange(clave, 0, -1);

      const nuevaLista = lista.map((item) => {
        const n = JSON.parse(item);

        if (String(n.id) === String(notificacionId)) {
          n.leida = true;
        }

        return JSON.stringify(n);
      });

      await redis.del(clave);
      if (nuevaLista.length > 0) {
        for (let i = nuevaLista.length - 1; i >= 0; i--) {
          await redis.lPush(clave, nuevaLista[i]);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      return { error: "Error al marcar notificación como leída" };
    }
  }

  async marcarTodasNotificacionesComoLeidas(doctorId) {
    try {
      // Actualizar en BD
      await notificaciones.update(
        { leida: true },
        { where: { id_usuario: doctorId } }
      );

      const clave = `notificaciones:doctor:${doctorId}`;
      const lista = await redis.lRange(clave, 0, -1);

      if (lista.length > 0) {
        const nuevaLista = lista.map((item) => {
          const n = JSON.parse(item);
          n.leida = true; // 👈 todas en true
          return JSON.stringify(n);
        });

        await redis.del(clave);
        for (let i = nuevaLista.length - 1; i >= 0; i--) {
          await redis.lPush(clave, nuevaLista[i]);
        }
      }

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
      const [actualizadas] = await notificaciones.update(
        { archivada: true },
        { where: { id_usuario: doctorId, leida: true } }
      );
      await redis.del(`notificaciones:doctor:${doctorId}`);
      return { success: true, archivadas: actualizadas };
    } catch (error) {
      console.error("Error al archivar notificaciones:", error);
      return { error: "Error al archivar notificaciones" };
    }
  }

  async obtenerHistorialNotificaciones(doctorId) {
    try {
      // Traer desde BD
      const lista = await notificaciones.findAll({
        where: { id_usuario: doctorId },
        order: [["fecha", "DESC"]],
      });

      // Opcional: limpiar Redis para que no crezca indefinidamente
      // await redis.del(`notificaciones:doctor:${doctorId}`);
      // await redis.del(`notificaciones_archivo:doctor:${doctorId}`);

      return lista;
    } catch (error) {
      console.error("Error al obtener historial de notificaciones:", error);
      return [];
    }
  }

  async marcarNotificacionUsuarioComoLeida(usuarioId, notificacionId) {
    try {
      const notif = await notificaciones.findOne({
        where: { id: notificacionId, id_usuario: usuarioId },
      });
      if (!notif) return { error: "Notificación no encontrada" };

      notif.leida = true;
      await notif.save();

      const clave = `notificaciones:usuario:${usuarioId}`;
      const lista = await redis.lRange(clave, 0, -1);

      const nuevaLista = lista.map((item) => {
        const n = JSON.parse(item);

        if (String(n.id) === String(notificacionId)) {
          n.leida = true;
        }

        return JSON.stringify(n);
      });

      await redis.del(clave);
      if (nuevaLista.length > 0) {
        for (let i = nuevaLista.length - 1; i >= 0; i--) {
          await redis.lPush(clave, nuevaLista[i]);
        }
      }

      return { success: true };
    } catch (error) {
      console.error(
        "Error al marcar notificación de usuario como leída:",
        error
      );
      return { error: "Error al marcar notificación como leída" };
    }
  }

  async archivarNotificacionesLeidasUsuario(usuarioId) {
    try {
      const [actualizadas] = await notificaciones.update(
        { archivada: true },
        { where: { id_usuario: usuarioId, leida: true } }
      );
      await redis.del(`notificaciones:usuario:${usuarioId}`);
      return { success: true, archivadas: actualizadas };
    } catch (error) {
      console.error("Error al archivar notificaciones usuario:", error);
      return { error: "Error al archivar notificaciones usuario" };
    }
  }

  async marcarTodasNotificacionesUsuarioComoLeidas(usuarioId) {
    try {
      await notificaciones.update(
        { leida: true },
        { where: { id_usuario: usuarioId } }
      );

      const clave = `notificaciones:usuario:${usuarioId}`;
      const lista = await redis.lRange(clave, 0, -1);

      if (lista.length > 0) {
        const nuevaLista = lista.map((item) => {
          const n = JSON.parse(item);
          n.leida = true;
          return JSON.stringify(n);
        });

        await redis.del(clave);
        for (let i = nuevaLista.length - 1; i >= 0; i--) {
          await redis.lPush(clave, nuevaLista[i]);
        }
      }

      return { success: true };
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas (usuario):",
        error
      );
      return { error: "Error al marcar todas las notificaciones como leídas" };
    }
  }

  async obtenerHistorialNotificacionesUsuario(usuarioId) {
    try {
      const lista = await notificaciones.findAll({
        where: { id_usuario: usuarioId },
        order: [["fecha", "DESC"]],
      });

      // Limpiar cache
      // await redis.del(`notificaciones:usuario:${usuarioId}`);
      return lista;
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

  async preRegistrarUsuario(data) {
    try {
      const { correo } = data;
      if (!correo) return { error: "Correo es requerido" };

      // Existe ya usuario definitivo
      const existente = await usuarios.findOne({ where: { correo } });
      if (existente) {
        return { error: "El correo ya está registrado." };
      }
      if (data.numerodocumento) {
        const existeDoc = await usuarios.findOne({ where: { numerodocumento: data.numerodocumento } });
        if (existeDoc) {
          return { error: "El número de documento ya está registrado." };
        }
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
        estado: true, 
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

      // Seguridad  evitar duplicado si otro proceso ya creó
      const ya = await usuarios.findOne({ where: { correo } });
      if (ya) {
        await redis.del(key);
        return { error: "El correo ya está registrado." };
      }
      const yaDocumento = await usuarios.findOne({ where: { numerodocumento: data.numerodocumento } });
      if (yaDocumento) {
        await redis.del(key);
        return { error: "El número de documento ya está registrado." };
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
