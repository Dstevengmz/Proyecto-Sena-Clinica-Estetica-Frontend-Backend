const Usuarios = require('./routers/UsuariosRouters');
const HistorialMedico = require('./routers/HistorialMedicoRouters');
const Citas = require('./routers/CitasRouters');
const Procedimientos = require('./routers/ProcedimientoRouters');
const Ordenes= require('./routers/OrdenesRouters');
const OrdenProcedimiento= require('./routers/OrdenProcedimientoRouters');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const puerto = 2100;

app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  

app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use('/apiusuarios',Usuarios);
app.use('/apihistorialmedico',HistorialMedico);
app.use('/apicitas',Citas);
app.use('/apiprocedimientos',Procedimientos);
app.use('/apiordenes',Ordenes);
app.use('/apiordenprocedimiento',OrdenProcedimiento);

app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});