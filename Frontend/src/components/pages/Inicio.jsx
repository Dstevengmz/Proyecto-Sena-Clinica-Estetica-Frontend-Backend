
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { cerrarSesion } from './CerrarSesion';
import { useNavigate } from 'react-router-dom'
function NavbarPrincipal() {
  const navigate = useNavigate();

  const envioCerrarSesion = () => {
    cerrarSesion(navigate);
  };
  
  return (
    <Navbar expand="lg" bg="primary" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">Clínica Estética</Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/servicios">Servicios</Nav.Link>
            <NavDropdown title="Más">
              <NavDropdown.Item as={Link} to="/equipo">Nuestro Equipo</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contacto">Contáctanos</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/iniciarsesion">Iniciar sesión</Nav.Link>
            <Nav.Link as={Link} to="/registro">Registrarse</Nav.Link>
            <Nav.Link onClick={envioCerrarSesion}>Cerrar sesión</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavbarPrincipal
