import React from "react";
import "../css/Home.css";
import BrandSlider from "../utils/BrandSlider.jsx";
import { Link } from "react-router-dom";
import { FaToolbox, FaTools } from "react-icons/fa";
import { FcSettings, FcShipped } from "react-icons/fc";
import ImageCarousel from "../utils/ImageCarousel.jsx";
import OfertasDestacadas from "../destacadas/OfertasDestacadas.jsx";
import MosaicBanner from "../components/MosaicBanner.jsx";
import ManualesDestacadas from "../destacadas/ManualesDestacadas.jsx";
import ElectricasDestacadas from "../destacadas/ElectricasDestacadas.jsx";

const Home = () => {
  return (
    <div>
      {/* BANNER HOME */}
      <div className="home-banner">
        {/* <ImageCarousel /> */}
        <MosaicBanner
          images={{
            topLeft: {
              src: "https://res.cloudinary.com/dn4lt8fhc/image/upload/v1790002630/solucion.jpg",
              alt: "Descuentos",
              href: "/contacto",
            },
            bottomLeft: {
              src: "https://res.cloudinary.com/dn4lt8fhc/image/upload/v1790002630/cotiza.jpg",
              alt: "Armá tu setup",
              href: "/contacto",
            },
            center: {
              src: "https://res.cloudinary.com/dn4lt8fhc/image/upload/v1790002161/promo-1.png",
              alt: "Banner Obrero",
              href: "/productos?page=1&marca=Ronix&search=kit",
            },
            topRight: { src: "https://res.cloudinary.com/dn4lt8fhc/image/upload/v1790002630/catalogo.jpg", alt: "Catálogo", href: "/productos?page=1" },
            bottomRight: { src: "https://res.cloudinary.com/dn4lt8fhc/image/upload/v1790002630/enviosBanner.jpg", alt: "Envíos gratis", href: "/faq" },
          }}
        />
      </div>
      <BrandSlider />

        <div className="container-caja-herramientas">
          <OfertasDestacadas />
        </div>
        <div className="container-caja-herramientas">
            <ElectricasDestacadas />
        </div>
        <div className="container-caja-herramientas">
          <ManualesDestacadas />
        </div>

      </div>
  );
};

export default Home;
