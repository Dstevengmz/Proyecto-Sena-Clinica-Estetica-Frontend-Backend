import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function RegistrarCitas() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);

    const [formData, setFormData] = useState({
        id_usuario: "",
        id_doctor: "",
        fecha: "",
        estado: "",
        tipo: "",
        observaciones: "",
    });

    useEffect(() => {
        axios.get(`${API_URL}/apiusuarios/listarusuarios`)
            .then((response) => {
                setUsuarios(response.data);
            })
            .catch((error) => {
                console.error("Error al obtener usuarios:", error);
            });
    }, []);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const ManejarEnvio = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/apicitas/crearcitas`, formData);
            navigate("/");
            alert("Registro exitoso");
            console.log(response.data);
        } catch (error) {
            console.error("Error al registrar:", error);
            alert("Hubo un error al registrar");
        }
    };

    return (
        <div className="Container">
            <h2>Registrar Cita</h2>
            <form onSubmit={ManejarEnvio}>
                <div>
                    <label htmlFor="nombre">Usuario:</label>
                    <select name="id_usuario" className="form-select" value={formData.id_usuario} onChange={manejarCambio} required>
                        <option value="" disabled>Seleccione un Usuario</option>
                        {usuarios.map(usuario => (
                            <option key={usuario.id} value={usuario.id}>
                                {usuario.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="correo">Doctor:</label>
                    <input type="text" id="correo" name="id_doctor" value={formData.id_doctor} onChange={manejarCambio} required/>
                </div>
                <div>
                    <label htmlFor="fecha">Fecha:</label>
                    <input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={manejarCambio} required/>
                </div>
                <div>
                    <label htmlFor="estado">Estado:</label>
                    <input type="text" id="estado" name="estado" value={formData.estado} onChange={manejarCambio} required/>
                </div>
                <div>   
                    <label htmlFor="tipo">Tipo:</label>
                    <input type="text" id="tipo" name="tipo" value={formData.tipo} onChange={manejarCambio} required/>
                </div>
                <div>
                    <label htmlFor="observaciones">Observaciones:</label>
                    <input type="text" id="observaciones" name="observaciones" value={formData.observaciones} onChange={manejarCambio} required/>
                </div>
                <button type="submit">Registrar</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
                    Cancelar
                </button>
            </form>
        </div>
    );
}

export default RegistrarCitas;
