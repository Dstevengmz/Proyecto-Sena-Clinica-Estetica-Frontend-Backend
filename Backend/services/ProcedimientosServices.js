const { Procedimientos,Usuarios } = require("../models");

class ProcedimientosService {

  async listarLosProcedimientos() {
    return await Procedimientos.findAll(
      {
      include: {
        model: Usuarios,
        as: 'usuario',
        attributes: ['nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento','genero','rol','ocupacion'] 
      }
    }
    );
  }

  async buscarLosProcedimientos(id) {
    return await Procedimientos.findByPk(id, {
        include: {
          model: Usuarios,
          as: 'usuario',
          attributes: ['nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento','genero','rol','ocupacion']
        }
      });
  }

  async crearLosProcedimientos(data) {
    return await Procedimientos.create(data);
  }

   async eliminarLosProcedimientos(id) {
    return await Procedimientos.destroy({ where: { id } });
  }

  async actualizarLosProcedimientos(id, datos) {
    try {
        let actualizado = await Procedimientos.update(datos, { where: { id } });
        return actualizado;
    } catch (e) {
        console.log("Error en el servidor al actualizar el Procedimiento:", e);
    }
}



}

module.exports = new ProcedimientosService();