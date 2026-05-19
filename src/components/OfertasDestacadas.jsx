import React from "react";
import axiosInstance from "../utils/axiosConfig.js";
import "../css/OfertasDestacadas.css";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils.js";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const OfertasDestacadas = () => {
  const navigation = useNavigate();
  const {
    data: ofertas = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ofertas"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/products/ofertas");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });


  const ahorro = (precioConIva, precioFinal) => {
    const ahorro = precioConIva - precioFinal;
    console.log(ahorro);
    return ahorro.toLocaleString('es-AR');
  }

  if (isLoading) {
    return <div className="ofertas-loading">Cargando ofertas...</div>;
  }

  if (isError) {
    return <div className="ofertas-error">Error al cargar ofertas</div>;
  }

  return (
    <div>
      <h2 className="titulo-ofertas">OFERTAS DESTACADAS</h2>

      <div className="ofertas-container">
        <div className="ofertas-slider">
          {ofertas.map((oferta) => (
            <div key={oferta._id} className="oferta-card">
              <img
                className="oferta-image"
                src={getImageUrl(oferta.imagen?.[0])}
                alt={oferta.item}
                loading="lazy"
              />
              <div className="titulo-oferta-container">
                <p className="descuento">-{oferta.oferta.descuento}%</p>
                <div className="titulo-oferta-container">
                  <p className="oferta-title">{oferta.item}</p>
                  <p className="oferta-description">
                    {oferta.descripcion.split("\n")[0]}
                  </p>
                </div>
                <p className="oferta-price-base">
                  ${oferta.precioConIva.toLocaleString('es-AR')}
                </p>
                <p className="oferta-price">
                  ${oferta.precioFinal.toLocaleString('es-AR')}
                </p>
                <p className="ahorro">
                  Ahorrás ${ahorro(oferta.precioConIva, oferta.precioFinal)}
                </p>
              </div>
              <div className="btn-container">
                <button
                  className="btn-ver-producto"
                  onClick={() => {
                    navigation(`/producto/${oferta._id}`);
                  }}
                >
                  Ver producto
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ofertas-footer">
        <Link to="/productos?ofertas=true" className="ver-todas-link">
          Ver todas las ofertas
        </Link>
      </div>
    </div>
  );
};

export default OfertasDestacadas;
