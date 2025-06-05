const express = require("express");
const router = express.Router();
const ProcedimientoController = require("../controllers/ProcedimientoControllers");
const {authorization,verificarRol} = require("../middleware/Authorization");
const upload = require("../middleware/Multer");

router.get("/listarprocedimiento", ProcedimientoController.listarProcedimientos);
router.get("/buscarprocedimiento/:id", ProcedimientoController.buscarProcedimientos);
router.post("/crearprocedimiento",authorization,upload.single("imagen"),ProcedimientoController.crearProcedimientos);
router.patch("/editarprocedimiento/:id",authorization, ProcedimientoController.actualizarProcedimientos);
router.delete("/eliminarprocedimiento/:id",authorization, ProcedimientoController.eliminarProcedimientos);

module.exports = router;
