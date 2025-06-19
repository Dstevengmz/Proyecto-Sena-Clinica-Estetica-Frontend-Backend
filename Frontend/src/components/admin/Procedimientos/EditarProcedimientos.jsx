import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Image,
} from "react-bootstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function EditarProcedimientos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    requiere_evaluacion: "",
    duracion: "",
    examenes_requeridos: "",
    imagen: null,
    categoria: "",
    recomendaciones_previas: false,
    usuario: {},
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No estás autenticado");
      return;
    }

    const obtenerProcedimiento = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/apiprocedimientos/buscarprocedimiento/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFormulario(response.data);
      } catch (error) {
        console.error("Error al cargar el procedimiento:", error);
        alert("No se pudo cargar la información del procedimiento");
      }
    };

    obtenerProcedimiento();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const actualizarProcedmiento = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado");
        return;
      }

      const formData = new FormData();
      for (const key in formulario) {
        if (key === "imagen") {
          if (formulario.imagen instanceof File) {
            formData.append("imagen", formulario.imagen); 
          }
        } else {
          formData.append(key, formulario[key]);
        }
      }

      await axios.patch(
        `${API_URL}/apiprocedimientos/editarprocedimiento/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Procedimiento actualizado correctamente");
      navigate("/consultarprocedimientos");
    } catch (error) {
      console.error("Error al actualizar el procedimiento:", error);
      alert("No se pudo actualizar el procedimiento");
    }
  };

  return (
    <Container>
      <h1 className="mt-4">Editar Procedimiento</h1>
      <Card className="mb-4">
        <Card.Body>
          <h4>Detalles del Usuario</h4>
          <Row>
            <Col md={6}>
              <p>
                <strong>Nombre:</strong> {formulario.usuario?.nombre}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Correo:</strong> {formulario.usuario?.correo}
              </p>
            </Col>
          </Row>
          <Row>
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
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Rol:</strong> {formulario.usuario?.rol}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Form onSubmit={actualizarProcedmiento}>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formDescripcion">
              <Form.Label>Descripcion</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={formulario.descripcion}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formDuracion">
              <Form.Label>Duracion</Form.Label>
              <Form.Control
                type="text"
                name="duracion"
                value={formulario.duracion}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Requiere Evaluacion?"
              name="requiere_evaluacion"
              checked={formulario.requiere_evaluacion}
              onChange={handleChange}
            />
          </Col>
          <Col>
            <Form.Check
              type="checkbox"
              label="¿Requiere examenes?"
              name="examenes_requeridos"
              checked={formulario.examenes_requeridos}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formPrecio">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="text"
                name="precio"
                value={formulario.precio}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formImagen">
              <Form.Label>Imagen</Form.Label>
            <Form.Control type="text" value={ formulario.imagen instanceof File ? formulario.imagen.name: formulario.imagen || ""} readOnlydisabled/>
              <Form.Control type="file" name="imagen" accept="image/*" onChange={handleChange}/>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formCategoria">
              <Form.Label>Categoria</Form.Label>
              <Form.Control
                type="text"
                name="categoria"
                value={formulario.categoria}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formRecomendacionesPrevias">
              <Form.Label>Recomendaciones Previas</Form.Label>
              <Form.Control
                type="text"
                name="recomendaciones_previas"
                value={formulario.recomendaciones_previas}
                onChange={handleChange}
              />
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

export default EditarProcedimientos;
