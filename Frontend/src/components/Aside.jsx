import React from "react";
import CerrarSesion from "./pages/CerrarSesion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
export default function Aside() {
  const navigate = useNavigate();
  const manejarCerrarSesion = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "¿Estás seguro de Cerrar Sesión?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Session Cerrada Correctamente",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          CerrarSesion(navigate);
        });
      }
    });
  };
  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <a href="/dashboard" className="brand-link">
        <img
          src="dist/img/AdminLTELogo.png"
          alt="AdminLTE Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: ".8" }}
        />
        <span className="brand-text font-weight-light">Rejuvenezk</span>
      </a>
      <div className="sidebar">
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <img
              src="dist/img/user2-160x160.jpg"
              className="img-circle elevation-2"
              alt="User Image"
            />
          </div>
          <div className="info">
            <a href="#" className="d-block">
              Alexander Pierce
            </a>
          </div>
        </div>
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            <li className="nav-item menu-open">
              <a href="/dashboard" className="nav-link active">
                <i className="nav-icon fas fa-tachometer-alt" />
                <p>Dashboard</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="" className="nav-link">
                <i className="nav-icon fas fa-copy" />
                <p>
                  HistorialClinico
                  <i className="fas fa-angle-left right" />
                  <span className="badge badge-info right"></span>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <a href="/registrarhistorialmedico" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Crear</p>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/consultarhistorialmedico" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Consultar</p>
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="" className="nav-link">
                <i className="nav-icon fas fa-chart-pie" />
                <p>
                  Registro Citas
                  <i className="right fas fa-angle-left" />
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <a href="/registrarcitas" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Registrar</p>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/consultarcitas" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Consultar Citas</p>
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-tree" />
                <p>
                  Procedimientos
                  <i className="fas fa-angle-left right" />
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <a href="/registrarprocedimientos" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Crear</p>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/consultarprocedimientos" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Consultar</p>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="pages/UI/buttons.html" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Buttons</p>
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-edit" />
                <p>
                  Opciones
                  <i className="fas fa-angle-left right" />
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <a href="" className="nav-link" onClick={manejarCerrarSesion}>
                    <i className="nav-icon fas fa-th" />
                    <p>
                      CerrarSesion
                      <span className="right badge badge-danger"></span>
                    </p>
                  </a>
                </li>
              </ul>
            </li>

            {/* <li className="nav-header">MISCELLANEOUS</li> */}
          </ul>
        </nav>
        {/* /.sidebar-menu */}
      </div>
      {/* /.sidebar */}
    </aside>
  );
}
