import { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

function HistorialMedico() {
  const [usuario, setUsuario] = useState({});
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
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function obtenerDatosUsuario() {
      try {
        const response = await axios.get(`${API_URL}/apiusuarios/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(response.data.usuario);
      } catch (error) {
        console.error("Error al obtener datos del usuario", error);
      }
    }

    obtenerDatosUsuario();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `${API_URL}/apihistorialmedico/buscarhistorialclinico/${usuario.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        alert("Ya Tienes un historial médico registrado");
        return;
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        try {
          await axios.post(
            `${API_URL}/apihistorialmedico/crearhistorialclinico`,
            {
              ...formulario,
              usuario_id: usuario.id,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          alert("Historial médico guardado correctamente");

          setFormulario({
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
          });
        } catch (postError) {
          console.error("Error al guardar historial médico", postError);
          alert("Error al guardar historial médico");
        }
      } else {
        console.error("Error al verificar existencia del historial", error);
        alert("Error al verificar historial médico existente");
      }
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

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formEnfermedades">
              <Form.Label>Enfermedades</Form.Label>
              <Form.Control
                type="text"
                name="enfermedades"
                value={formulario.enfermedades}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formAlergias">
              <Form.Label>Alergias</Form.Label>
              <Form.Control
                type="text"
                name="alergias"
                value={formulario.alergias}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formCirugias">
              <Form.Label>Cirugías Previas</Form.Label>
              <Form.Control
                type="text"
                name="cirugias_previas"
                value={formulario.cirugias_previas}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formCondicionesPiel">
              <Form.Label>Condiciones de la Piel</Form.Label>
              <Form.Control
                type="text"
                name="condiciones_piel"
                value={formulario.condiciones_piel}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formMedicamentos">
              <Form.Label>Medicamentos actuales</Form.Label>
              <Form.Control
                type="text"
                name="medicamentos"
                value={formulario.medicamentos}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Usa anticonceptivos?"
              name="usa_anticonceptivos"
              checked={formulario.usa_anticonceptivos}
              onChange={handleChange}
            />
            <Col>
              <Form.Group controlId="formDetallesAnticonceptivos">
                <Form.Label>Detalles de anticonceptivos</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="detalles_anticonceptivos"
                  value={formulario.detalles_anticonceptivos}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Diabetes?"
              name="diabetes"
              checked={formulario.diabetes}
              onChange={handleChange}
            />
          </Col>
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Hipertensión?"
              name="hipertension"
              checked={formulario.hipertension}
              onChange={handleChange}
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Historial de cáncer?"
              name="historial_cancer"
              checked={formulario.historial_cancer}
              onChange={handleChange}
            />
          </Col>
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Problemas de coagulación?"
              name="problemas_coagulacion"
              checked={formulario.problemas_coagulacion}
              onChange={handleChange}
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Epilepsia?"
              name="epilepsia"
              checked={formulario.epilepsia}
              onChange={handleChange}
            />
          </Col>
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Está embarazada o lactando?"
              name="embarazo_lactancia"
              checked={formulario.embarazo_lactancia}
              onChange={handleChange}
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Consume tabaco?"
              name="consume_tabaco"
              checked={formulario.consume_tabaco}
              onChange={handleChange}
            />
          </Col>
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Consume alcohol?"
              name="consume_alcohol"
              checked={formulario.consume_alcohol}
              onChange={handleChange}
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formOtrasCondiciones">
              <Form.Label>Otras condiciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="otras_condiciones"
                value={formulario.otras_condiciones}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          Guardar Historial Médico
        </Button>
      </Form>
    </Container>
  );
}

export default HistorialMedico;
