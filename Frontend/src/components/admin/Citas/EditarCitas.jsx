import { Form, Row, Col, Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

function EditarCitas()
{
    const { id } = useParams();
      const [formulario, setFormulario] = useState({
        id_usuario:"",
        id_doctor:"",
        fecha:"",
        estado:"",
        tipo:"",
        observaciones:"",
        usuario:{},
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
    
        if (!token) {
          alert("No estás autenticado");
          return;
        }
    
        const obtenerCitas = async () => {
          try {
            const response = await axios.get(
              `${API_URL}/apicitas/buscarcitas/${id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setFormulario(response.data);
          } catch (error) {
            console.error("Error al cargar Las citas:", error);
            alert("No se pudo cargar la información de la Cita");
          }
        };
    
        obtenerCitas();
      }, [id]);


const actualizarCitas = async (e) => {
        e.preventDefault();
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("No estás autenticado");
            return;
          }
    
          await axios.patch(
            `${API_URL}/apicitas/editarcitas/${id}`,
            formulario,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          alert("La Cita se ha actualizado Correctamente");
          navigate("/consultarcitas");
        } catch (error) {
          console.error("Error al actualizar La cita Medica:", error);
          alert("No se pudo actualizar La cita Medica");
        }
      };
      
    return(
        <div>
        <h1>Editar Cita</h1>
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
                <strong>Doctor:</strong> {formulario.doctor?.nombre}
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
            <Form onSubmit={actualizarCitas}>
              <input type="hidden" name="id_usuario" value={formulario.id_usuario} />
              <div>
                <label>Doctor:</label>
                <select
                  name="id_doctor"
                  className="form-select"
                  value={formulario.id_doctor}
                  onChange={(e) => setFormulario({ ...formulario, [e.target.name]: e.target.value })}
                  required
                >
                  <option value="">Seleccione un Doctor</option>
                  {usuarios
                    .filter((u) => u.rol === "doctor")
                    .map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.nombre}
                      </option>
                    ))}
                </select>
              </div>
      
              <div>
                <label>Tipo:</label>
                <select
                  className="form-select"
                  name="tipo"
                  value={formulario.tipo}
                  onChange={manejarCambio}
                  required
                >
                  <option value="">Seleccione tipo</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="procedimiento">Procedimiento</option>
                </select>
              </div>
      
              <div>
                <label>Fecha:</label>
                <input
                  type="date"
                  name="fecha"
                  className="form-control"
                  value={formulario.fecha}
                  onChange={manejarCambio}
                  required
                />
              </div>
      
              <div>
                <label>Hora:</label>
                <select
                  className="form-select"
                  value={formulario.hora || ""}
                  onChange={(e) => setFormulario({ ...formulario, hora: e.target.value })}
                  required
                >
                  <option value="">Seleccione una hora</option>
                  {["08:00", "09:00", "10:00", "11:00", "12:00"].map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </div>
      
              <div>
                <label>Observaciones:</label>
                <input
                  type="text"
                  name="observaciones"
                  className="form-control"
                  value={formulario.observaciones}
                  onChange={manejarCambio}
                />
              </div>
      
              <button type="submit" className="btn btn-primary">
                Registrar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/")}
              >
                Cancelar
              </button>
            </Form>
        </div>
    )
}
export  default EditarCitas;