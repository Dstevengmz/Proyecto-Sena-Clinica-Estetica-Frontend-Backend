import React from "react";
import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">
          Mi Clínica
        </a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a className="nav-link" href="/servicios">
                Servicios
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/contacto">
                Contacto
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/iniciarsesion">
                IniciarSesion
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mt-4">
        <Outlet />
      </div>

      <footer className="bg-light text-center py-3">
        © 2025 Mi Clínica Estética
      </footer>
    </>
  );
}

export default PublicLayout;
