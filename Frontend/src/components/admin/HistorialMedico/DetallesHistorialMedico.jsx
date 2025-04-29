import { useContext } from "react";
import { Form, Row, Col, Card } from "react-bootstrap";
import { HistorialClinicoContext } from "./ConsultarHistorialMedico";

function UserDetail() {
  const { selectedHistorialclinico } = useContext(HistorialClinicoContext);

  if (!selectedHistorialclinico) {
    return (
      <p className="text-center mt-4">
        Selecciona un historial clínico para ver los detalles.
      </p>
    );
  }
  return (
    <div>
      <Card className="mb-4">
        <Card.Body>
          <h4>Detalles del Usuario</h4>
          <Row>
            <Col md={6}>
              <p>
                <strong>Nombre:</strong>{" "}
                {selectedHistorialclinico.usuario?.nombre}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Correo:</strong>{" "}
                {selectedHistorialclinico.usuario?.correo}
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Teléfono:</strong>{" "}
                {selectedHistorialclinico.usuario?.telefono}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Dirección:</strong>{" "}
                {selectedHistorialclinico.usuario?.direccion || "No registrada"}
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Rol:</strong> {selectedHistorialclinico.usuario?.rol}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h4>Detalles del Historial Clínico</h4>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formEnfermedades">
                  <Form.Label>Enfermedades</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedHistorialclinico.enfermedades || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formAlergias">
                  <Form.Label>Alergias</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedHistorialclinico.alergias || ""}
                    disabled
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
                    value={selectedHistorialclinico.cirugias_previas || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formCondicionesPiel">
                  <Form.Label>Condiciones de la Piel</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedHistorialclinico.condiciones_piel || ""}
                    disabled
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
                    value={selectedHistorialclinico.medicamentos || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Usa anticonceptivos?"
                  checked={selectedHistorialclinico.usa_anticonceptivos}
                  disabled
                />
              </Col>
              <Col>
                <Form.Group controlId="formDetallesAnticonceptivos">
                  <Form.Label>Detalles de anticonceptivos</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={
                      selectedHistorialclinico.detalles_anticonceptivos || ""
                    }
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Diabetes?"
                  checked={selectedHistorialclinico.diabetes}
                  disabled
                />
              </Col>
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Hipertensión?"
                  checked={selectedHistorialclinico.hipertension}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Historial de cáncer?"
                  checked={selectedHistorialclinico.historial_cancer}
                  disabled
                />
              </Col>
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Problemas de coagulación?"
                  checked={selectedHistorialclinico.problemas_coagulacion}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Epilepsia?"
                  checked={selectedHistorialclinico.epilepsia}
                  disabled
                />
              </Col>
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Está embarazada o lactando?"
                  checked={selectedHistorialclinico.embarazo_lactancia}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Consume tabaco?"
                  checked={selectedHistorialclinico.consume_tabaco}
                  disabled
                />
              </Col>
              <Col>
                <Form.Check
                  type="checkbox"
                  label="¿Consume alcohol?"
                  checked={selectedHistorialclinico.consume_alcohol}
                  disabled
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
                    value={selectedHistorialclinico.otras_condiciones || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default UserDetail;
