const {
  citas,
  usuarios,
  sequelize,
  carrito,
  ordenes,
  ordenprocedimiento,
  historialclinico,
  procedimientos,
} = require("../models");
const { EnviarCorreo } = require("../assets/corre");
const { ValidarLaCita } = require("../assets/Validarfecharegistro");
const { Op } = require("sequelize");
const redis = require("../config/redis");
const moment = require("moment-timezone");
class HistorialClinicoService {
  async listarLasCitas(doctorId = null) {
    const whereCondition = doctorId ? { id_doctor: doctorId } : {};

    return await citas.findAll({
      where: whereCondition,
      include: [
        {
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
          include: [{ model: historialclinico, as: "historial_medico" }],
        },
        {
          model: ordenes,
          as: "orden",
          include: [
            {
              model: procedimientos,
              as: "procedimientos",
              through: { attributes: [] },
            },
          ],
        },
        {
          model: usuarios,
          as: "doctor",
          attributes: ["nombre", "ocupacion"],
        },
      ],
      order: [["id", "ASC"]],
    });
  }

  async crearOrdenDesdeCarrito(id_usuario) {
    try {
      return await sequelize.transaction(async (t) => {
        const nuevaOrden = await ordenes.create(
          {
            id_usuario,
            fecha_creacion: new Date(),
            estado: "pendiente",
          },
          { transaction: t }
        );
        const carrito = await carrito.findAll({
          where: { id_usuario },
          transaction: t,
        });
        console.log("Carrito encontrado:", carrito);
        if (carrito.length === 0) {
          throw new Error("El carrito está vacío.");
        }
        const registros = carrito.map((item) => ({
          id_orden: nuevaOrden.id,
          id_procedimiento: item.id_procedimiento,
        }));
        console.log("Registros a insertar en ordenprocedimiento:", registros);
        await ordenprocedimiento.bulkCreate(registros, { transaction: t });
        await carrito.destroy({ where: { id_usuario }, transaction: t });
        return nuevaOrden;
      });
    } catch (e) {
      console.log("Error al crear orden desde carrito:", e);
    }
  }

  async buscarLasCitas(id) {
    return await citas.findByPk(id, {
      include: [
        {
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
          include: [{ model: historialclinico, as: "historial_medico" }],
        },
        {
          model: ordenes,
          as: "orden",
          include: [
            {
              model: procedimientos,
              as: "procedimientos",
              through: { attributes: [] },
            },
          ],
        },
        {
          model: usuarios,
          as: "doctor",
          attributes: ["nombre"],
        },
      ],
    });
  }

  async crearLasCitas(data) {
    // Normalizar fecha a zona horaria America/Bogota para evitar desfaces (ej. 03:00 AM)
    if (data?.fecha) {
      const m = moment.tz(data.fecha, "America/Bogota");
      // Si viene en 'YYYY-MM-DDTHH:mm:ss' o 'YYYY-MM-DD HH:mm:ss', moment lo parsea; asegurar objeto Date
      data.fecha = m.toDate();
    }
    ValidarLaCita(data);

    const tieneCitasPrevias = await citas.findOne({
      where: { id_usuario: data.id_usuario },
    });

    const carrito = await carrito.findAll({
      where: { id_usuario: data.id_usuario },
    });

  if (!tieneCitasPrevias) {
      // Primera cita
      if (carrito.length === 0) {
        throw new Error(
          "Debes agregar al menos un procedimiento para agendar la primera cita de evaluación."
        );
      }
      data.tipo = "evaluacion";
      const nuevaOrden = await this.crearOrdenDesdeCarrito(data.id_usuario);
      if (!nuevaOrden || !nuevaOrden.id) {
        throw new Error(
          "No se pudo crear la orden. Asegúrate de haber seleccionado un procedimiento en tu carrito."
        );
      }
      data.id_orden = nuevaOrden.id;
    } else {
      if (carrito.length > 0) {
        const nuevaOrden = await this.crearOrdenDesdeCarrito(data.id_usuario);
        if (!nuevaOrden || !nuevaOrden.id) {
          throw new Error(
            "No se pudo crear la orden. Asegúrate de haber seleccionado un procedimiento en tu carrito."
          );
        }
        data.id_orden = nuevaOrden.id;
      } else {
        // Sin carrito: validar reglas para procedimiento basado en evaluación realizada
        if (data.tipo === "procedimiento") {
          if (!data.id_orden) {
            throw new Error(
              "Debe seleccionar una orden asociada a una evaluación realizada para agendar el procedimiento."
            );
          }
          // Verificar que exista una cita de evaluación realizada ligada a esa orden y a ese usuario
          const evaluacionRealizada = await citas.findOne({
            where: {
              id_usuario: data.id_usuario,
              id_orden: data.id_orden,
              tipo: "evaluacion",
              estado: "realizada",
            },
          });
          if (!evaluacionRealizada) {
            throw new Error(
              "La orden seleccionada no está asociada a una evaluación realizada para este usuario."
            );
          }
        }
      }
    }
    const creacita = await citas.create(data);
    let usuario;
    let doctor;
    try {
      usuario = await usuarios.findByPk(data.id_usuario);
      doctor = await usuarios.findByPk(data.id_doctor);
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }
      if (!doctor) {
        throw new Error("Doctor no encontrado");
      }
    } catch (e) {
      console.error("Error al encontrar el usuario:", e);
    }
    try {
      await EnviarCorreo({
        receipients: doctor.correo,
        subject: "Cita registrada",
        message: `
     <h2>Hola ${doctor.nombre}, El paciente  ${usuario.nombre} ha registrado una cita</h2>
      <p>Fecha y hora de la cita: <strong>${data.fecha} horas</strong></p>
      <p>Tipo de cita: <strong>${data.tipo}</strong></p>
    `,
      });
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }

    try {
      await EnviarCorreo({
        receipients: usuario.correo,
        subject: "Cita creada correctamente",
        message: `
     <h2>Hola ${usuario.nombre}, tu cita ha sido creada correctamente</h2>
      <p>Fecha y hora de la cita: <strong>${data.fecha} horas</strong></p>
      <p>Doctor: <strong>${doctor.nombre}</strong></p>
      <p>Tipo de cita: <strong>${data.tipo}</strong></p>
      <p>Tu cita en <strong>Clínica Rejuvenezk</strong> fue creada exitosamente.</p>
      <p>Gracias por confiar en nosotros. Te estaremos contactando pronto.</p>
    `,
      });
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }
    try {
      await this.guardarYEmitirNotificacion(global.io, data.id_doctor, {
        mensaje: `📅 Nueva cita con ${usuario.nombre} para el ${data.fecha}`,
        fecha: new Date().toISOString(),
        tipo: "cita",
        citaId: creacita.id,
        paciente: usuario.nombre,
        fechaCita: data.fecha,
        tipoCita: data.tipo,
        leida: false,
      });
      console.log("Notificación emitida correctamente");
    } catch (error) {
      console.error("Error al emitir notificación:", error);
    }

    // Enviar notificación al usuario/paciente
    try {
      await this.guardarYEmitirNotificacionUsuario(global.io, data.id_usuario, {
        mensaje: `📅 Tu cita ha sido confirmada para el ${data.fecha}`,
        fecha: new Date().toISOString(),
        tipo: "confirmacion_cita",
        citaId: creacita.id,
        fechaCita: data.fecha,
        tipoCita: data.tipo,
        leida: false,
      });
      console.log("Notificación enviada al usuario correctamente");
    } catch (error) {
      console.error("Error al enviar notificación al usuario:", error);
    }
    return creacita;
  }

  async eliminarLasCitas(id) {
    const citas = await citas.findByPk(id);

    if (citas) {
      return await citas.destroy();
    }
    return null;
  }

  async actualizarLasCitas(id, datos) {
    try {
      let actualizado = await citas.update(datos, { where: { id } });
      return actualizado;
    } catch (e) {
      console.log("Error en el servidor al actualizar el Citas:", e);
    }
  }

  async obtenerCitasPorFecha(fecha) {
    const inicioDelDia = new Date(`${fecha}T00:00:00`);
    const finDelDia = new Date(`${fecha}T23:59:59`);

    if (isNaN(inicioDelDia.getTime()) || isNaN(finDelDia.getTime())) {
      throw new Error("Fecha no Valida");
    }

    return await citas.findAll({
      where: {
        fecha: {
          [Op.between]: [inicioDelDia, finDelDia],
        },
      },
      include: {
        model: usuarios,
        as: "usuario",
        attributes: ["nombre"],
      },
      order: [["fecha", "ASC"]],
    });
  }

  async guardarYEmitirNotificacion(io, doctorId, notificacion) {
    const clave = `notificaciones:doctor:${doctorId}`;
    // Guardar en Redis
    await redis.lPush(clave, JSON.stringify(notificacion));
    await redis.lTrim(clave, 0, 20);
    // Emitir en tiempo real
    io.to(`doctor_${doctorId}`).emit("nuevaNotificacion", notificacion);
    console.log(`Emitido a doctor_${doctorId}:`, notificacion);
  }

  async guardarYEmitirNotificacionUsuario(io, usuarioId, notificacion) {
    const clave = `notificaciones:usuario:${usuarioId}`;
    // Guardar en Redis
    await redis.lPush(clave, JSON.stringify(notificacion));
    await redis.lTrim(clave, 0, 20);
    // Emitir en tiempo real
    io.to(`paciente_${usuarioId}`).emit("nuevaNotificacion", notificacion);
    console.log(`Emitido a paciente_${usuarioId}:`, notificacion);
  }

  async obtenerCitasPorDia(doctorId, fecha) {
    try {
      // Validar la fecha antes de usarla
      if (!moment(fecha, "YYYY-MM-DD", true).isValid()) {
        throw new Error("Fecha no válida");
      }
      // Usamos moment-timezone para asegurarnos de que las fechas sean en la zona horaria correcta (Bogotá)
      const FechaInicio = moment
        .tz(`${fecha}T00:00:00`, "America/Bogota")
        .toDate();
      const FechaFin = moment
        .tz(`${fecha}T23:59:59`, "America/Bogota")
        .toDate();
      // Verificar en consola
      console.log("Start Date:", FechaInicio); 
      // Verificar en consola
      console.log("End Date:", FechaFin); 

      // Realizamos la consulta con las fechas ajustadas y solo las citas del doctor
      return await citas.findAll({
        where: {
          // Filtramos por el ID del doctor
          id_doctor: doctorId, 
          fecha: {
            // Mayor o igual al inicio del día
            [Op.gte]: FechaInicio, 
            // Menor o igual al final del día
            [Op.lte]: FechaFin, 
          },
        },
      });
    } catch (error) {
      console.error("Error al obtener citas por día:", error);
      throw new Error("Error al obtener citas por día");
    }
  }
  async obtenerCitasPorRango(doctorId, desde, hasta) {
    try {
      // Validar si las fechas son válidas
      if (
        !moment(desde, "YYYY-MM-DD", true).isValid() ||
        !moment(hasta, "YYYY-MM-DD", true).isValid()
      ) {
        throw new Error("Fechas no válidas");
      }

      // Convertir las fechas a la zona horaria de Bogotá (o la que necesites)
      const RangoInicio = moment
        .tz(`${desde}T00:00:00`, "America/Bogota")
        .toDate();
      const RangoFin = moment
        .tz(`${hasta}T23:59:59`, "America/Bogota")
        .toDate();
      // Verificar la fecha de inicio
      console.log("Start Date:", RangoInicio); 
      // Verificar la fecha de fin
      console.log("End Date:", RangoFin); 

      // Realizar la consulta filtrada por doctor y el rango de fechas
      return await citas.findAll({
        where: {
          // Filtrar por el ID del doctor
          id_doctor: doctorId, 
          fecha: {
            // Filtrar por el rango de fechas
            [Op.between]: [RangoInicio, RangoFin], 
          },
        },
      });
    } catch (error) {
      console.error("Error al obtener citas por rango de fechas:", error);
      throw new Error("Error al obtener citas por rango de fechas");
    }
  }
  async obtenerCitasPorTipo(doctorId, tipo, fecha) {
    try {
      // Usamos moment para verificar si la fecha es válida
      const startOfDay = moment
        .tz(`${fecha}T00:00:00`, "America/Bogota")
        .toDate();
      const endOfDay = moment
        .tz(`${fecha}T23:59:59`, "America/Bogota")
        .toDate();

      // Realizamos la consulta, filtrando por tipo, doctor y fecha
      return await citas.findAll({
        where: {
          id_doctor: doctorId,
          tipo: tipo,
          fecha: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
        },
      });
    } catch (error) {
      console.error("Error al obtener citas por tipo:", error);
      throw new Error("Error al obtener citas por tipo");
    }
  }
  async obtenerMisCitas(usuarioId) {
    return await citas.findAll({
      where: { id_usuario: usuarioId },
      include: [
        {
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
        {
          model: usuarios,
          as: "doctor",
          attributes: ["nombre"],
        },
        {
          model: ordenes,
          as: "orden",
          include: [
            {
              model: procedimientos,
              as: "procedimientos",
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [["fecha", "ASC"]],
    });
  }

    async cambiarEstadoCita({ id, estado, doctorId }) {
      try {
        const cita = await citas.findByPk(id);
        if (!cita) return null;

        if (parseInt(cita.id_doctor) !== parseInt(doctorId)) {
          const err = new Error("No autorizado para cambiar esta cita");
          err.status = 403;
          throw err;
        }

        const estadosPermitidos = ["pendiente", "confirmada", "realizada", "cancelada"];
        if (!estadosPermitidos.includes(estado)) {
          const err = new Error("Estado inválido");
          err.status = 400;
          throw err;
        }

        cita.estado = estado;
        await cita.save();
        console.log("Estado de cita actualizado:", { id: cita.id, estado: cita.estado });
        return cita;
      } catch (error) {
        console.error("Error al cambiar estado de la cita:", error);
        throw error;
      }
    }
  
}
module.exports = new HistorialClinicoService();
