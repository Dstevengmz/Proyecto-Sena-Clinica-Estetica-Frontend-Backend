import { useNavigate } from "react-router-dom";
import axios from "axios";
// import jwt_decode from "jwt-decode";
import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect } from "react";
import {  createContext, useContext } from "react";
export const CitasContext = createContext();
const useCitasContext = () => useContext(CitasContext);


function Consultarcitas() {

  const [citas, setCitas] = useState([]);
  const {selectedCitas, setSelectedCitas}  = useCitasContext();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let rol = null;
    if (token) {
      try {
        const usuario = jwtDecode(token);
        // const usuario = jwt_decode(token);
        rol = usuario.rol;
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        rol = null;
      }
    }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Error", "No estás autenticado", "error");
      return;
    }
    axios
      .get("http://localhost:2100/apicitas/listarcitas", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Respuesta del backend:", response.data);
        setCitas(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar las citas:", error);
        alert("Error", "No se pudieron cargar las citas", "error");
      });
  }, []);

  const selectCitas = (citas) => {
    setSelectedCitas(citas);
    navigate("/detallesCitas");
  };


  return (
    <CitasContext.Provider value={{ selectedCitas, setSelectedCitas }}>
    <div>
      <h1>Consultar Citas</h1>
      <div className="card-header">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Citas de pacientes</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="/dashboard">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Citas de pacientes</li>
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
                <th>Nombre Usuario</th>
                <th>Nombre Doctor</th>
                <th>Fecha</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((citas) => (
                <tr key={citas.id}>
                  <td>{citas.id}</td>
                  <td>{citas.usuario.nombre}</td>
                  <td>{citas.doctor.nombre}</td>
                  <td>{citas.fecha}</td>
                  <td className="text-center">
                  <div className="d-flex justify-content-center align-items-center gap-4">
                    <a onClick={() => selectCitas(citas)}
                      className="btn btn-sm btn-info mx-1"
                      role="button"
                      title="Ver detalles">
                      <i className="fas fa-eye"></i>
                    </a>
                      {(rol === "doctor" || rol === "asistente") && (
                    <a
                      onClick={() => navigate(`/detallescitas/${citas.id}`)}
                      className="btn btn-sm btn-primary mx-1"
                      role="button"
                      title="Editar">
                      <i className="fas fa-pen-square"></i>
                    </a>
                    )}
                      {rol === "asistente" && (
                    <a
                      className="btn btn-sm btn-danger mx-1"
                      role="button"
                      title="Eliminar">
                      <i className="fas fa-trash"></i>
                    </a>
                    )}
                  </div>
                </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>ID</th>
                <th>Nombre Usuario</th>
                <th>Nombre Doctor</th>
                <th>Fecha</th>
                <th>Opciones</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
    </CitasContext.Provider>
  );
}
export default Consultarcitas;
