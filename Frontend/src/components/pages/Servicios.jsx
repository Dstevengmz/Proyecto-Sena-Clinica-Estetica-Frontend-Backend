import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Servicios() {
  const [procedimientos, setProcedimientos] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/apiprocedimientos/listarprocedimiento`)
      .then((res) => setProcedimientos(res.data))
      .catch((err) => console.error(err));
  }, []);
  return (
    <Container className="my-5">
      <Row className="g-4">
        {procedimientos.map((proc) => (
          <Col key={proc.id} xs={12} sm={6} md={4} lg={3}>
            <Card className="h-100 shadow border-0 rounded-4 overflow-hidden">
              <div style={{ height: "180px", overflow: "hidden", background: "#f8f9fa" }}>
                <Card.Img
                  variant="top"
                  src={`${API_URL}/${proc.imagen}`}
                  alt={proc.nombre}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
              <Card.Body className="d-flex flex-column p-4">
                <Card.Title className="mb-2 fw-bold text-primary" style={{ fontSize: "1.2rem" }}>
                  {proc.nombre}
                </Card.Title>
                <Card.Text className="mb-3 text-muted" style={{ minHeight: "60px" }}>
                  {proc.descripcion}
                </Card.Text>
                <ul className="list-unstyled mb-4">
                  <li>
                      <span className="fw-semibold">💲 Precio:</span>{" "}
                      {Number(proc.precio).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      })}
                    </li>
                  <li>
                    <span className="fw-semibold">⏱️ Duración:</span> {proc.duracion}
                  </li>
                  <li>
                    <span className="fw-semibold">🩺 Evaluación:</span> {proc.requiere_evaluacion ? "Sí" : "No"}
                  </li>
                </ul>
                <div className="mt-auto">
                  <a href="/reservar" style={{ textDecoration: "none" }}>
                    <Button
                      variant="primary"
                      className="w-100 rounded-pill fw-semibold"
                      style={{ letterSpacing: "1px" }}
                    >
                      Ver más
                    </Button>
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Servicios;
