import React from "react";
import "../css/Home.css";
import BrandSlider from "../utils/BrandSlider.jsx";
import MosaicBanner from "../components/MosaicBanner.jsx";
import ProductosDestacados from "../destacadas/ProductosDestacados.jsx";

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
            topRight: {
              src: "https://res.cloudinary.com/dn4lt8fhc/image/upload/v1790002630/catalogo.jpg",
              alt: "Catálogo",
              href: "/productos?page=1",
            },
            bottomRight: {
              src: "https://res.cloudinary.com/dn4lt8fhc/image/upload/v1790002630/enviosBanner.jpg",
              alt: "Envíos gratis",
              href: "/faq",
            },
          }}
        />
      </div>
      <BrandSlider />

      <div className="container-caja-herramientas">
        <ProductosDestacados
          id="ronix"
          titulo="RONIX"
          limit={50}
          filtros={{ marca: "Ronix" }}
          subtitulo="Toda la linea Ronix en un solo lugar."
          linkVerTodos="/productos"
        />
        <ProductosDestacados
          id="herramientas-electricas"
          titulo="HERRAMIENTAS ELÉCTRICAS"
          limit={50}
          filtros={{ category: "Herramientas Electricas" }}
          subtitulo="Descubre nuestra selección de herramientas más populares"
          linkVerTodos="/productos"
        />
        <ProductosDestacados
          id="soldadura"
          titulo="SOLDADURA"
          limit={50}
          filtros={{ category: "Soldadura" }}
          subtitulo="Descubre nuestra selección de herramientas más populares"
        />
        <ProductosDestacados
          id="herramientas-manuales"
          titulo="HERRAMIENTAS MANUALES"
          limit={50}
          filtros={{ category: "Herramientas Manuales" }}
          subtitulo="Descubre nuestra selección de herramientas más populares"
          linkVerTodos="/productos"
        />
      </div>
    </div>
  );
};

export default Home;
