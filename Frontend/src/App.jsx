import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {useState } from "react";

import PublicLayout from './components/layouts/PublicLayout'
import AdminLayout from './components/layouts/AdminLayout'

import Inicio from './components/pages/Inicio'
import Reservar from './components/pages/Reservar'

import Dashboard from './components/admin/Dashboard'
import HistorialMedico from './components/admin/HistorialMedico/RegistrarHistorialMedico'
import ConsultarHistorialMedico from './components/admin/HistorialMedico/ConsultarHistorialMedico'
import DetallesHistorialMedico from './components/admin/HistorialMedico/DetallesHistorialMedico'
import EditarHistorialClinico from './components/admin/HistorialMedico/EditarHistorialMedico'
import { HistorialClinicoContext } from "./components/admin/HistorialMedico/ConsultarHistorialMedico";
import { CitasContext } from "./components/admin/Citas/Consultarcitas";

import RegistrarCitas from './components/admin/Citas/RegistrarCitas'
import ConsultarCitas from './components/admin/Citas/Consultarcitas'
import DetallesCitas from './components/admin/Citas/DetallesCitas'


import Servicios from './components/pages/Servicios'
import Control from './Control'


import Login from './components/pages/Login'
import Registrar from './components/pages/Registrar'
import CerrarSesion from "./components/pages/CerrarSesion";


function App() {
  const [selectedHistorialclinico, setSelectedHistorialclinico] = useState(null);
  const [selectedCitas, setSelectedCitas] = useState(null);
  return (
    <HistorialClinicoContext.Provider value={{ selectedHistorialclinico, setSelectedHistorialclinico }}>
      <CitasContext.Provider value={{ selectedCitas, setSelectedCitas }}>
      <Router>
        <Control />
        <Routes>
          {/* Publicos */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/reservar" element={<Reservar />} />
          </Route>

          {/* Administradores */}
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/registrarhistorialmedico" element={<HistorialMedico />}/>
            <Route path="/consultarhistorialmedico" element={<ConsultarHistorialMedico />}/>
            <Route path="/DetallesHistorialMedico" element={<DetallesHistorialMedico />}/>
            <Route path="/editarhistoriaclinico/:id" element={<EditarHistorialClinico />}/>
            <Route path="/registrarcitas" element={<RegistrarCitas />} />
            <Route path="/consultarcitas" element={<ConsultarCitas />} />
            <Route path="/detallesCitas" element={<DetallesCitas />} />
          </Route>

          {/* Principales */}
          <Route path="/iniciarsesion" element={<Login />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route path="/cerrarsesion" element={<CerrarSesion />} />
        </Routes>
      </Router>
    </CitasContext.Provider>
    </HistorialClinicoContext.Provider>
  );
}

export default App
