import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function RegistrarCitas() {
  const [usuario, setUsuario] = useState({});
  const horariosDisponibles = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  const duraciones = {
    evaluacion: 30,
    procedimiento: 150,
  };

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [usuarios, setUsuarios] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [formData, setFormData] = useState({
    id_usuario: "",
    id_doctor: "",
    fecha: "",
    estado: "pendiente",
    tipo: "",
    observaciones: "",
  });

  useEffect(() => {
    async function obtenerDatosUsuario() {
      try {
        const respuesta = await axios.get(
          `${API_URL}/apiusuarios/listarusuarios`,
          {
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
    async function obtenerDatosUsuarios() {
      try {
        const response = await axios.get(`${API_URL}/apiusuarios/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(response.data.usuario);
      } catch (error) {
        console.error("Error al obtener datos del usuario", error);
      }
    }
    obtenerDatosUsuarios();
  }, [token]);

  useEffect(() => {
    if (usuario && usuario.id) {
      setFormData((prev) => ({ ...prev, id_usuario: usuario.id }));
    }
  }, [usuario]);

  useEffect(() => {
    async function obtenerHorarios() {
      if (!formData.fecha || !formData.tipo) return;
      try {
        const respuesta = await axios.get(
          `${API_URL}/apicitas/horarios/${formData.fecha}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(formData);
  };

  const estaOcupado = (hora) => {
    const fechaHora = `${formData.fecha}T${hora}:00`;
    const inicio = new Date(fechaHora);
    const duracionMin = duraciones[formData.tipo] || 0;
    const fin = new Date(inicio.getTime() + duracionMin * 60000);

    return horariosOcupados.some((cita) => {
      const inicioOcupado = new Date(cita.fecha);
      const finOcupado = new Date(
        inicioOcupado.getTime() + duraciones[cita.tipo] * 60000
      );
      return (
        (inicio >= inicioOcupado && inicio < finOcupado) ||
        (fin > inicioOcupado && fin <= finOcupado) ||
        (inicio <= inicioOcupado && fin >= finOcupado)
      );
    });
  };

  const ManejarEnvio = async (e) => {
    e.preventDefault();

    if (!formData.fecha || !horaSeleccionada || !formData.tipo) {
      alert("Debe seleccionar la fecha, hora y tipo de cita.");
      return;
    }

    const fechaFormateada = `${formData.fecha} ${horaSeleccionada}:00`;

    try {
      await axios.post(
        `${API_URL}/apicitas/crearcitas`,
        { ...formData, fecha: fechaFormateada },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("formData.fecha:", formData.fecha);
      alert("Registro exitoso");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Hubo un error al registrar");
    }
  };

  return (
    <Container>
      <h1 className="mt-4">Registrar Cita</h1>
      <Card className="mb-4">
        <Card.Body>
          <h4>Detalles del Usuario</h4>
          <Row>
            <Col md={6}>
              <p>
                <strong>Nombre:</strong> {usuario.nombre}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Correo:</strong> {usuario.correo}
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Teléfono:</strong> {usuario.telefono}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Dirección:</strong> {usuario.direccion}
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Rol:</strong> {usuario.rol}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Form onSubmit={ManejarEnvio}>
        <input type="hidden" name="id_usuario" value={formData.id_usuario} />
        <div>
          <label>Doctor:</label>
          <select
            name="id_doctor"
            className="form-select"
            value={formData.id_doctor}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccione un Doctor</option>
            {usuarios
              .filter((u) => u.rol === "doctor")
              .map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.nombre}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label>Tipo:</label>
          <select
            className="form-select"
            name="tipo"
            value={formData.tipo}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccione tipo</option>
            <option value="evaluacion">Evaluación</option>
            <option value="procedimiento">Procedimiento</option>
          </select>
        </div>

        <div>
          <label>Fecha:</label>
          <input
            type="date"
            name="fecha"
            className="form-control"
            value={formData.fecha}
            onChange={manejarCambio}
            required
          />
        </div>

        <div>
          <label>Hora:</label>
          <select
            className="form-select"
            value={horaSeleccionada}
            onChange={(e) => setHoraSeleccionada(e.target.value)}
            required
          >
            <option value="">Seleccione una hora</option>
            {horariosDisponibles.map((hora) => (
              <option key={hora} value={hora} disabled={estaOcupado(hora)}>
                {hora} {estaOcupado(hora) ? "🟥 Ocupado" : "🟩 Disponible"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Observaciones:</label>
          <input
            type="text"
            name="observaciones"
            className="form-control"
            value={formData.observaciones}
            onChange={manejarCambio}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Registrar
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          Cancelar
        </button>
      </Form>
    </Container>
  );
}

export default RegistrarCitas;
