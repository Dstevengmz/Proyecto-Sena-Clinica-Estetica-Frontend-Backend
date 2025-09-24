const procedimientosServices = require("../services/ProcedimientosServices");
const { procedimientoimagenes, procedimientos } = require("../models");
const { Op } = require("sequelize");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

function getCloudinaryPublicIdFromUrl(url) {
  try {
    if (!url) return null;

    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathWithVersion = parts[1]; 
    const pathParts = pathWithVersion.split("/");

    const first = pathParts[0];
    let remainderParts = pathParts;
    if (first && first.startsWith("v") && !first.includes(".")) {
      remainderParts = pathParts.slice(1);
    }
    const remainder = remainderParts.join("/"); 
    const lastDot = remainder.lastIndexOf(".");
    const withoutExt = lastDot > -1 ? remainder.substring(0, lastDot) : remainder;
    return withoutExt; 
  } catch (e) {
    return null;
  }
}

class ProcedimientosController {

  async listarProcedimientos(req, res) {
    try {
      const { categoriaId } = req.query;
      if (categoriaId) {
        const lista = await procedimientosServices.listarLosProcedimientosPorCategoria(parseInt(categoriaId));
        return res.json(lista);
      }
      const procedimiento = await procedimientosServices.listarLosProcedimientos();
      res.json(procedimiento);
    } catch (error) {
      console.error("Error al listar Procedimientos:", error);
      res.status(500).json({ error: "Error en el servidor al listar procedimientos" });
    }
  }

  async buscarProcedimientos(req, res) {
    const procedimiento = await procedimientosServices.buscarLosProcedimientos(req.params.id);
    procedimiento
      ? res.json(procedimiento)
      : res.status(404).json({ error: "Procedimiento no encontrado" });
  }

async crearProcedimientos(req, res) {
  try {
    const datos = req.body;
    datos.requiere_evaluacion = datos.requiere_evaluacion === "true";
    datos.precio = parseFloat(datos.precio);
    datos.duracion = parseInt(datos.duracion);
    if (datos.categoriaId !== undefined) {
      datos.categoriaId = parseInt(datos.categoriaId);
    }

    const files = req.files || {};
    const imagenPrincipal = files?.imagen?.[0];
    const imagenesExtras = files?.imagenes || [];

    if (imagenPrincipal?.path) {
      datos.imagen = imagenPrincipal.path;
    }

    const nuevoProcedimiento = await procedimientosServices.crearLosProcedimientos(datos);

    const imagenesAGuardar = [];
    if (imagenPrincipal?.path) {
      imagenesAGuardar.push({
        url: imagenPrincipal.path,
        alt: datos.nombre || "",
        orden: 0,
        procedimientoId: nuevoProcedimiento.id,
      });
    }
    imagenesExtras.forEach((f, idx) => {
      if (f?.path) {
        imagenesAGuardar.push({
          url: f.path,
          alt: datos.nombre || "",
          orden: idx + 1,
          procedimientoId: nuevoProcedimiento.id,
        });
      }
    });
    if (imagenesAGuardar.length) {
      await procedimientoimagenes.bulkCreate(imagenesAGuardar);
    }

    res.status(201).json(nuevoProcedimiento);
  } catch (error) {
    console.error("Error al crear Procedimiento:", error);
    res.status(500).json({
      message: "Hubo un error al crear el Procedimiento",
      error: error.message,
    });
  }
}

  async actualizarProcedimientos(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const actual = await procedimientosServices.buscarLosProcedimientos(id);
      if (!actual) {
        return res.status(404).json({ error: "Procedimiento no encontrado" });
      }
      const datos = {
        ...req.body,
        requiere_evaluacion: req.body.requiere_evaluacion === "true",
        precio: parseFloat(req.body.precio),
        duracion: parseInt(req.body.duracion),
        imagen: actual.imagen,
      };
      if (datos.categoriaId !== undefined) {
        datos.categoriaId = parseInt(datos.categoriaId);
      }
      // Manejo de archivos
      const files = req.files || {};
      const imagenPrincipal = files?.imagen?.[0];
      const imagenesExtras = files?.imagenes || [];

      if (imagenPrincipal?.path) {
        datos.imagen = imagenPrincipal.path;
      }

      // Normalizar lista de imágenes a eliminar (pueden venir como ids o urls)
      let eliminar = req.body["imagenes_eliminar[]"] ?? req.body.imagenes_eliminar ?? [];
      if (!Array.isArray(eliminar)) eliminar = [eliminar];
      eliminar = eliminar.filter((v) => v !== undefined && v !== null && v !== "");
      const ids = eliminar
        .map((v) => Number(v))
        .filter((n) => !isNaN(n));
      const urls = eliminar.filter((v) => isNaN(Number(v)));

      const resultado = await procedimientosServices.actualizarLosProcedimientos(id, datos);
      if (!resultado[0]) {
        return res.status(400).json({ error: "No se pudo actualizar el procedimiento" });
      }

      // Agregar nuevas imágenes extras si llegaron
      const nuevasImagenes = [];
      if (imagenPrincipal?.path) {
        nuevasImagenes.push({ url: imagenPrincipal.path, alt: datos.nombre || "", orden: 0, procedimientoId: id });
      }
      imagenesExtras.forEach((f) => {
        if (f?.path) {
          nuevasImagenes.push({ url: f.path, alt: datos.nombre || "", orden: null, procedimientoId: id });
        }
      });
      if (nuevasImagenes.length) {
        await procedimientoimagenes.bulkCreate(nuevasImagenes);
      }

      // Si hay imágenes para eliminar
      if (ids.length || urls.length) {
        // Buscar registros por id para obtener URLs reales
        const registrosPorId = ids.length
          ? await procedimientoimagenes.findAll({
              where: { id: { [Op.in]: ids }, procedimientoId: id },
              attributes: ["id", "url"],
            })
          : [];
        const urlsDesdeIds = registrosPorId.map((r) => r.url).filter(Boolean);
        const allUrlsToDelete = Array.from(
          new Set([...(urlsDesdeIds || []), ...(urls || [])])
        );

        // Eliminar en Cloudinary
        await Promise.all(
          allUrlsToDelete.map(async (u) => {
            const publicId = getCloudinaryPublicIdFromUrl(u);
            if (publicId) {
              try {
                await cloudinary.uploader.destroy(publicId);
              } catch (e) {
                console.warn("No se pudo eliminar en Cloudinary:", publicId, e?.message);
              }
            }
          })
        );

        if (ids.length) {
          await procedimientoimagenes.destroy({
            where: { id: { [Op.in]: ids }, procedimientoId: id },
          });
        }
        if (urls.length) {
          await procedimientoimagenes.destroy({
            where: { url: { [Op.in]: urls }, procedimientoId: id },
          });
        }

        const principalEliminada = allUrlsToDelete.includes(actual.imagen);
        if (principalEliminada && !imagenPrincipal?.path) {
          await procedimientos.update({ imagen: null }, { where: { id } });
        }
      }
      res.json({ mensaje: "Procedimiento actualizado correctamente" });
    } catch (error) {
      console.error(" Error al actualizar Procedimiento:", error);
      res.status(500).json({
        error: "Error en el servidor al actualizar el Procedimiento",
        detalle: error.message,
      });
    }
  }

  async listarProcedimientosPorCategoria(req, res) {
    try {
      const id = parseInt(req.params.categoriaId);
      if (isNaN(id)) {
        return res.status(400).json({ error: "categoriaId inválido" });
      }
      const lista = await procedimientosServices.listarLosProcedimientosPorCategoria(id);
      res.json(lista);
    } catch (error) {
      console.error("Error al listar por categoría:", error);
      res.status(500).json({ error: "Error en el servidor al listar por categoría" });
    }
  }




  async eliminarProcedimientos(req, res) {
    await procedimientosServices.eliminarLosProcedimientos(req.params.id);
    res.json({ message: "Procedimiento eliminado" });
  }

}

module.exports = new ProcedimientosController();