const express = require("express");
const router = express.Router();
const ProcedimientoController = require("../controllers/ProcedimientoControllers");
const Seguridad = require("../middleware/Authorization");
const upload = require("../middleware/Multer");

router.get("/listarprocedimiento", ProcedimientoController.listarProcedimientos);
router.get("/buscarprocedimiento/:id", ProcedimientoController.buscarProcedimientos);
router.post("/crearprocedimiento",Seguridad,upload.single("imagen"),ProcedimientoController.crearProcedimientos);
router.patch("/editarprocedimiento/:id",Seguridad, ProcedimientoController.actualizarProcedimientos);
router.delete("/eliminarprocedimiento/:id",Seguridad, ProcedimientoController.eliminarProcedimientos);

module.exports = router;
