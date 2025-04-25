import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
const API_URL = import.meta.env.VITE_API_URL;

function Registrar() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState('');
  const [direccion, setDireccion] = useState('');
  const [genero, setGenero] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const enviarFormulario = async (e) => {
    e.preventDefault();

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await axios.post(`${API_URL}/apiusuarios/crearusuarios`, {
        nombre,email: correo,contrasena,rol,telefono: phone,direccion,genero,ocupacion,estado_civil: estadoCivil,
      });
      setMensaje('Registro exitoso');
      navigate('/');
      setError('');
    } catch (err) {
      setError('Error al registrar usuario');
      setMensaje('');
      console.error(err);
    }
  };

  return (
    <div className="container-fluid registration-container">
      <div className="row min-vh-100 align-items-center justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card registration-card">
            <div className="card-header text-center py-4">
              <h2 className="mb-0">Registrar Cuenta</h2>
            </div>
            <div className="card-body p-4 p-md-5">
              {mensaje && <div className="alert alert-success">{mensaje}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={enviarFormulario} className="needs-validation" noValidate>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Ingrese su Nombre</label>
                    <input type="text" className="form-control" required placeholder="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Ingrese su Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input type="email" className="form-control" required placeholder="Correo Electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <input type="password" className="form-control" placeholder="Contraseña" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Confirmar Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                      <input type="password" className="form-control" placeholder="Confirmar Contraseña" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Seleccionar Rol</label>
                    <select className="form-select" value={rol} onChange={(e) => setRol(e.target.value)} required>
                      <option value="" disabled>Seleccione Su Rol</option>
                      <option value="usuario">Usuario</option>
                      <option value="doctor">Doctor</option>
                      <option value="asistente">Asistente</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Ingrese su Teléfono</label>
                    <PhoneInput
                      country={'co'}
                      value={phone}
                      onChange={setPhone}
                      inputProps={{ name: 'phone', required: true }}
                      containerClass="w-100"
                      inputClass="w-100"
                      buttonClass="border-end"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Ingrese su Dirección</label>
                    <input type="text" className="form-control" required placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Género</label><br />
                    <div className="form-check form-check-inline mb-0 me-4">
                      <input className="form-check-input" type="radio" name="genero" value="Femenino" onChange={(e) => setGenero(e.target.value)} />
                      <label className="form-check-label">Femenino</label>
                    </div>
                    <div className="form-check form-check-inline mb-0 me-4">
                      <input className="form-check-input" type="radio" name="genero" value="Masculino" onChange={(e) => setGenero(e.target.value)} />
                      <label className="form-check-label">Masculino</label>
                    </div>
                    <div className="form-check form-check-inline mb-0">
                      <input className="form-check-input" type="radio" name="genero" value="Otro" onChange={(e) => setGenero(e.target.value)} />
                      <label className="form-check-label">Otro</label>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Ingrese su Ocupación</label>
                    <input type="text" className="form-control" placeholder="Ocupación" value={ocupacion} onChange={(e) => setOcupacion(e.target.value)} />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Estado Civil</label>
                    <select className="form-select" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} required>
                      <option value="" disabled>Seleccione su Estado Civil</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                      <option value="Unión libre">Unión libre</option>
                    </select>
                  </div>

                  <div className="col-12 text-center mt-4">
                    <button className="btn btn-primary btn-lg px-5" type="submit">
                      Crear Cuenta
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registrar;
