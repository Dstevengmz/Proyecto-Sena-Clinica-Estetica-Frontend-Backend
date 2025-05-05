import { useContext } from "react";
import { Form, Row, Col, Card } from "react-bootstrap";
import { CitasContext } from "./Consultarcitas";

function DetallesCitas() {
  const { selectedCitas } = useContext(CitasContext);

  if (!selectedCitas) {
    return (
      <p className="text-center mt-4">
        Selecciona una cita para ver los detalles.
      </p>
    );
  }

  return (
    <div>
      <h1>Detalles de la Cita</h1>
      <Card className="mb-4">
        <Card.Body>
          <h4>Paciente</h4>
          <Row>
            <Col md={6}>
              <p>
                <strong>Nombre:</strong> {selectedCitas.usuario?.nombre}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Teléfono:</strong> {selectedCitas.usuario?.telefono}
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Dirección:</strong>{" "}
                {selectedCitas.usuario?.direccion || "No registrada"}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Rol:</strong> {selectedCitas.usuario?.rol}
              </p>
            </Col>
          </Row>

          <h4 className="mt-4">Doctor</h4>
          <Row>
            <Col md={6}>
              <p>
                <strong>Nombre:</strong> {selectedCitas.doctor?.nombre}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Ocupación:</strong>{" "}
                {selectedCitas.doctor?.ocupacion || "No registrada"}
              </p>
            </Col>
          </Row>

          <h4 className="mt-4">Información de la Cita</h4>
          <Row>
            <Col md={6}>
              <p>
                <strong>Fecha:</strong> {selectedCitas.fecha}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Tipo de Cita</strong> {selectedCitas.tipo}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default DetallesCitas;
