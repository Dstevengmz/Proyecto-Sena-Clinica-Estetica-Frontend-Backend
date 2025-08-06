const {
  Citas,
  Usuarios,
  sequelize,
  Carrito,
  Ordenes,
  OrdenProcedimiento,
} = require("../models");
const { EnviarCorreo } = require("../assets/corre");
const { ValidarLaCita } = require("../assets/Validarfecharegistro");
const { Op } = require("sequelize");
const redis = require("../config/redis");
const moment = require("moment-timezone");
class HistorialClinicoService {
  async listarLasCitas(doctorId = null) {
    const whereCondition = doctorId ? { id_doctor: doctorId } : {};
    
    return await Citas.findAll({
      where: whereCondition, 
      include: [
        {
          model: Usuarios,
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
          model: Usuarios,
          as: "doctor",
          attributes: ["nombre"],
        },
      ],
      order: [["id", "ASC"] ], 
    });
  }
  async crearOrdenDesdeCarrito(id_usuario) {
    try {
      return await sequelize.transaction(async (t) => {
        const nuevaOrden = await Ordenes.create(
          {
            id_usuario,
            fecha_creacion: new Date(),
            estado: "pendiente",
          },
          { transaction: t }
        );
        const carrito = await Carrito.findAll({
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
        console.log("Registros a insertar en OrdenProcedimiento:", registros);
        await OrdenProcedimiento.bulkCreate(registros, { transaction: t });
        await Carrito.destroy({ where: { id_usuario }, transaction: t });
        return nuevaOrden;
      });
    } catch (e) {
      console.log("Error al crear orden desde carrito:", e);
    }
  }

  async buscarLasCitas(id) {
    return await Citas.findByPk(id, {
      include: [
        {
          model: Usuarios,
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
          model: Usuarios,
          as: "doctor",
          attributes: ["nombre"],
        },
      ],
    });
  }

  async crearLasCitas(data) {
    ValidarLaCita(data);
    const creacita = await Citas.create(data);
    let usuario;
    let doctor;
    try {
      usuario = await Usuarios.findByPk(data.id_usuario);
      doctor = await Usuarios.findByPk(data.id_doctor);
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
    const citas = await Citas.findByPk(id);

    if (citas) {
      return await citas.destroy();
    }
    return null;
  }

  async actualizarLasCitas(id, datos) {
    try {
      let actualizado = await Citas.update(datos, { where: { id } });
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

    return await Citas.findAll({
      where: {
        fecha: {
          [Op.between]: [inicioDelDia, finDelDia],
        },
      },
      include: {
        model: Usuarios,
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

      console.log("Start Date:", FechaInicio); // Verificar en consola
      console.log("End Date:", FechaFin); // Verificar en consola

      // Realizamos la consulta con las fechas ajustadas y solo las citas del doctor
      return await Citas.findAll({
        where: {
          id_doctor: doctorId, // Filtramos por el ID del doctor
          fecha: {
            [Op.gte]: FechaInicio, // Mayor o igual al inicio del día
            [Op.lte]: FechaFin, // Menor o igual al final del día
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

      console.log("Start Date:", RangoInicio); // Verificar la fecha de inicio
      console.log("End Date:", RangoFin); // Verificar la fecha de fin

      // Realizar la consulta filtrada por doctor y el rango de fechas
      return await Citas.findAll({
        where: {
          id_doctor: doctorId, // Filtrar por el ID del doctor
          fecha: {
            [Op.between]: [RangoInicio, RangoFin], // Filtrar por el rango de fechas
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
    const startOfDay = moment.tz(`${fecha}T00:00:00`, 'America/Bogota').toDate();
    const endOfDay = moment.tz(`${fecha}T23:59:59`, 'America/Bogota').toDate();

    // Realizamos la consulta, filtrando por tipo, doctor y fecha
    return await Citas.findAll({
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
}
module.exports = new HistorialClinicoService();