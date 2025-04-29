import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function Control() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/iniciarsesion") {
      document.body.className = "hold-transition login-page";
    } else if (location.pathname === "/registrar") {
      document.body.className = "hold-transition register-page";
    } else {
      document.body.className = "hold-transition sidebar-mini";
    }
  }, [location.pathname]);
  return null;
}
export default Control;
