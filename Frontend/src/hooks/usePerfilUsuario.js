import { useState, useEffect } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import { jwtDecode } from "jwt-decode";

export function usePerfilUsuario() {
  const [usuario, setUsuario] = useState({});
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem("token");
  let rol = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      rol = decoded.rol;
    } catch {
      rol = null;
    }
  }
  useEffect(() => {
    async function obtenerPerfil() {
      if (!token) {
        setUsuario({});
        setCargando(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/apiusuarios/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(response.data.usuario);
      } catch (error) {
        console.error("Error al obtener perfil de usuario", error);
        setUsuario({});
      } finally {
        setCargando(false);
      }
    }
    obtenerPerfil();
  }, [token]);

  return { usuario, cargando, rol };
}
