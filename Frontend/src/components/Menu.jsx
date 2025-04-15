import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Registrar from "./Registrar";

function Menu(){
    return(
        <Router>
        <Routes>
            <Route path="/registrar" element={<Registrar />} />
        </Routes>
      </Router>
    );
}
export default Menu;