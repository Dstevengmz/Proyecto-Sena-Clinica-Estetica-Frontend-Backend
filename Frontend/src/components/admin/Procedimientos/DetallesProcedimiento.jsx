import { useContext } from "react";
import { Form, Row, Col, Card } from "react-bootstrap";
import { ProcedimientoContext } from "./ConsultarProcedimientos";

function UserDetail() {
  const { selectedProcedimiento } = useContext(ProcedimientoContext);

  if (!selectedProcedimiento) {
    return (
      <p className="text-center mt-4">
        Selecciona un Procedimiento para ver los detalles.
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
                {selectedProcedimiento.usuario?.nombre}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Correo:</strong>{" "}
                {selectedProcedimiento.usuario?.correo}
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Teléfono:</strong>{" "}
                {selectedProcedimiento.usuario?.telefono}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Dirección:</strong>{" "}
                {selectedProcedimiento.usuario?.direccion || "No registrada"}
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Rol:</strong> {selectedProcedimiento.usuario?.rol}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h4>Detalles del Procedimiento</h4>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formNombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProcedimiento.nombre || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formDescripcion">
                  <Form.Label>Descripcion</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProcedimiento.descripcion || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formPrecio">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProcedimiento.precio || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formCategoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProcedimiento.categoria || ""}
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
