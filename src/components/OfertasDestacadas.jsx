import React from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig.js";
import Carousel from "../utils/OfertasCarruse.jsx";
import "../css/OfertasDestacadas.css";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils.js";

const OfertasDestacadas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const response = await axiosInstance.get("/api/products/ofertas");
        setOfertas(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ofertas:", error);
        setLoading(false);
      }
    };
    fetchOfertas();
  }, []);

  if (loading) {
    return <div className="ofertas-loading">Cargando ofertas...</div>;
  }
  return (
    <div>
      <div className="ofertas-container">
        <h2 className="center">
            OFERTAS DESTACADAS
        </h2>
        <Carousel interval={3000}>
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
              />
              <h3 className="oferta-title">{oferta.item}</h3>
              <p className="oferta-price">${oferta.precio.toLocaleString()}</p>
            </Link>
          ))}
        </Carousel>
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
