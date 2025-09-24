const express = require("express");
const router = express.Router();
const ProcedimientoController = require("../controllers/ProcedimientoControllers");
const { authorization, verificarRol } = require("../middleware/Authorization");
const upload = require("../middleware/Multer");
const PrimeraMayusculaProcedimiento = require("../middleware/PrimerMayusculaProcedimientos");

router.get(
  "/listarprocedimiento",
  ProcedimientoController.listarProcedimientos
);
router.get(
  "/categorias/:categoriaId/procedimientos",
  ProcedimientoController.listarProcedimientosPorCategoria
);
router.get(
  "/buscarprocedimiento/:id",
  ProcedimientoController.buscarProcedimientos
);
router.post(
  "/crearprocedimiento",
  authorization,
  upload.fields([
    { name: "imagen", maxCount: 1 },
    { name: "imagenes", maxCount: 10 },
  ]),
  PrimeraMayusculaProcedimiento.middleware,
  ProcedimientoController.crearProcedimientos
);
router.patch(
  "/editarprocedimiento/:id",
  authorization,
  upload.fields([
    { name: "imagen", maxCount: 1 },
    { name: "imagenes", maxCount: 10 },
  ]),
  PrimeraMayusculaProcedimiento.middleware,
  ProcedimientoController.actualizarProcedimientos
);
router.delete(
  "/eliminarprocedimiento/:id",
  authorization,
  ProcedimientoController.eliminarProcedimientos
);

module.exports = router;
