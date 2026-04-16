import React from "react";
import "../css/Home.css";
import ProductosDestacados from "../components/ProductosDestacados.jsx";
import BrandSlider from "../utils/BrandSlider.jsx";
import { Link } from "react-router-dom";
import { FaToolbox, FaTools } from "react-icons/fa";
import { FcSettings, FcShipped } from "react-icons/fc";
import ImageCarousel from "../utils/ImageCarousel.jsx";
import OfertasDestacadas from "../components/OfertasDestacadas.jsx";


const Home = () => {
  return (
    <div>
      {/* BANNER HOME */}
      <div className="home-banner">
        <ImageCarousel />
      </div>

      <BrandSlider />

      <div className="container-destacado">
        {/* CATEGORIA DE HERRAMIENTAS */}
        <div className="container-herramientas">
          <p className="titulo-herramientas">CATEGORÍA DE HERRAMIENTAS</p>
          <div className="grid-herramientas">
            <Link className="link-home" to="/productos?categoria=manuales">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/manuales.png"
                  alt="herramientas"
                />
                <p className="descripcion-herramientas">MANUALES</p>
              </div>
            </Link>

            <Link className="link-home" to="/productos?categoria=motorizadas">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/motorizadas.png"
                  alt="herramientas motorizadas"
                />
                <p className="descripcion-herramientas">MOTORIZADAS</p>
              </div>
            </Link>

            <Link className="link-home" to="/productos?categoria=insumos">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/insumos.png"
                  alt="herramientas motorizadas"
                />
                <p className="descripcion-herramientas">INSUMOS</p>
              </div>
            </Link>

            <Link className="link-home" to="/productos?categoria=motorizadas">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/seguridad.png"
                  alt="herramientas motorizadas"
                />
                <p className="descripcion-herramientas">SEGURIDAD INDUSTRIAL</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="container-caja-herramientas">
            <OfertasDestacadas/>
        </div>
        
        {/* <div className="pd-container">
          <ProductosDestacados />
        </div> */}

      </div>
    </div>
  );
};

export default Home;
