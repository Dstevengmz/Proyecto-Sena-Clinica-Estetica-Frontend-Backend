import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function RegistrarProcedimiento() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    requiere_evaluacion: false,
    duracion: "",
    examenes_requeridos: "",
    imagen: null,
    categoria: "",
    recomendaciones_previas: "",
  });

  const manejarCambio = (e) => {
    const { name, value, type, checked,files } = e.target;
    setFormData((prev) => ({
      ...prev,
    [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,    }));
  };

const manejarEnvio = async (e) => {
  e.preventDefault();
  const datos = new FormData();
  Object.entries(formData).forEach(([clave, valor]) => {
    datos.append(clave, valor);
  });

  try {
    await axios.post(`${API_URL}/apiprocedimientos/crearprocedimiento`, datos, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    alert("Procedimiento registrado con imagen");
    navigate("/dashboard");
  } catch (error) {
    console.error("Error al registrar procedimiento:", error);
    alert("Error al registrar el procedimiento.");
  }
};


  return (
    <Container className="mt-4">
      <h2>Registrar Procedimiento</h2>
      <Form onSubmit={manejarEnvio}>
        <Form.Group>
          <Form.Label>Nombre</Form.Label>
          <Form.Control name="nombre" value={formData.nombre} onChange={manejarCambio} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Descripción</Form.Label>
          <Form.Control as="textarea" name="descripcion" value={formData.descripcion} onChange={manejarCambio} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Precio</Form.Label>
          <Form.Control type="number" name="precio" value={formData.precio} onChange={manejarCambio} required />
        </Form.Group>

        <Form.Group>
          <Form.Check
            type="checkbox"
            label="¿Requiere evaluación previa?"
            name="requiere_evaluacion"
            checked={formData.requiere_evaluacion}
            onChange={manejarCambio}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Duración (minutos)</Form.Label>
          <Form.Control type="number" name="duracion" value={formData.duracion} onChange={manejarCambio} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Exámenes Requeridos</Form.Label>
          <Form.Control name="examenes_requeridos" value={formData.examenes_requeridos} onChange={manejarCambio} />
        </Form.Group>

        <Form.Group>
          <Form.Label>Imagen (selecciona un archivo)</Form.Label>
          <Form.Control type="file" name="imagen" accept="image/*" onChange={manejarCambio} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Categoría</Form.Label>
          <Form.Control name="categoria" value={formData.categoria} onChange={manejarCambio} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Recomendaciones Previas</Form.Label>
          <Form.Control as="textarea" name="recomendaciones_previas" value={formData.recomendaciones_previas} onChange={manejarCambio} />
        </Form.Group>

        <Button type="submit" className="mt-3 btn btn-primary">
          Registrar Procedimiento
        </Button>
        <Button type="button" className="mt-3 ms-2 btn btn-secondary" onClick={() => navigate("/")}>
          Cancelar
        </Button>
      </Form>
    </Container>
  );
}

export default RegistrarProcedimiento;
