const Usuarios = require('./routers/UsuariosRouters');
const HistorialMedico = require('./routers/HistorialMedicoRouters');
const Citas = require('./routers/CitasRouters');
const Procedimientos = require('./routers/ProcedimientoRouters');
const Ordenes= require('./routers/OrdenesRouters');
const OrdenProcedimiento= require('./routers/OrdenProcedimientoRouters');
const Examenes = require('./routers/ExamenRouters');
const Carrito= require('./routers/CarritoRouters');
const CategoriaProcedimientos=require('./routers/CategoriaProcedimientosRouters')
const Consentimiento=require('./routers/ConsentimientoRouters');
const express = require('express');
const cors = require('cors');
const socketIO = require("socket.io");
const app = express();
const http = require("http");
const configurarSockets = require('./socket'); 
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });
global.io = io;
configurarSockets(io);

require('./config/redis'); 
require('dotenv').config();

const puerto = process.env.PORT || 2200;

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
app.use('/apicarrito',Carrito);
app.use('/apiexamenes', Examenes);
app.use('/apicategoriaprocedimientos',CategoriaProcedimientos);
app.use('/apiconsentimiento',Consentimiento);

server.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
