import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import PublicLayout from "./components/layouts/PublicLayout";
import AdminLayout from "./components/layouts/AdminLayout";

import Inicio from "./components/pages/Inicio";
import Reservar from "./components/pages/Reservar";
import Dashboard from "./components/admin/Dashboard";

import HistorialMedico from "./components/admin/HistorialMedico/RegistrarHistorialMedico";
import ConsultarHistorialMedico from "./components/admin/HistorialMedico/ConsultarHistorialMedico";
import DetallesHistorialMedico from "./components/admin/HistorialMedico/DetallesHistorialMedico";
import EditarHistorialClinico from "./components/admin/HistorialMedico/EditarHistorialMedico";
import { HistorialClinicoContext } from "./components/admin/HistorialMedico/ConsultarHistorialMedico";
import { CitasContext } from "./components/admin/Citas/Consultarcitas";
//Rutas de Citas

import RegistrarCitas from "./components/admin/Citas/RegistrarCitas";
import ConsultarCitas from "./components/admin/Citas/Consultarcitas";
import DetallesCitas from "./components/admin/Citas/DetallesCitas";
import EditarCitas from "./components/admin/Citas/EditarCitas";

// Rutas de Procedimientos
import RegistrarProcedimientos from "./components/admin/Procedimientos/RegistrarProcedimientos";
import ConsultarProcedimientos from "./components/admin/Procedimientos/ConsultarProcedimientos";
import { ProcedimientoContext } from "./components/admin/Procedimientos/ConsultarProcedimientos";
import DetallesProcedimiento from "./components/admin/Procedimientos/DetallesProcedimiento";

import Servicios from "./components/pages/Servicios";
import Control from "./Control";
import Login from "./components/pages/Login";
import Registrar from "./components/pages/Registrar";
import CerrarSesion from "./components/pages/CerrarSesion";
import EditarProcedimientos from "./components/admin/Procedimientos/EditarProcedimientos";

function RutaProtegida({ children }) {
  const autenticacionValida = localStorage.getItem("token");
  return autenticacionValida ? children : <Navigate to="/iniciarsesion" />;
}

function App() {
  const [selectedHistorialclinico, setSelectedHistorialclinico] =
    useState(null);
  const [selectedCitas, setSelectedCitas] = useState(null);
  const [selectedProcedimiento, setSelectedProcedimiento] = useState(null);

  return (
    <HistorialClinicoContext.Provider
      value={{ selectedHistorialclinico, setSelectedHistorialclinico }}
    >
      <CitasContext.Provider value={{ selectedCitas, setSelectedCitas }}>
        <ProcedimientoContext.Provider
          value={{ selectedProcedimiento, setSelectedProcedimiento }}
        >
          <Router>
            <Control />
            <Routes>
              {/* Publicos */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Inicio />} />
                <Route path="/servicios" element={<Servicios />} />
                <Route path="/reservar/:id" element={<Reservar />} />
              </Route>
              {/* Administradores */}
              <Route element={<AdminLayout />}>
                <Route
                  path="/dashboard"
                  element={
                    <RutaProtegida>
                      <Dashboard />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/registrarhistorialmedico"
                  element={
                    <RutaProtegida>
                      <HistorialMedico />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/consultarhistorialmedico"
                  element={
                    <RutaProtegida>
                      <ConsultarHistorialMedico />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/DetallesHistorialMedico"
                  element={
                    <RutaProtegida>
                      <DetallesHistorialMedico />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/editarhistoriaclinico/:id"
                  element={
                    <RutaProtegida>
                      <EditarHistorialClinico />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/registrarcitas"
                  element={
                    <RutaProtegida>
                      <RegistrarCitas />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/consultarcitas"
                  element={
                    <RutaProtegida>
                      <ConsultarCitas />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/detallescitas"
                  element={
                    <RutaProtegida>
                      <DetallesCitas />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/detallescitas/:id"
                  element={
                    <RutaProtegida>
                      <EditarCitas />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/registrarprocedimientos"
                  element={
                    <RutaProtegida>
                      <RegistrarProcedimientos />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/consultarprocedimientos"
                  element={
                    <RutaProtegida>
                      <ConsultarProcedimientos />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/editarprocedimientos/:id"
                  element={
                    <RutaProtegida>
                      <EditarProcedimientos />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/detallesprocedimiento"
                  element={
                    <RutaProtegida>
                      <DetallesProcedimiento />
                    </RutaProtegida>
                  }
                />
              </Route>
              {/* Principales */}
              <Route path="/iniciarsesion" element={<Login />} />
              <Route path="/registrar" element={<Registrar />} />
              <Route
                path="/cerrarsesion"
                element={
                  <RutaProtegida>
                    <CerrarSesion />
                  </RutaProtegida>
                }
              />
            </Routes>
          </Router>
        </ProcedimientoContext.Provider>
      </CitasContext.Provider>
    </HistorialClinicoContext.Provider>
  );
}

export default App;
