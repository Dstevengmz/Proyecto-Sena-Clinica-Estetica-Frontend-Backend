import { Form, Row, Col, Card, Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function EditarCitas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState({
    id_usuario: "",
    id_doctor: "",
    fecha: "",
    estado: "",
    tipo: "",
    observaciones: "",
    usuario: {},
    doctor: {},
  });
  const [hora, setHora] = useState("");

  // Cargar usuarios (doctores)
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_URL}/apiusuarios/listarusuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, [token]);

  // Cargar cita
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_URL}/apicitas/buscarcitas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const cita = res.data;
        const [fecha, horaStr] = cita.fecha.split(" ");
        setFormulario({ ...cita, fecha });
        setHora(horaStr.slice(0, 5));
      })
      .catch((err) => {
        console.error("Error al cargar cita:", err);
        alert("No se pudo cargar la cita.");
      });
  }, [id, token]);

  // Actualizar cambios del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar cambios
  const actualizarCita = async (e) => {
    e.preventDefault();

    const fechaCompleta = `${formulario.fecha} ${hora}:00`;
    try {
      await axios.patch(
        `${API_URL}/apicitas/editarcitas/${id}`,
        { ...formulario, fecha: fechaCompleta },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Cita actualizada correctamente");
      navigate("/consultarcitas");
    } catch (err) {
      console.error("Error al actualizar cita:", err);
      alert("No se pudo actualizar la cita");
    }
  };

  return (
    <Container>
      <h2 className="mt-4">Editar Cita</h2>
      <Card className="mb-4">
        <Card.Body>
          <h5>Información del Usuario</h5>
          <Row>
            <Col md={6}>
              <p>
                <strong>Nombre:</strong> {formulario.usuario?.nombre}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Teléfono:</strong> {formulario.usuario?.telefono}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Dirección:</strong>{" "}
                {formulario.usuario?.direccion || "No registrada"}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Rol:</strong> {formulario.usuario?.rol}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Form onSubmit={actualizarCita}>
        <Form.Group className="mb-3">
          <Form.Label>Doctor</Form.Label>
          <Form.Select
            name="id_doctor"
            value={formulario.id_doctor}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccione un doctor</option>
            {usuarios
              .filter((u) => u.rol === "doctor")
              .map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.nombre}
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tipo</Form.Label>
          <Form.Select
            name="tipo"
            value={formulario.tipo}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccione tipo</option>
            <option value="evaluacion">Evaluación</option>
            <option value="procedimiento">Procedimiento</option>
          </Form.Select>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={formulario.fecha}
                onChange={manejarCambio}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Hora</Form.Label>
              <Form.Select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              >
                <option value="">Seleccione una hora</option>
                {horariosDisponibles.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Observaciones</Form.Label>
          <Form.Control
            type="text"
            name="observaciones"
            value={formulario.observaciones}
            onChange={manejarCambio}
          />
        </Form.Group>

        <button type="submit" className="btn btn-success me-2">
          Actualizar
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/consultarcitas")}
        >
          Cancelar
        </button>
      </Form>
    </Container>
  );
}

export default EditarCitas;
