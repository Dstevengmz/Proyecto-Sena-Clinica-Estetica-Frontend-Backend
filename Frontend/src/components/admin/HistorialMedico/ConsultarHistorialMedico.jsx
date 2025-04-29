import React, { useState, useEffect } from "react";
import axios from "axios";
import {  createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const HistorialClinicoContext = createContext();
const useHistorialClinicoContext = () => useContext(HistorialClinicoContext);

function ConsultaHistorialMedico() {
  const [historialmedico, setHistorialmedico] = useState([]);
  const {selectedHistorialclinico, setSelectedHistorialclinico}  = useHistorialClinicoContext();
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Error", "No estás autenticado", "error");
      return;
    }
    axios
      .get("http://localhost:2100/apihistorialmedico/listarhistorialclinico", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setHistorialmedico(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar historialmedico:", error);
        alert("Error", "No se pudieron cargar los historialmedico", "error");
      });
  }, []);

  const selectUser = (historialmedico) => {
    setSelectedHistorialclinico(historialmedico);
    navigate("/DetallesHistorialMedico");
  };

  return (
    <HistorialClinicoContext.Provider value={{ selectedHistorialclinico, setSelectedHistorialclinico }}>
    <div className="card-header">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Historial de Pacientes</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/dashboard">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Historial de Pacientes
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <div className="card-body">
        <table id="example1" className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Correo Electronico</th>
              <th>Rol</th>
              <th>Genero</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {historialmedico.map((historialmedico) => (
              <tr key={historialmedico.id}>
                <td>{historialmedico.id}</td>
                <td>{historialmedico.usuario.nombre}</td>
                <td>{historialmedico.usuario.correo}</td>
                <td>{historialmedico.usuario.rol}</td>
                <td>{historialmedico.usuario.genero}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center align-items-center gap-4">
                    <a onClick={() => selectUser(historialmedico)}
                      className="btn btn-sm btn-info mx-1"
                      role="button"
                      title="Ver detalles">
                      <i className="fas fa-eye"></i>
                    </a>
                    <a
                      className="btn btn-sm btn-primary mx-1"

                      role="button"
                      title="Editar">
                      <i className="fas fa-pen-square"></i>
                    </a>
                    <a
                      className="btn btn-sm btn-danger mx-1"
                      role="button"
                      title="Eliminar">
                      <i className="fas fa-trash"></i>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Correo Electronico</th>
              <th>Rol</th>
              <th>Genero</th>
              <th>Opciones</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    </HistorialClinicoContext.Provider>
  );
}
export default ConsultaHistorialMedico;
