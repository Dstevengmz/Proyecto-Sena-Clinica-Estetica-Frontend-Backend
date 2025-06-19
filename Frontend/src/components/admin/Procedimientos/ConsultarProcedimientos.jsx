import React, { useState, useEffect } from "react";
import axios from "axios";
import {  createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const ProcedimientoContext = createContext();
const useProcedimientoContext = () => useContext(ProcedimientoContext);

function ConsultarProcedimientos() {
  
  const [procedimientos, setProcedimientos] = useState([]);
  const {selectedProcedimiento, setSelectedProcedimiento}  = useProcedimientoContext();
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Error", "No estás autenticado", "error");
      return;
    }
    axios
      .get("http://localhost:2100/apiprocedimientos/listarprocedimiento", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Respuesta del backend:", response.data); 
        setProcedimientos(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar procedimientos:", error);
        alert("Error", "No se pudieron cargar los procedimientos", "error");
      });
  }, []);

  const selectUser = (procedimiento) => {
    setSelectedProcedimiento(procedimiento);
    navigate("/detallesprocedimiento");
  };

  return (
    <ProcedimientoContext.Provider value={{ selectedProcedimiento, setSelectedProcedimiento }}>
    <div className="card-header">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Procedimientos registrados</h1>
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
              <th>Nombre</th>
              <th>Precio</th>
              <th>Categoria</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {procedimientos.map((procedimientos) => (
              <tr key={procedimientos.id}>
                <td>{procedimientos.id}</td>
                <td>{procedimientos.nombre}</td>
                <td>{procedimientos.precio}</td>
                <td>{procedimientos.categoria}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center align-items-center gap-4">
                    <a onClick={() => selectUser(procedimientos)}
                      className="btn btn-sm btn-info mx-1"
                      role="button"
                      title="Ver detalles">
                      <i className="fas fa-eye"></i>
                    </a>
                    <a
                      onClick={() => navigate(`/editarprocedimientos/${procedimientos.id}`)}
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
              <th>Nombre</th>
              <th>Precio</th>
              <th>Categoria</th>
              <th>Opciones</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    </ProcedimientoContext.Provider>
  );
}
export default ConsultarProcedimientos;
