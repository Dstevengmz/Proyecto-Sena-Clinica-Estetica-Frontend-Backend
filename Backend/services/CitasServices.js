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
class HistorialClinicoService {
  async listarLasCitas() {
    return await Citas.findAll({
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
        leida: false  
      });
      console.log("Notificación emitida correctamente");
    } catch (error) {
      console.error("Error al emitir notificación:", error);
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
}

module.exports = new HistorialClinicoService();
