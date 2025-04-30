
function CerrarSesion(navigate) {
  localStorage.removeItem("token");
  navigate("/");
}
export default CerrarSesion;
