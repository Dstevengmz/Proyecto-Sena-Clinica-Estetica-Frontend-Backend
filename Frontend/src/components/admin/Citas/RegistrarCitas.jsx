import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function RegistrarCitas() {
  const horariosDisponibles = [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];
  
  const duraciones = {
    evaluacion: 30,
    procedimiento: 150
  };
  
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [formData, setFormData] = useState({
    id_usuario: "",
    id_doctor: "",
    fecha: "",
    estado: "",
    tipo: "",
    observaciones: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function obtenerDatosUsuario() {
      try {
        const respuesta = await axios.get(
          `${API_URL}/apiusuarios/listarusuarios`,
          {
            "Content-Type": "application/json",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsuarios(respuesta.data);
      } catch (error) {
        console.error("Error al obtener datos del usuario", error);
        alert("No se pudieron obtener los datos del usuario.");
      }
    }
    obtenerDatosUsuario();
  }, [token]);

  useEffect(() => {
    async function obtenerHorarios() {
      if (!formData.fecha || !formData.tipo) return;
  
      try {
        const respuesta = await axios.get(`${API_URL}/apicitas/horarios/${formData.fecha}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        setHorariosOcupados(respuesta.data);
      } catch (error) {
        console.error("Error al obtener horarios ocupados", error);
        setHorariosOcupados([]);
      }
    }
  
    obtenerHorarios();
  }, [formData.fecha, formData.tipo, token]);
  

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };







  const ManejarEnvio = async (e) => {
    e.preventDefault();
    const fechaCompleta = `${formData.fecha}T${horaSeleccionada}:00`;
    try {
      const response = await axios.post(
        `${API_URL}/apicitas/crearcitas`,
        { ...formData, fecha: fechaCompleta },
        {
          "Content-Type": "application/json",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/");
      alert("Registro exitoso");
      console.log(response.data);
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Hubo un error al registrar");
    }
  };





  function estaOcupado(hora) {
    const fechaHora = `${formData.fecha}T${hora}:00`;
  
    const inicio = new Date(fechaHora);
    const duracionMin = duraciones[formData.tipo] || 0;
    const fin = new Date(inicio.getTime() + duracionMin * 60000);
  
    return horariosOcupados.some(cita => {
      const inicioOcupado = new Date(cita.fecha);
      const finOcupado = new Date(inicioOcupado.getTime() + duraciones[cita.tipo] * 60000);
  
      return (
        (inicio >= inicioOcupado && inicio < finOcupado) ||
        (fin > inicioOcupado && fin <= finOcupado) ||
        (inicio <= inicioOcupado && fin >= finOcupado)
      );
    });
  }
  

  return (
    <div className="Container">
      <h2>Registrar Cita</h2>
      <form onSubmit={ManejarEnvio}>
        <div>
          <label htmlFor="id_usuario">Usuario:</label>
          <select
            name="id_usuario"
            className="form-select"
            value={formData.id_usuario}
            onChange={manejarCambio}
            required
          >
            <option value="" disabled>
              Seleccione un Usuario
            </option>
            {usuarios
              .filter((usuario) => usuario.rol === "usuario")
              .map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="id_doctor">Doctor:</label>
          <select
            name="id_doctor"
            className="form-select"
            value={formData.id_doctor}
            onChange={manejarCambio}
            required
          >
            <option value="" disabled>
              Seleccione un Doctor
            </option>
            {usuarios
              .filter((usuario) => usuario.rol === "doctor")
              .map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="hora">Hora:</label>
          <select
            className="form-select"
            name="hora"
            value={horaSeleccionada}
            onChange={(e) => setHoraSeleccionada(e.target.value)}
            required>
            <option value="">Seleccione una hora</option>
            {horariosDisponibles.map(hora => (
              <option key={hora} value={hora} disabled={estaOcupado(hora)}>
                {hora} {estaOcupado(hora) ? "(Ocupado)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estado">Estado:</label>
          <input
            type="text"
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={manejarCambio}
            required
          />
        </div>
        <div>
          <label htmlFor="tipo">Tipo:</label>
          <input
            type="text"
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={manejarCambio}
            required
          />
        </div>
        <div>
          <label htmlFor="observaciones">Observaciones:</label>
          <input
            type="text"
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={manejarCambio}
            required
          />
        </div>
        <button type="submit">Registrar</button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default RegistrarCitas;
