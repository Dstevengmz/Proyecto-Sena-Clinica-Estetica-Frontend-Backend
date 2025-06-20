// src/pages/Reservar.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";

const API_URL = import.meta.env.VITE_API_URL;

function Reservar() {
  const { id } = useParams();
  const [procedimiento, setProcedimiento] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/apiprocedimientos/buscarprocedimiento/${id}`)
      .then((res) => setProcedimiento(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    $(".product-image-thumb").on("click", function () {
      const $img = $(this).find("img");
      $(".product-image").prop("src", $img.attr("src"));
      $(".product-image-thumb.active").removeClass("active");
      $(this).addClass("active");
    });
  }, [procedimiento]);

  if (!procedimiento) {
    return <p className="text-center mt-5">Cargando procedimiento...</p>;
  }

  return (
    <div className="container mt-5">
      <div className="card card-solid">
        <div className="card-body">
          <div className="row">
            <div className="col-12 col-sm-6">
              <div className="col-12">
                <img
                  src={`${API_URL}/${procedimiento.imagen}`}
                  className="product-image"
                  alt="Imagen del procedimiento"
                />
              </div>
              <div className="col-12 product-image-thumbs d-flex">
                <div className="product-image-thumb active">
                  <img src={`${API_URL}/${procedimiento.imagen}`} alt="Mini" />
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <h3 className="my-3">{procedimiento.nombre}</h3>
              <p>{procedimiento.descripcion}</p>

              <h4 className="mt-3">Categoría</h4>
              <p>{procedimiento.categoria}</p>

              <div className="bg-gray py-2 px-3 mt-4">
                <h2 className="mb-0">
                  {Number(procedimiento.precio).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  })}
                </h2>
                <h4 className="mt-0">
                  <small>Duración: {procedimiento.duracion} minutos</small>
                </h4>
              </div>

              <div className="mt-4">
                <button className="btn btn-primary btn-lg btn-flat">
                  <i className="fas fa-cart-plus fa-lg mr-2" />
                  Reservar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reservar;
