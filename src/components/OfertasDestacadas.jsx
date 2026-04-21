import React from "react";
import axiosInstance from "../utils/axiosConfig.js";
import "../css/OfertasDestacadas.css";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils.js";
import { useQuery } from "@tanstack/react-query";

const OfertasDestacadas = () => {

  const {
    data: ofertas = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ["ofertas"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/products/ofertas");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

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
            <Link
              key={oferta._id}
              to={`/productos/${oferta._id}`}
              className="oferta-card"
            >
              <img
                className="oferta-image"
                src={getImageUrl(oferta.imagen?.[0])}
                alt={oferta.item}
                loading="lazy"
              />
              <h3 className="oferta-title">{oferta.item}</h3>
              <p className="oferta-price">
                ${oferta.precio.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="ofertas-footer">
        <Link to="/productos?categoria=ofertas" className="ver-todas-link">
          Ver todas las ofertas
        </Link>
      </div>
    </div>
  );
};

export default OfertasDestacadas;