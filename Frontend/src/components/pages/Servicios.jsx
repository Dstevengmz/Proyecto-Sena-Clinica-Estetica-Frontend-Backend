import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function Servicios() {
  return (
    <Container className="my-5">
      <Row className="g-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3}>
            <Card className="h-100 shadow-sm">
              <Card.Img variant="top" src="/img/innerjoin.jpg" alt={`Servicio ${index + 1}`} />
              <Card.Body className="d-flex flex-column">
                <Card.Title>Servicio {index + 1}</Card.Title>
                <Card.Text>
                  Una breve descripción del servicio para mostrar el contenido de manera clara.
                </Card.Text>
                <div className="mt-auto">
                  <a href="/reservar"><Button variant="primary" className="w-100">
                    Ver más
                  </Button></a>
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
