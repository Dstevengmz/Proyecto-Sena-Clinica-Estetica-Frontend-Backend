import PhoneInput from 'react-phone-input-2';
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
function Registrar(){
    const [phone, setPhone] = useState('');
    




    return(
        <div className="container-fluid registration-container">
        <div className="row min-vh-100 align-items-center justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                <div className="card registration-card">
                    <div className="card-header text-center py-4">
                        <h2 className="mb-0">Registrar Cuenta</h2>
                    </div>
                    <div className="card-body p-4 p-md-5">
                        <form id="FormRegistrar" className="needs-validation" noValidate>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Ingrese su Nombre</label>
                                    <input type="text" className="form-control" required placeholder='Nombre Completo'></input>
                                    <div className="invalid-feedback">Ingrese Su nombre</div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Ingrese su Correo Electronico</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                                        <input type="email" className="form-control" required placeholder='Correo Electronico'></input>
                                        <div className="invalid-feedback">Ingrese un correo electronico Valido</div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Contraseña</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-lock"></i></span>
                                        <input type="password" className="form-control" placeholder='Contraseña' required ></input>
                                        <button className="btn btn-outline-secondary" type="button">
                                            <i className="bi bi-eye"></i>
                                        </button>
                                        <div className="invalid-feedback">La contraseña no puede tener mas de 8 caracteres entres mayusculas y minusculas y numeros</div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Confirmar Contraseña</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                                        <input type="password" className="form-control" placeholder='Confirmar Contraseña' required></input>
                                        <div className="invalid-feedback">Las contraseñas deben coincidir</div>
                                    </div>
                                </div>
                                <div class="form-outline col-12 mb-3">
                                <label htmlFor="roleSelect" className="form-label">
                                    Seleccionar Rol
                                </label>
                                <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-person-badge"></i>
                                </span>
                                    <select class="form-select" data-mdb-select-init>
                                        <option value="1" disabled selected>Seleccione Su Rol</option>
                                        <option value="2">Usuario</option>
                                        <option value="3">Doctor</option>
                                        <option value="4">Asistente</option>
                                    </select>
                                </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-outline mb-3">
                                    <label className="form-label">Ingrese su Telefono</label>
                                        <PhoneInput form-control country={'co'} value={phone} onChange={setPhone}
                                        inputProps={{ name: 'phone',required: true, autoFocus: false,}}
                                        containerClass="w-100" inputClass="w-100" buttonClass="border-end" />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Ingrese su Direccion</label>
                                    <input type="text" className="form-control" required placeholder='Direccion'></input>
                                    <div className="invalid-feedback">Ingrese Su Direccion</div>
                                </div>
                                <div className="col-md-12">
                                    <h6 class="mb-2 pb-1">Genero: </h6>
                                    <div class="form-check form-check-inline mb-0 me-4">
                                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="femaleGender" value="option1"></input>
                                    <label class="form-check-label" for="femaleGender">Femenino</label>
                                    </div>
                                    <div class="form-check form-check-inline mb-0 me-4">
                                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="maleGender" value="option2"></input>
                                    <label class="form-check-label" for="maleGender">Masculino</label>
                                    </div>
                                    <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="otherGender" value="option3"></input>
                                    <label class="form-check-label" for="otherGender">Otro</label>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Ingrese su Ocupacion</label>
                                    <input type="text" className="form-control" placeholder='Ocupacion'></input>
                                    <div className="invalid-feedback">Ingrese Su Ocupacion</div>
                                </div>
                                <div class="form-outline col-12 mb-3">
                                <label htmlFor="roleSelect" className="form-label">
                                    Seleccionar Su Estado Civil
                                </label>
                                <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-suit-heart-fill"></i>
                                </span>
                                    <select class="form-select" data-mdb-select-init>
                                        <option value="1" disabled selected>Seleccione Su Estado Civil</option>
                                        <option value="2">Soltero</option>
                                        <option value="3">Casado</option>
                                        <option value="4">Divorciado</option>
                                        <option value="5">Viudo</option>
                                        <option value="6">Unión libre</option>
                                    </select>
                                </div>
                                </div>
                                <div className="col-12 text-center mt-4">
                                    <button className="btn btn-primary btn-lg px-5" type="submit">
                                        <span className="spinner-border spinner-border-sm d-none" role="status"></span>
                                        Crear Cuenta
                                    </button>
                                </div>
                                <div className="col-12 text-center mt-4">
                                    <div className="social-login">
                                        <p className="text-muted">Or sign up with</p>
                                        <div className="d-flex justify-content-center gap-3">
                                            <button type="button" className="btn btn-outline-secondary">
                                                <i className="bi bi-google"></i>
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary">
                                                <i className="bi bi-facebook"></i>
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary">
                                                <i className="bi bi-apple"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}
export default Registrar;