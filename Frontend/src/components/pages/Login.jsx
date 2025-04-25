import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
function Login() {
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState({
        correo: "",
        contrasena: "",
    });

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario({
            ...formulario,
            [name]: value,
        });
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        try {
            const respuesta = await axios.post(`${API_URL}/apiusuarios/iniciarsesion`, formulario);
            console.log("Respuesta del servidor:", respuesta.data);
            const { token, usuario } = respuesta.data;
            if (token) {
                localStorage.setItem("token", token);
                alert("Inicio de sesión exitoso");
                navigate("/dashboard"); 
            } else {
                alert("Token no recibido. Redirigiendo a página de error.");
                navigate("/");
            } 
        } catch (error) {
            console.log("Error con las credenciales",error)
            console.error("Error al iniciar sesión:");
            alert("Correo o Contraseña incorrectos");
        }
    };
    return(
    <Form onSubmit={manejarEnvio}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Correo Electrónico</Form.Label>
        <Form.Control type="email" placeholder="Correo Electrónico" name="correo" className="form-control" value={formulario.correo} onChange={manejarCambio} required/>
        <Form.Text className="text-muted">
        </Form.Text>
    </Form.Group>
    <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control type="password" placeholder="Contraseña" name="contrasena" className="form-control" value={formulario.contrasena} onChange={manejarCambio} required/>
    </Form.Group>
    <Button variant="primary" type="submit">
        Iniciar Sesión
    </Button>
</Form>

    )
}
export default Login;