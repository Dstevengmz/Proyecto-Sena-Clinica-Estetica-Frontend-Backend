import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function Registrar() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipodocumento, setTipodocumento] = useState("");
  const [numerodocumento, setNumerodocumento] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [rol, setRol] = useState("");
  const [genero, setGenero] = useState("");



   const mostrarErrores = (errores) => {
    const lista = errores.map((e) => `<li>${e}</li>`).join("");
    Swal.fire({
      icon: "error",
      title: "Error al registrar el usuario Complete todos los campos",
      html: `<ul style="text-align:left;">${lista}</ul>`,
      confirmButtonText: "Entendido",
    });
  };
   const validarFormulario = () => {
    const errores = [];

    if (!nombre.trim()) errores.push("El nombre es obligatorio");
    else {
      if (nombre.trim().length < 5) errores.push("El nombre debe tener al menos 5 caracteres");
      if (/\d/.test(nombre)) errores.push("El nombre no debe contener números");
    }

    if (!tipodocumento) errores.push("Debe seleccionar un tipo de documento");
    if (!numerodocumento.trim()) errores.push("El número de documento es obligatorio");
    else if (numerodocumento.trim().length < 5) errores.push("El número de documento debe tener al menos 5 caracteres");

    if (!correo.trim()) errores.push("El correo electrónico es obligatorio");
    else if (!/\S+@\S+\.\S+/.test(correo)) errores.push("El correo electrónico no es válido");

    if (!contrasena.trim()) errores.push("La contraseña es obligatoria");
    else if (contrasena.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres");

    if (contrasena !== confirmar) errores.push("Las contraseñas no coinciden");

    if (!rol) errores.push("Debe seleccionar un rol");
    if (!phone.trim()) errores.push("El número de teléfono es obligatorio");
    else if (!/^\+?[0-9\s]+$/.test(phone)) errores.push("El número de teléfono no es válido");

    if (!genero) errores.push("Debe seleccionar un género");

    return errores;
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    const errores = validarFormulario();
      if (errores.length > 0) {
      mostrarErrores(errores);
      return;
    }

 try {
      await axios.post(`${API_URL}/apiusuarios/crearusuarios`, {
        nombre,
        tipodocumento,
        numerodocumento,
        correo,
        contrasena,
        rol,
        telefono: phone,
        genero,
      });

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Tu cuenta ha sido creada correctamente",
        confirmButtonText: "Iniciar sesión",
      }).then(() => navigate("/iniciarsesion"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar el usuario. Intenta más tarde.",
      });
    }
  };

  return (
    <div className="register-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <a href="" className="h1">
            <b>Registrarse</b>
          </a>
        </div>
        <div className="card-body">
          <p className="login-box-msg">Registrar nuevo Usuario</p>
          <form
            onSubmit={enviarFormulario}
            className="needs-validation"
            noValidate
          >
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                required
                placeholder="Nombre Completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-user" />
                </div>
              </div>
            </div>

            <div className="input-group mb-3">
              <select
                className="form-control"
                value={tipodocumento}
                onChange={(e) => setTipodocumento(e.target.value)}
                required>
                <option value="" disabled>
                  Seleccione Tipo de Documento
                </option>
                <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Documento de Identificación Extranjero">Documento de Identificación Extranjero</option>
                <option value="Permiso Especial de Permanencia">Permiso de Permanencia</option>
              </select>
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-users" />
                </div>
              </div>
            </div>

            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                required
                placeholder="Numero de documento"
                value={numerodocumento}
                onChange={(e) => setNumerodocumento(e.target.value)}
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fa fa-address-card" />
                </div>
              </div>
            </div>

            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                required
                placeholder="Correo Electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
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
                className="form-control"
                placeholder="Contraseña"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-lock" />
                </div>
              </div>
            </div>
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Confirmar Contraseña"
                required
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-lock" />
                </div>
              </div>
            </div>
            <div className="input-group mb-3">
              <select
                className="form-control"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required
              >
                <option value="" disabled>
                  Seleccione Su Rol
                </option>
                <option value="usuario">Usuario</option>
                <option   value="doctor">Doctor</option>
                <option disabled value="asistente">Asistente</option>
              </select>
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-users" />
                </div>
              </div>
            </div>
            <div className="input-group mb-3">
              <PhoneInput
                country={"co"}
                value={phone}
                onChange={setPhone}
                inputProps={{ name: "phone", required: true }}
                containerClass="w-100"
                inputClass="w-100"
                buttonClass="border-end"
              />
            </div>
            <div className="input-group mb-3">
              <div className="form-control d-flex align-items-center justify-content-around">
                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="genero"
                    value="Femenino"
                    onChange={(e) => setGenero(e.target.value)}
                  />
                  <label className="form-check-label ms-1">Femenino</label>
                </div>
                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="genero"
                    value="Masculino"
                    onChange={(e) => setGenero(e.target.value)}
                  />
                  <label className="form-check-label ms-1">Masculino</label>
                </div>
                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="genero"
                    value="Otro"
                    onChange={(e) => setGenero(e.target.value)}
                  />
                  <label className="form-check-label ms-1">Otro</label>
                </div>
              </div>
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-venus-mars" />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
                <div className="icheck-primary">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="terms"
                    defaultValue="agree"
                  />
                  <label htmlFor="agreeTerms">
                    I agree to the <a href="#">terms</a>
                  </label>
                </div>
              </div>
              <div className="col-4">
                <button type="submit" className="btn btn-primary btn-block">
                  Register
                </button>
              </div>
            </div>
          </form>
          <div className="social-auth-links text-center">
            <a href="#" className="btn btn-block btn-primary">
              <i className="fab fa-facebook mr-2" />
              Sign up using Facebook
            </a>
            <a href="#" className="btn btn-block btn-danger">
              <i className="fab fa-google-plus mr-2" />
              Sign up using Google+
            </a>
          </div>
          <a href="/iniciarsesion" className="text-center">
            Ya tengo una cuenta{" "}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Registrar;
