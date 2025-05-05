const { Citas,Usuarios  } = require("../models");
const { Op } = require("sequelize");
class HistorialClinicoService {

  async listarLasCitas() {
    return await Citas.findAll({
      include: [
        {
        model: Usuarios,
        as: 'usuario',
        attributes: ['nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento','genero','rol','ocupacion'] 
      },
      {
        model: Usuarios,
        as: 'doctor',
        attributes: ['nombre']
      }
    ]
    });
  }

  async buscarLasCitas(id) {
    return await Citas.findByPk(id, {
      include: [
        {
        model: Usuarios,
        as: 'usuario',
        attributes: ['nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento','genero','rol','ocupacion'] 
      },
      {
        model: Usuarios,
        as: 'doctor',
        attributes: ['nombre']
      }
    ]
    });
  }

  async crearLasCitas(data) {
    return await Citas.create(data);
  }

  async  eliminarLasCitas(id) {
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
        [Op.between]: [inicioDelDia, finDelDia]
      }
    },
    include: {
      model: Usuarios,
      as: 'usuario',
      attributes: ['nombre']
    },
    order: [['fecha', 'ASC']]
  });
}

}

module.exports = new HistorialClinicoService();