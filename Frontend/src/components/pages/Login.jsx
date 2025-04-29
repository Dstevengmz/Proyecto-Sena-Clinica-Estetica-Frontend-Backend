import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
function Login() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    correo: "",
    contrasena: "",
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post(
        `${API_URL}/apiusuarios/iniciarsesion`,
        formulario
      );
      console.log("Respuesta del servidor:", respuesta.data);
      const { token } = respuesta.data;
      if (token) {
        localStorage.setItem("token", token);
        alert("Inicio de sesión exitoso");
        navigate("/dashboard");
      } else {
        alert("Token no recibido. Redirigiendo a página de error.");
        navigate("/");
      }
    } catch (error) {
      console.log("Error con las credenciales", error);
      console.error("Error al iniciar sesión:");
      alert("Correo o Contraseña incorrectos");
    }
  };
  return (
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <a href="/" className="h1">
            <b>Clinica</b>Estetica
          </a>
        </div>
        <div className="card-body">
          <p className="login-box-msg">Inicia sesión para comenzar</p>
          <form onSubmit={manejarEnvio}>
            <div className="input-group mb-3">
              <input
                type="email"
                placeholder="Correo Electrónico"
                name="correo"
                className="form-control"
                value={formulario.correo}
                onChange={manejarCambio}
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-envelope" />
                </div>
              </div>
            </div>
            <div className="input-group mb-3">
              <input
                type="password"
                placeholder="Contraseña"
                name="contrasena"
                className="form-control"
                value={formulario.contrasena}
                onChange={manejarCambio}
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-lock" />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
                <div className="icheck-primary">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember Me</label>
                </div>
              </div>
              <div className="col-4">
                <button type="submit" className="btn btn-primary btn-block">
                  Ingresar
                </button>
              </div>
            </div>
          </form>
          <div className="social-auth-links text-center mt-2 mb-3">
            <a href="#" className="btn btn-block btn-primary">
              <i className="fab fa-facebook mr-2" /> Sign in using Facebook
            </a>
            <a href="#" className="btn btn-block btn-danger">
              <i className="fab fa-google-plus mr-2" /> Sign in using Google+
            </a>
          </div>
          <p className="mb-1">
            <a href="forgot-password.html">Recuperar Contraseña</a>
          </p>
          <p className="mb-0">
            <a href="/registrar" className="text-center">
              Registrarse
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login;
