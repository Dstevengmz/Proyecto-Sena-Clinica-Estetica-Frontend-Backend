const express = require("express");
const router = express.Router();
const CategoriaController = require("../controllers/CategoriaProcedimientosControllers");
const { authorization, verificarRol } = require("../middleware/Authorization");
const PrimeraMayusculaCategoria = require("../middleware/PrimeraMayusculaCategoria");

router.get("/listarcategorias", CategoriaController.listarCategorias);
router.get("/buscarcategoria/:id", CategoriaController.buscarCategoria);
router.post("/crearcategoria",authorization,verificarRol(["doctor", "asistente"]),PrimeraMayusculaCategoria.middleware,CategoriaController.crearCategoria);
router.patch("/editarcategoria/:id",authorization,verificarRol(["doctor", "asistente"]),PrimeraMayusculaCategoria.middleware,CategoriaController.actualizarCategoria);
router.delete("/eliminarcategoria/:id", authorization, verificarRol(["doctor", "asistente"]), CategoriaController.eliminarCategoria);

module.exports = router;
