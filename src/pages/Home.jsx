import React from "react";
import "../css/Home.css";
import BrandSlider from "../utils/BrandSlider.jsx";
import { Link } from "react-router-dom";
import { FaToolbox, FaTools } from "react-icons/fa";
import { FcSettings, FcShipped } from "react-icons/fc";
import ImageCarousel from "../utils/ImageCarousel.jsx";
import OfertasDestacadas from "../components/OfertasDestacadas.jsx";
import MosaicBanner from "../components/MosaicBanner.jsx";
import CategoriaSeccion from "../components/CategoriaSeccion.jsx";

const Home = () => {
  return (
    <div>
      {/* BANNER HOME */}
      <div className="home-banner">
        {/* <ImageCarousel /> */}
        <MosaicBanner
          images={{
            topLeft: {
              src: "/fondo-automotor.png",
              alt: "Descuentos",
              href: "/ofertas",
            },
            bottomLeft: {
              src: "/fondo-fijaciones.png",
              alt: "Armá tu setup",
              href: "/armar-pc",
            },
            center: {
              src: "/KIT_CARPINTERO.jpg",
              alt: "Producto destacado",
              href: "/producto",
            },
            topRight: { src: "/fondo-herrameintas.png", alt: "Accesorios", href: "/accesorios" },
            bottomRight: { src: "/fondo-buloneria.png", alt: "Envíos gratis", href: "/envios" },
          }}
        />
      </div>
      <BrandSlider />

      <div className="container-destacado">
        {/* CATEGORIA DE HERRAMIENTAS */}
        {/* <div className="container-herramientas">
          <p className="titulo-herramientas">CATEGORÍA DE HERRAMIENTAS</p>
          <div className="grid-herramientas">
            <Link className="link-home" to="/productos?categoria=Buloneria">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/fondo-buloneria.png"
                  alt="Bulonería"
                />
                <p className="descripcion-herramientas">BULONERÍA</p>
              </div>
            </Link>

            <Link className="link-home" to="/productos?categoria=Fijaciones">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/fondo-fijaciones.png"
                  alt="Fijaciones"
                />
                <p className="descripcion-herramientas">FIJACIONES</p>
              </div>
            </Link>

            <Link className="link-home" to="/productos?categoria=Herramientas">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/fondo-herrameintas.png"
                  alt="Herramientas"
                />
                <p className="descripcion-herramientas">HERRAMIENTAS</p>
              </div>
            </Link>

            <Link
              className="link-home"
              to="/productos?categoria=Seguridad-industrial"
            >
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/fondo-seguridad.png"
                  alt="Seguridad Industrial"
                />
                <p className="descripcion-herramientas">SEGURIDAD INDUSTRIAL</p>
              </div>
            </Link>

            <Link className="link-home" to="/productos?categoria=Construccion">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/fondo-construccion.png"
                  alt="Construcción"
                />
                <p className="descripcion-herramientas">CONSTRUCCIÓN</p>
              </div>
            </Link>

            <Link className="link-home" to="/productos?categoria=Automotor">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/fondo-automotor.png"
                  alt="Automotor"
                />
                <p className="descripcion-herramientas">AUTOMOTOR</p>
              </div>
            </Link>

            <Link className="link-home" to="/productos?categoria=kits">
              <div className="grid">
                <img
                  className="img-herramientas"
                  src="/fondo-kits.png"
                  alt="Kits"
                />
                <p className="descripcion-herramientas">KITS</p>
              </div>
            </Link>
          </div>
        </div> */}

        <div className="container-caja-herramientas">
          <OfertasDestacadas />
        </div>
        <div className="container-caja-herramientas">
          <CategoriaSeccion />
        </div>
      </div>
    </div>
  );
};

export default Home;
