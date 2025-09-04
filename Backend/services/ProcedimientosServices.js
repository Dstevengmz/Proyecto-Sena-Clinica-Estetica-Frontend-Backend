const { procedimientos,usuarios } = require("../models");

class ProcedimientosService {

  async listarLosProcedimientos() {
    return await procedimientos.findAll(
      {
      include: {
        model: usuarios,
        as: 'usuario',
        attributes: ['nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento','genero','rol','ocupacion'] 
      }
    }
    );
  }

  async buscarLosProcedimientos(id) {
    return await procedimientos.findByPk(id, {
        include: {
          model: usuarios,
          as: 'usuario',
          attributes: ['nombre', 'correo', 'telefono', 'direccion', 'fecha_nacimiento','genero','rol','ocupacion']
        }
      });
  }

  async crearLosProcedimientos(data) {
    return await procedimientos.create(data);
  }

   async eliminarLosProcedimientos(id) {
    return await procedimientos.destroy({ where: { id } });
  }

  async actualizarLosProcedimientos(id, datos) {
    try {
        let actualizado = await procedimientos.update(datos, { where: { id } });
        return actualizado;
    } catch (e) {
        console.log("Error en el servidor al actualizar el Procedimiento:", e);
    }
}



}

module.exports = new ProcedimientosService();