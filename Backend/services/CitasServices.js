const HorariosDisponibles = require("../assets/HorariosDisponibles");
const streamBuffers = require("stream-buffers");

const {
  citas,
  usuarios,
  sequelize,
  carrito,
  ordenes,
  ordenprocedimiento,
  historialclinico,
  procedimientos,
  examen,
  notificaciones,
  requerimientos,
  consentimiento,
} = require("../models");
const PDFDocument = require("pdfkit");
const cloudinary = require("../config/cloudinary");
const { EnviarCorreo } = require("../assets/corre");
const { ValidarLaCita } = require("../assets/Validarfecharegistro");
const { Op } = require("sequelize");
const redis = require("../config/redis");
const moment = require("moment-timezone");
class HistorialClinicoService {
  async calcularTotalesPorRango(doctorId, inicio, fin) {
    const where = {
      fecha: { [Op.between]: [inicio, fin] },
    };
    if (doctorId) where.id_doctor = doctorId;

    const citasRango = await citas.findAll({ where });

    return {
      total: citasRango.length,
      canceladas: citasRango.filter((c) => c.estado === "cancelada").length,
      pendientes: citasRango.filter((c) => c.estado === "pendiente").length,
      realizadasEvaluacion: citasRango.filter(
        (c) => c.estado === "realizada" && c.tipo === "evaluacion"
      ).length,
      realizadasProcedimiento: citasRango.filter(
        (c) => c.estado === "realizada" && c.tipo === "procedimiento"
      ).length,
    };
  }

  async notificarTotalesDia(doctorId) {
    const inicio = moment.tz("America/Bogota").startOf("day").toDate();
    const fin = moment.tz("America/Bogota").endOf("day").toDate();

    const totales = await this.calcularTotalesPorRango(doctorId, inicio, fin);
    global.io.to(`doctor_${doctorId}`).emit("totalesDia", totales);
  }

  async notificarTotalesSemana(doctorId) {
    const inicio = moment.tz("America/Bogota").startOf("week").toDate();
    const fin = moment.tz("America/Bogota").endOf("week").toDate();

    const totales = await this.calcularTotalesPorRango(doctorId, inicio, fin);
    global.io.to(`doctor_${doctorId}`).emit("totalesSemana", totales);
  }

  async notificarTotalesMes(doctorId) {
    const inicio = moment.tz("America/Bogota").startOf("month").toDate();
    const fin = moment.tz("America/Bogota").endOf("month").toDate();

    const totales = await this.calcularTotalesPorRango(doctorId, inicio, fin);
    global.io.to(`doctor_${doctorId}`).emit("totalesMes", totales);
  }

  async crearRequerimiento(data) {
    const nuevoReq = await requerimientos.create(data);

    let actual = moment(data.fecha_inicio);

    if (actual.day() === 0) {
      actual = actual.add(1, "days");
    }
    for (let i = 0; i < data.repeticiones; i++) {
      let citaAsignada = false;
      let reintentos = 0;
      const MaximoIntentos = 10;
      while (!citaAsignada && reintentos < MaximoIntentos) {
        const fechaStr = actual.format("YYYY-MM-DD");

        const horarios = HorariosDisponibles.horarios();

        const inicioDelDia = moment
          .tz(`${fechaStr}T00:00:00`, "America/Bogota")
          .toDate();
        const finDelDia = moment
          .tz(`${fechaStr}T23:59:59`, "America/Bogota")
          .toDate();

        const citasDelDia = await citas.findAll({
          where: {
            id_doctor: data.id_doctor,
            fecha: { [Op.between]: [inicioDelDia, finDelDia] },
            estado: { [Op.ne]: "cancelada" },
          },
        });

        let horaAsignada = null;
        for (const h of horarios) {
          const inicio = moment
            .tz(`${fechaStr}T${h}:00`, "America/Bogota")
            .toDate();
          const fin = new Date(
            inicio.getTime() +
              HorariosDisponibles.duraciones().procedimiento * 60000
          );

          const ocupado = citasDelDia.some((c) => {
            const inicioOcupado = new Date(c.fecha);
            const finOcupado = new Date(
              inicioOcupado.getTime() +
                HorariosDisponibles.duraciones()[c.tipo] * 60000
            );
            return (
              (inicio >= inicioOcupado && inicio < finOcupado) ||
              (fin > inicioOcupado && fin <= finOcupado) ||
              (inicio <= inicioOcupado && fin >= finOcupado)
            );
          });

          if (!ocupado) {
            horaAsignada = inicio;
            break;
          }
        }

        if (horaAsignada) {
          await citas.create({
            id_usuario: data.id_usuario,
            id_doctor: data.id_doctor,
            fecha: horaAsignada,
            tipo: "procedimiento",
            estado: "pendiente",
            observaciones: data.descripcion,
            origen: "requerimiento",
          });
          citaAsignada = true;
        } else {
          actual = actual.add(1, "days");
          if (actual.day() === 0) {
            actual = actual.add(1, "days");
          }
          reintentos++;
        }
      }

      if (citaAsignada) {
        actual = actual.add(data.frecuencia, "days");
        if (actual.day() === 0) {
          actual = actual.add(1, "days");
        }
      } else {
        throw new Error(
          "No se pudo asignar la cita después de varios intentos."
        );
      }
    }

    return nuevoReq;
  }

  async notificarTotalCitasRealizadasProcedimientoHoy(doctorId) {
    try {
      const inicioDelDia = moment.tz("America/Bogota").startOf("day").toDate();
      const finDelDia = moment.tz("America/Bogota").endOf("day").toDate();

      const where = {
        estado: "realizada",
        tipo: "procedimiento",
        fecha: {
          [Op.between]: [inicioDelDia, finDelDia],
        },
      };

      if (doctorId) {
        where.id_doctor = doctorId;
      }

      const total = await citas.count({ where });

      if (doctorId) {
        global.io
          .to(`doctor_${doctorId}`)
          .emit("totalCitasRealizadasProcedimientoHoy", { total });
      }

      return total;
    } catch (error) {
      console.error(
        "Error al contar citas realizadas de tipo procedimiento hoy:",
        error
      );
      return 0;
    }
  }

  async notificarTotalCitasRealizadasEvaluacionHoy(doctorId) {
    try {
      const inicioDelDia = moment.tz("America/Bogota").startOf("day").toDate();
      const finDelDia = moment.tz("America/Bogota").endOf("day").toDate();

      const where = {
        estado: "realizada",
        tipo: "evaluacion",
        fecha: {
          [Op.between]: [inicioDelDia, finDelDia],
        },
      };

      if (doctorId) {
        where.id_doctor = doctorId;
      }

      const total = await citas.count({ where });

      if (doctorId) {
        global.io
          .to(`doctor_${doctorId}`)
          .emit("totalCitasRealizadasEvaluacionHoy", { total });
      }

      return total;
    } catch (error) {
      console.error(
        "Error al contar citas realizadas de tipo evaluación hoy:",
        error
      );
      return 0;
    }
  }

  async notificarTotalCitasCanceladasHoy(doctorId) {
    try {
      const inicioDelDia = moment.tz("America/Bogota").startOf("day").toDate();
      const finDelDia = moment.tz("America/Bogota").endOf("day").toDate();

      const where = {
        estado: "cancelada",
        fecha: {
          [Op.between]: [inicioDelDia, finDelDia],
        },
      };

      if (doctorId) {
        where.id_doctor = doctorId;
      }

      const total = await citas.count({ where });

      if (doctorId) {
        global.io
          .to(`doctor_${doctorId}`)
          .emit("totalCitasCanceladasHoy", { total });
      }

      return total;
    } catch (error) {
      console.error("Error al contar citas canceladas de hoy:", error);
      return 0;
    }
  }

  async notificarTotalCitasPendientesHoy(doctorId) {
    try {
      const inicioDelDia = moment.tz("America/Bogota").startOf("day").toDate();
      const finDelDia = moment.tz("America/Bogota").endOf("day").toDate();

      const where = {
        estado: "pendiente",
        fecha: {
          [Op.between]: [inicioDelDia, finDelDia],
        },
      };

      if (doctorId) {
        where.id_doctor = doctorId;
      }

      const total = await citas.count({ where });

      if (doctorId) {
        global.io
          .to(`doctor_${doctorId}`)
          .emit("totalCitasPendientesHoy", { total });
      }

      return total;
    } catch (error) {
      console.error("Error al contar citas pendientes de hoy:", error);
      return 0;
    }
  }

  async notificarTotalCitas(doctorId) {
    const total = await citas.count({ where: { id_doctor: doctorId } });
    global.io.to(`doctor_${doctorId}`).emit("totalCitas", { total });
  }

  async notificarTotalCitasCanceladas(doctorId) {
    const total = await citas.count({
      where: { id_doctor: doctorId, estado: "cancelada" },
    });
    global.io.to(`doctor_${doctorId}`).emit("totalCitasCanceladas", { total });
  }

  async listarPacientesPorDoctor(doctorId) {
    try {
      return await citas.findAll({
        where: { id_doctor: doctorId },
        include: [
          {
            model: usuarios,
            as: "usuario",
            attributes: ["id", "nombre", "correo", "numerodocumento"],
          },
          { model: usuarios, as: "doctor", attributes: ["id", "nombre"] },
        ],
        order: [["fecha", "DESC"]],
      });
    } catch (error) {
      console.error("Error en listarPacientesPorDoctor:", error);
      throw error;
    }
  }

  async listarCitasPorUsuarioYDoctor(usuarioId, doctorId) {
    try {
      return await citas.findAll({
        where: { id_usuario: usuarioId, id_doctor: doctorId },
        include: [
          {
            model: usuarios,
            as: "usuario",
            attributes: ["id", "nombre", "correo"],
          },
          { model: usuarios, as: "doctor", attributes: ["id", "nombre"] },
        ],
        order: [["fecha", "ASC"]],
      });
    } catch (error) {
      console.error("Error en listarCitasPorUsuarioYDoctor:", error);
      throw error;
    }
  }

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
        {
          model: examen,
          as: "examenes",
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
        const carrit = await carrito.findAll({
          where: { id_usuario },
          transaction: t,
        });
        console.log("Carrito encontrado:", carrit);
        if (carrit.length === 0) {
          throw new Error("El carrito está vacío.");
        }
        const registros = carrit.map((item) => ({
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
          model: examen,
          as: "examenes",
        },
        {
          model: usuarios,
          as: "doctor",
          attributes: ["nombre"],
        },
        {
          model: requerimientos,
          as: "requerimientos",
          attributes: [
            "descripcion",
            "fecha_inicio",
            "frecuencia",
            "repeticiones",
          ],
        },
      ],
    });
  }

  async crearLasCitas(data) {
    if (data?.fecha) {
      const m = moment.tz(data.fecha, "America/Bogota");
      if (m.day() === 0) {
        const err = new Error("No se pueden agendar citas los domingos.");
        err.status = 400;
        throw err;
      }
      data.fecha = m.toDate();
    }
    ValidarLaCita(data);

    const tieneCitasPrevias = await citas.findOne({
      where: { id_usuario: data.id_usuario },
    });

    const carrit = await carrito.findAll({
      where: { id_usuario: data.id_usuario },
    });

    const rolCreador = data._rol_creador;
    const esRolUsuario = rolCreador === "usuario";
    const esProcedimiento = data.tipo === "procedimiento";

    if (carrit.length === 0) {
      if (esRolUsuario) {
        const err = new Error(
          "No es posible registrar la cita porque no tienes un servicio seleccionado en tu carrito."
        );
        err.status = 400;
        throw err;
      }
      if (!esProcedimiento) {
        const err = new Error(
          "Para crear esta cita se requiere un procedimiento en el carrito o seleccionar el tipo adecuado."
        );
        err.status = 400;
        throw err;
      }
    }

    if (!tieneCitasPrevias) {
      if (esRolUsuario) {
        data.tipo = "evaluacion";
        const nuevaOrden = await this.crearOrdenDesdeCarrito(data.id_usuario);
        if (!nuevaOrden || !nuevaOrden.id) {
          const err = new Error(
            "No se pudo crear la orden. Asegúrate de haber seleccionado un procedimiento en tu carrito."
          );
          err.status = 400;
          throw err;
        }
        data.id_orden = nuevaOrden.id;
      } else {
        if (!esProcedimiento) {
          const err = new Error(
            "Debe existir un servicio en carrito para crear la primera evaluación del paciente."
          );
          err.status = 400;
          throw err;
        }
      }
    } else {
      if (carrit.length > 0) {
        const nuevaOrden = await this.crearOrdenDesdeCarrito(data.id_usuario);
        if (!nuevaOrden || !nuevaOrden.id) {
          const err = new Error(
            "No se pudo crear la orden. Asegúrate de haber seleccionado un procedimiento en tu carrito."
          );
          err.status = 400;
          throw err;
        }
        data.id_orden = nuevaOrden.id;
      } else {
        if (data.tipo === "procedimiento") {
          if (!data.id_orden) {
            const err = new Error(
              "Debe seleccionar una orden asociada a una evaluación realizada para agendar el procedimiento."
            );
            err.status = 400;
            throw err;
          }
          const evaluacionRealizada = await citas.findOne({
            where: {
              id_usuario: data.id_usuario,
              id_orden: data.id_orden,
              tipo: "evaluacion",
              estado: "realizada",
            },
            order: [["fecha", "DESC"]],
          });
          if (!evaluacionRealizada) {
            const err = new Error(
              "La orden seleccionada no está asociada a una evaluación realizada para este usuario."
            );
            err.status = 400;
            throw err;
          }
          if (
            evaluacionRealizada.examenes_requeridos &&
            !data.examenes_requeridos
          ) {
            data.examenes_requeridos = evaluacionRealizada.examenes_requeridos;
          }
        }
      }
    }
    const creacita = await citas.create(data);
    let usuario, doctor;
    const fechaLocal = moment
      .tz(data.fecha, "America/Bogota")
      .format("DD/MM/YYYY hh:mm A");

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
      <p>Fecha y hora de la cita: <strong>${fechaLocal} horas</strong></p>
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
      <p>Fecha y hora de la cita: <strong>${fechaLocal} horas</strong></p>
      <p>Doctor: <strong>${doctor.nombre}</strong></p>
      <p>Tipo de cita: <strong>${data.tipo}</strong></p>
      <p>Tu cita en <strong>Clinestetica</strong> fue creada exitosamente.</p>
      <p>Gracias por confiar en nosotros. Te estaremos contactando pronto.</p>
    `,
      });
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }
    try {
      await this.guardarYEmitirNotificacion(global.io, data.id_doctor, {
        // mensaje: `📅 Nueva cita con ${usuario?.nombre || "Paciente"} para el ${
        //   data.fecha
        // }`,
        mensaje: `📅 Nueva cita con ${
          usuario?.nombre || "Paciente"
        } para el ${fechaLocal}`,

        fecha: new Date().toISOString(),
        tipo: "cita",
        citaId: creacita.id,
        paciente: usuario?.nombre,
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
        // mensaje: `📅 Tu cita ha sido confirmada para el ${data.fecha}`,
        mensaje: `📅 Tu cita ha sido confirmada para el ${fechaLocal}`,
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
    const cita = await citas.findByPk(id);

    if (cita) {
      return await cita.destroy();
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

  async obtenerCitasPorFecha(fecha, doctorId = null) {
    const inicioDelDia = new Date(`${fecha}T00:00:00`);
    const finDelDia = new Date(`${fecha}T23:59:59`);

    if (isNaN(inicioDelDia.getTime()) || isNaN(finDelDia.getTime())) {
      throw new Error("Fecha no válida");
    }

    const where = {
      fecha: {
        [Op.between]: [inicioDelDia, finDelDia],
      },
      estado: { [Op.ne]: "cancelada" },
    };

    if (doctorId) {
      where.id_doctor = doctorId;
    }

    return await citas.findAll({
      where,
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

    // 1. Guardar en BD y obtener la notificación creada
    const nuevaNotif = await notificaciones.create({
      id_usuario: doctorId,
      id_cita: notificacion.citaId || null,
      tipo: notificacion.tipo,
      mensaje: notificacion.mensaje,
      fecha: notificacion.fecha,
      leida: false,
      archivada: false,
    });

    // 2. Guardar en Redis con ID de BD
    await redis.lPush(
      clave,
      JSON.stringify({
        ...notificacion,
        id: nuevaNotif.id, // 👈 id real de la BD
        leida: false,
        archivada: false,
      })
    );
    await redis.lTrim(clave, 0, 20);

    // 3. Emitir en tiempo real con id también
    io.to(`doctor_${doctorId}`).emit("nuevaNotificacion", {
      ...notificacion,
      id: nuevaNotif.id,
      leida: false,
      archivada: false,
    });

    console.log(`Emitido a doctor_${doctorId}:`, {
      ...notificacion,
      id: nuevaNotif.id,
    });
  }

  async guardarYEmitirNotificacionUsuario(io, usuarioId, notificacion) {
    const clave = `notificaciones:usuario:${usuarioId}`;

    const nuevaNotif = await notificaciones.create({
      id_usuario: usuarioId,
      id_cita: notificacion.citaId || null,
      tipo: notificacion.tipo,
      mensaje: notificacion.mensaje,
      fecha: notificacion.fecha,
      leida: false,
      archivada: false,
    });

    await redis.lPush(
      clave,
      JSON.stringify({
        ...notificacion,
        id: nuevaNotif.id,
        leida: false,
        archivada: false,
      })
    );
    await redis.lTrim(clave, 0, 20);

    io.to(`paciente_${usuarioId}`).emit("nuevaNotificacion", {
      ...notificacion,
      id: nuevaNotif.id,
      leida: false,
      archivada: false,
    });

    console.log(`Emitido a paciente_${usuarioId}:`, {
      ...notificacion,
      id: nuevaNotif.id,
    });
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
      const startOfDay = moment
        .tz(`${fecha}T00:00:00`, "America/Bogota")
        .toDate();
      const endOfDay = moment
        .tz(`${fecha}T23:59:59`, "America/Bogota")
        .toDate();

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
        {
          model: examen,
          as: "examenes",
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

      const estadosPermitidos = [
        "pendiente",
        "confirmada",
        "realizada",
        "cancelada",
      ];
      if (!estadosPermitidos.includes(estado)) {
        const err = new Error("Estado inválido");
        err.status = 400;
        throw err;
      }

      cita.estado = estado;
      await cita.save();
      console.log("Estado de cita actualizado:", {
        id: cita.id,
        estado: cita.estado,
      });
      return cita;
    } catch (error) {
      console.error("Error al cambiar estado de la cita:", error);
      throw error;
    }
  }

  async marcarExamenesSubidos({ id_cita, id_usuario_que_confirma }) {
    const cita = await citas.findByPk(id_cita, {
      include: [
        {
          model: usuarios,
          as: "usuario",
          attributes: ["id", "nombre", "correo"],
        },
        {
          model: usuarios,
          as: "doctor",
          attributes: ["id", "nombre", "correo"],
        },
      ],
    });
    if (!cita) throw new Error("Cita no encontrada");
    if (parseInt(cita.id_usuario) !== parseInt(id_usuario_que_confirma)) {
      const err = new Error("No autorizado para marcar esta cita");
      err.status = 403;
      throw err;
    }
    if (cita.examenes_cargados) {
      return cita;
    }
    cita.examenes_cargados = true;
    await cita.save();

    try {
      if (cita.doctor?.correo) {
        await EnviarCorreo({
          receipients: cita.doctor.correo,
          subject: "Paciente ha subido exámenes",
          message: `
              <h2>Hola ${cita.doctor.nombre},</h2>
              <p>El paciente<br><strong>${
                cita.usuario?.nombre || "Paciente"
              }</strong><br>ha completado la carga de exámenes</p><br>
              <p>Puedes revisarlos ingresando al panel clínico.</p> <br>
              <p>Fecha cita: <strong>${cita.fecha}</strong></p>
            `,
        });
      }
    } catch (e) {
      console.error("Error enviando correo de exámenes cargados:", e);
    }

    try {
      if (global.io && cita.id_doctor) {
        await this.guardarYEmitirNotificacion(global.io, cita.id_doctor, {
          mensaje: `📄 El paciente \n ${cita.usuario?.nombre} subió sus exámenes`,
          fecha: new Date().toISOString(),
          tipo: "examenes",
          citaId: cita.id,
          paciente: cita.usuario?.nombre,
          leida: false,
          ruta: `/citas/${cita.id}`,
        });
      }
    } catch (e) {
      console.error("Error emitiendo notificación de exámenes:", e);
    }
    return cita;
  }

  async reagendarCita(id, usuario, nuevaFecha) {
    const cita = await citas.findByPk(id, {
      include: [
        {
          model: usuarios,
          as: "usuario",
          attributes: ["id", "nombre"],
        },
      ],
    });

    if (!cita) {
      const err = new Error("Cita no encontrada");
      err.status = 404;
      throw err;
    }

    if (usuario.rol !== "usuario" && usuario.rol !== "asistente") {
      const err = new Error("No autorizado para reagendar esta cita");
      err.status = 403;
      throw err;
    }

    if (
      usuario.rol === "usuario" &&
      parseInt(cita.id_usuario) !== parseInt(usuario.id)
    ) {
      const err = new Error(
        "No autorizado: la cita no pertenece a este usuario"
      );
      err.status = 403;
      throw err;
    }

    const m = moment.tz(nuevaFecha, "America/Bogota");
    if (m.day() === 0) {
      const err = new Error("No se pueden agendar citas los domingos");
      err.status = 400;
      throw err;
    }

    cita.fecha = m.toDate();
    await cita.save();

try {
  const doctorId = cita.id_doctor;
  const usuarioId = cita.id_usuario;
  const fechaLocal = moment
    .tz(cita.fecha, "America/Bogota")
    .format("DD/MM/YYYY HH:mm");

  if (doctorId && global.io) {
    const mensajeDoctor = `La cita del paciente #${cita.usuario?.nombre} fue reagendada para ${fechaLocal}.`;
    await this.guardarYEmitirNotificacion(global.io, doctorId, {
      citaId: cita.id,
      tipo: "cita_reagendada",
      mensaje: mensajeDoctor,
      fecha: new Date().toISOString(),
      ruta: `/citas/${cita.id}`,
    });
  }

  if (usuarioId && global.io) {
    const mensajeUsuario = `Tu cita con el doctor fue reagendada para ${fechaLocal}.`;
    // Enviar notificación específicamente al usuario/paciente
    await this.guardarYEmitirNotificacionUsuario(global.io, usuarioId, {
      citaId: cita.id,
      tipo: "cita_reagendada",
      mensaje: mensajeUsuario,
      fecha: new Date().toISOString(),
      ruta: `/citas/${cita.id}`,
    });
  }

} catch (e) {
  console.error("Error al notificar reagendo de cita:", e);
}


    return cita;
  }

  async consultarTodasLasCitasAsistente() {
    return await citas.findAll({
      include: [
        {
          model: usuarios,
          as: "usuario",
          attributes: ["nombre", "correo", "telefono"],
          required: true,
        },
        {
          model: usuarios,
          as: "doctor",
          attributes: ["nombre", "ocupacion"],
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
          model: examen,
          as: "examenes",
        },
      ],
      order: [["fecha", "ASC"]],
    });
  }

  async obtenerHistorialCompletoHastaFecha(id_usuario, fechaLimite) {
    const finDelDia = new Date(`${fechaLimite}T23:59:59`);
    return await citas.findAll({
      where: {
        id_usuario,
        fecha: { [Op.lte]: finDelDia },
      },
      include: [
        {
          model: usuarios,
          as: "usuario",
          attributes: ["nombre", "correo", "telefono", "genero"],
        },
        { model: usuarios, as: "doctor", attributes: ["nombre", "ocupacion"] },
        {
          model: ordenes,
          as: "orden",
          include: [
            {
              model: procedimientos,
              as: "procedimientos",
              attributes: ["nombre", "descripcion", "precio"],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: examen,
          as: "examenes",
          attributes: ["nombre_examen", "archivo_examen"],
        },
        {
          model: consentimiento,
          as: "consentimientos",
          attributes: ["fecha_firma", "ruta_pdf"],
        },
        {
          model: requerimientos,
          as: "requerimientos",
          attributes: ["descripcion", "estado", "fecha_inicio"],
        },
      ],
      order: [["fecha", "ASC"]],
    });
  }

  async generarYEnviarHistorialPDF(id_usuario, fechaLimite) {
    const historial = await this.obtenerHistorialCompletoHastaFecha(
      id_usuario,
      fechaLimite
    );
    if (!historial || historial.length === 0)
      throw new Error("No se encontraron registros para este usuario.");

    const usuario = historial[0]?.usuario;
    if (!usuario || !usuario.correo)
      throw new Error("El usuario no tiene correo registrado.");

    const doc = new PDFDocument({ margin: 40 });
    const bufferStream = new streamBuffers.WritableStreamBuffer({
      initialSize: 100 * 1024,
      incrementAmount: 10 * 1024,
    });
    doc.pipe(bufferStream);

    doc.fontSize(20).text("Historial Médico Completo", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Paciente: ${usuario.nombre}`);
    doc.text(`Correo: ${usuario.correo}`);
    doc.text(`Teléfono: ${usuario.telefono || "—"}`);
    doc.text(`Género: ${usuario.genero || "—"}`);
    doc.text(`Fecha de generación: ${new Date().toLocaleString("es-CO")}`);
    doc.moveDown(1);

    historial.forEach((cita, i) => {
      doc.fontSize(14).text(`Cita #${i + 1}`, { underline: true });
      doc.fontSize(11);
      const campos = {
        Fecha: cita.fecha ? new Date(cita.fecha).toLocaleString("es-CO") : null,
        Tipo: cita.tipo,
        Doctor: cita.doctor?.nombre,
        Procedimientos: cita.orden?.procedimientos
          ?.map((p) => p.nombre)
          .join(", "),
        "Exámenes requeridos": cita.examenes_requeridos,
        "Nota de evolución": cita.nota_evolucion,
        "Medicamentos recetados": cita.medicamentos_recetados,
        Observaciones: cita.observaciones,
        Origen: cita.origen,
      };
      Object.entries(campos).forEach(([k, v]) => {
        if (v && v.toString().trim() !== "") doc.text(`${k}: ${v}`);
      });
      doc.moveDown();
    });

    doc.end();

    await new Promise((resolve, reject) => {
      bufferStream.once("finish", resolve);
      bufferStream.once("error", reject);
    });
    const pdfBuffer = bufferStream.getContents();
    if (!pdfBuffer || pdfBuffer.length === 0)
      throw new Error("El PDF se generó vacío");
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "historiales_pdf",
          resource_type: "raw",
          type: "private", 
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          filename_override: `historial_${id_usuario}.pdf`,
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(pdfBuffer);
    });

    const publicId = uploadResult.public_id;
    const signedUrl = cloudinary.utils.private_download_url(publicId, "pdf", {
      resource_type: "raw",
      type: "private",
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });

    console.log("URL firmada para descarga (expira en 1h):", signedUrl);

    // 6) Enviar correo
      const backendHost = process.env.APP_URL || null;
      const downloadLink = backendHost
        ? `${backendHost.replace(/\/$/, "")}/apicitas/historial/download/${encodeURIComponent(publicId)}`
        : signedUrl;

      await EnviarCorreo({
        receipients: usuario.correo,
        subject: "Historial médico completo",
        message: `
        <h3>Hola ${usuario.nombre},</h3>
        <p>Adjuntamos tu historial médico completo hasta <b>${fechaLimite}</b>.</p>
        <p>También puedes descargarlo desde: <a href="${downloadLink}" target="_blank">Descargar historial PDF</a></p>
        <p>Gracias por confiar en <strong>Clinestetica</strong>.</p>
      `,
        attachments: [
          {
            filename: `historial_${id_usuario}_${Date.now()}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      return { mensaje: "Historial enviado correctamente", url: downloadLink, publicId };
  }
}

module.exports = new HistorialClinicoService();
