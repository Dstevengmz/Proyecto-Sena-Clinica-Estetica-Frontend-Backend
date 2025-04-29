import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import React from 'react'
import Registrar from './pages/Registrar'
import Inicio from './pages/Inicio'
import Layout from './base'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import HistorialMedico from './pages/HistorialMedico/RegistrarHistorialMedico'

function Menu() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/iniciarsesion" element={<Layout><Login /></Layout>} />
        <Route path="/registro" element={<Layout><Registrar /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/historialmedico" element={<Layout><HistorialMedico /></Layout>} />
      </Routes>
    </Router>
  )
}

export default Menu
