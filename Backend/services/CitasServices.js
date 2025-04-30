const { Citas,Usuarios  } = require("../models");
class HistorialClinicoService {

  async listarLasCitas() {
    return await Citas.findAll({
      include: {
        model: Usuarios,
        as: 'usuario',
        attributes: ['nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento','genero','rol','ocupacion'] 
      }
    });
  }

  async buscarLasCitas(id) {
    return await Citas.findByPk(id, {
      include: {
        model: Usuarios,
        as: 'usuario',
        attributes: ['nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento','genero','rol','ocupacion']
      }
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
}

module.exports = new HistorialClinicoService();