const { categoriaprocedimientos, procedimientos } = require("../models");
const { Op, fn, col, where } = require("sequelize");

function normalizeNombre(nombre) {
  if (typeof nombre !== "string") return "";
  return nombre.trim().toLowerCase();
}

class CategoriaProcedimientosService {
  async listarLasCategorias() {
    try {
      return await categoriaprocedimientos.findAll({
        include: [
          {
            model: procedimientos,
            as: "procedimientos",
            attributes: ["id", "nombre", "precio"],
          },
        ],
        order: [["id", "ASC"]],
      });
    } catch (e) {
      console.error("Error al listar categorías:", e);
      throw e;
    }
  }

  async buscarLaCategoria(id) {
    try {
      return await categoriaprocedimientos.findByPk(id, {
        include: [
          {
            model: procedimientos,
            as: "procedimientos",
            attributes: ["id", "nombre", "precio"],
          },
        ],
      });
    } catch (e) {
      console.error("Error al buscar categoría por id:", e);
      throw e;
    }
  }

  async crearLaCategoria(data) {
    try {
      const nombreNorm = normalizeNombre(data.nombre);
      if (!nombreNorm) {
        const err = new Error("El nombre de la categoría es requerido");
        err.status = 400;
        throw err;
      }

      const existente = await categoriaprocedimientos.findOne({
        where: where(
          fn("LOWER", fn("TRIM", col("nombre"))),
          normalizeNombre(data.nombre)
        ),
      });
      if (existente) {
        const err = new Error("Ya existe una categoría con ese nombre");
        err.status = 409;
        throw err;
      }

      const payload = { ...data, nombre: data.nombre.trim() };
      return await categoriaprocedimientos.create(payload);
    } catch (e) {
      console.error("Error al crear categoría:", e);
      throw e;
    }
  }

  async actualizarLaCategoria(id, datos) {
    try {
      if (datos && typeof datos.nombre === "string") {
        const nombreNorm = normalizeNombre(datos.nombre);
        if (!nombreNorm) {
          const err = new Error("El nombre de la categoría es requerido");
          err.status = 400;
          throw err;
        }
        const duplicada = await categoriaprocedimientos.findOne({
          where: {
            [Op.and]: [
              where(fn("LOWER", fn("TRIM", col("nombre"))), nombreNorm),
              { id: { [Op.ne]: id } },
            ],
          },
        });
        if (duplicada) {
          const err = new Error("Ya existe una categoría con ese nombre");
          err.status = 409;
          throw err;
        }
        datos.nombre = datos.nombre.trim();
      }
      const actualizado = await categoriaprocedimientos.update(datos, {
        where: { id },
      });
      return actualizado;
    } catch (e) {
      console.error("Error en el servidor al actualizar la categoría:", e);
      throw e;
    }
  }

  async eliminarLaCategoria(id) {
    try {
      return await categoriaprocedimientos.destroy({ where: { id } });
    } catch (e) {
      console.error("Error al eliminar categoría:", e);
      throw e;
    }
  }
}

// Export compatible with both default instance import and named destructuring in tests
const instance = new CategoriaProcedimientosService();
// Attach helpers on the instance so require() can be used as either default or with named props
instance.normalizeNombre = normalizeNombre;
instance.service = instance;

module.exports = instance;
