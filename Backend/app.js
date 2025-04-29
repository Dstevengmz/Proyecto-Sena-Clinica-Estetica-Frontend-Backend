const Usuarios = require('./routers/UsuariosRouters');
const HistorialMedico = require('./routers/HistorialMedicoRouters');
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


app.use('/apiusuarios',Usuarios);
app.use('/apihistorialmedico',HistorialMedico);

app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});