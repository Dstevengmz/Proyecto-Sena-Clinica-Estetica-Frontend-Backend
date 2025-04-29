import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function EditarHistorialMedico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    enfermedades: "",
    alergias: "",
    cirugias_previas: "",
    condiciones_piel: "",
    embarazo_lactancia: false,
    medicamentos: "",
    consume_tabaco: false,
    consume_alcohol: false,
    usa_anticonceptivos: false,
    detalles_anticonceptivos: "",
    diabetes: false,
    hipertension: false,
    historial_cancer: false,
    problemas_coagulacion: false,
    epilepsia: false,
    otras_condiciones: "",
    usuario: {} // <- Agregado para que funcione el usuario
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No estás autenticado");
      return;
    }

    const obtenerHistorial = async () => {
      try {
        const response = await axios.get(`${API_URL}/apihistorialmedico/buscarhistorialclinico/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setFormulario(response.data);
      } catch (error) {
        console.error("Error al cargar el historial médico:", error);
        alert("No se pudo cargar la información del historial médico");
      }
    };

    obtenerHistorial();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const actualizarHistorialMedico = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado");
        return;
      }

      await axios.patch(`${API_URL}/apihistorialmedico/editarhistorialclinico/${id}`, formulario, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Historial médico actualizado correctamente");
      navigate("/consultarhistorialmedicos");
    } catch (error) {
      console.error("Error al actualizar el historial médico:", error);
      alert("No se pudo actualizar el historial médico");
    }
  };

  return (
    <Container>
      <h1 className="mt-4">Historial Médico</h1>

      <Card className="mb-4">
        <Card.Body>
          <h4>Detalles del Usuario</h4>
          <Row>
            <Col md={6}>
              <p><strong>Nombre:</strong> {formulario.usuario?.nombre}</p>
            </Col>
            <Col md={6}>
              <p><strong>Correo:</strong> {formulario.usuario?.correo}</p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p><strong>Teléfono:</strong> {formulario.usuario?.telefono}</p>
            </Col>
            <Col md={6}>
              <p><strong>Dirección:</strong> {formulario.usuario?.direccion || "No registrada"}</p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p><strong>Rol:</strong> {formulario.usuario?.rol}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Form onSubmit={actualizarHistorialMedico}>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formEnfermedades">
              <Form.Label>Enfermedades</Form.Label>
              <Form.Control type="text" name="enfermedades" value={formulario.enfermedades} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formAlergias">
              <Form.Label>Alergias</Form.Label>
              <Form.Control type="text" name="alergias" value={formulario.alergias} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formCirugias">
              <Form.Label>Cirugías Previas</Form.Label>
              <Form.Control type="text" name="cirugias_previas" value={formulario.cirugias_previas} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formCondicionesPiel">
              <Form.Label>Condiciones de la Piel</Form.Label>
              <Form.Control type="text" name="condiciones_piel" value={formulario.condiciones_piel} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formMedicamentos">
              <Form.Label>Medicamentos actuales</Form.Label>
              <Form.Control type="text" name="medicamentos" value={formulario.medicamentos} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Check type="checkbox" label="¿Usa anticonceptivos?" name="usa_anticonceptivos" checked={formulario.usa_anticonceptivos} onChange={handleChange} />
          </Col>
          <Col>
            <Form.Group controlId="formDetallesAnticonceptivos">
              <Form.Label>Detalles de anticonceptivos</Form.Label>
              <Form.Control as="textarea" rows={3} name="detalles_anticonceptivos" value={formulario.detalles_anticonceptivos} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit">
          Guardar Cambios
        </Button>
      </Form>
    </Container>
  );
}

export default EditarHistorialMedico;
