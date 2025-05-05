
function CerrarSesion(navigate) {
  localStorage.removeItem("token");
  navigate("/iniciarsesion");
}
export default CerrarSesion;
