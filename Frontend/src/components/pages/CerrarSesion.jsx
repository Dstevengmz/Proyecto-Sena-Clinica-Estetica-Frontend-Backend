
export function cerrarSesion(navigate) {
    localStorage.removeItem("token");
    navigate("/");
  }