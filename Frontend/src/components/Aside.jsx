import CerrarSesion from "./pages/CerrarSesion";
import { usePerfilUsuario } from "../hooks/usePerfilUsuario";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
function Aside() {
  const navigate = useNavigate();
  const { usuario, rol } = usePerfilUsuario();
  
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
      <Link to="/dashboard" className="brand-link">
        <img
          src="dist/img/AdminLTELogo.png"
          alt="AdminLTE Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: ".8" }}
        />
        <span className="brand-text font-weight-light">Rejuvenezk</span>
      </Link>
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
            <Link href="/dashboard" className="d-block">
              {usuario?.nombre || "Cargando..."}
            </Link>
          </div>
        </div>
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            <Link to="/dashboard" className="nav-item menu-open nav-link ">
              <i className="nav-icon fas fa-tachometer-alt" />
              <p>Dashboard</p>
            </Link>

            <li className="nav-item">
              <a
                href="#"
                className="nav-link"
                onClick={(e) => e.preventDefault()}
              >
                <i className="nav-icon fas fa-copy" />
                <p>
                  Historial Clínico
                  <i className="fas fa-angle-left right" />
                </p>
              </a>

              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/registrarhistorialmedico" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Crear</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/consultarhistorialmedico" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Consultar</p>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <a
                href="#"
                className="nav-link"
                onClick={(e) => e.preventDefault()}
              >
                <i className="nav-icon fas fa-chart-pie" />
                <p>
                  Registro Citas
                  <i className="right fas fa-angle-left" />
                </p>
              </a>

              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/registrarcitas" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Registrar</p>
                  </Link>
                </li>
                {(rol === "doctor" || rol === "asistente") && (
                  <li id="rFe3" className="nav-item">
                    <Link to="/consultarcitas" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Consultar Citas</p>
                    </Link>
                  </li>
                )}
              </ul>
            </li>
            {(rol === "doctor" || rol === "asistente") && (
              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="nav-icon fas fa-chart-pie" />
                  <p>
                    Procedimientos
                    <i className="right fas fa-angle-left" />
                  </p>
                </a>
                <ul className="nav nav-treeview">
                  <li className="nav-item">
                    <Link to="/registrarprocedimientos" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Crear</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/consultarprocedimientos" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Consultar</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="pages/UI/buttons.html" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Buttons</p>
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            <li className="nav-item">
              <a
                href="#"
                className="nav-link"
                onClick={(e) => e.preventDefault()}
              >
                <i className="nav-icon fas fa-edit" />
                <p>
                  Opciones
                  <i className="fas fa-angle-left right" />
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <a
                    href="#"
                    className="nav-link"
                    onClick={manejarCerrarSesion}
                  >
                    <i className="nav-icon fas fa-th" />
                    <p>
                      Cerrar Sesión
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
export default Aside;
