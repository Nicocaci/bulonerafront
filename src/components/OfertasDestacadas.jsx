import React from "react";
import axiosInstance from "../utils/axiosConfig.js";
import "../css/OfertasDestacadas.css";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils.js";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
    const diff = precioConIva - precioFinal;
    return diff.toLocaleString("es-AR");
  };

  if (isLoading) {
    return <div className="ofertas-loading">Cargando ofertas...</div>;
  }

  if (isError) {
    return <div className="ofertas-error">Error al cargar ofertas</div>;
  }

  return (
    <div>
      <div className="ofertas-header">
        <h2 className="titulo-ofertas">OFERTAS DESTACADAS</h2>
        <p className="subtitulo-ofertas">Los mejores precios del momento, por tiempo limitado.</p>
      </div>

      <div className="ofertas-wrapper">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
          }}
          pagination={{
            el: ".swiper-pagination",
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 2, // en mobile chico se ven 1 y media, invita a deslizar
              spaceBetween: 12,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
            1440: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
            1920: {
              slidesPerView: 5,
              spaceBetween: 16,
            },
          }}
          className="ofertas-swiper"
        >
          {ofertas.map((oferta) => (
            <SwiperSlide key={oferta._id}>
              <Link to={`/producto/${oferta._id}`} className="link-none">
                <div className="oferta-card">
                  <div className="img-container">
                  <img
                    className="oferta-image"
                    src={getImageUrl(oferta.imagen?.[0])}
                    alt={oferta.item}
                    loading="lazy"
                  />
                  </div>
                  <div className="titulo-oferta-container">
                    <p className="descuento">-{oferta.oferta.descuento}%</p>
                    <div className="titulo-oferta-container">
                      <p className="oferta-title">{oferta.item}</p>
                    </div>
                    <p className="oferta-price-base">
                      ${oferta.precioConIva.toLocaleString("es-AR")}
                    </p>
                    <p className="oferta-price">
                      ${oferta.precioFinal.toLocaleString("es-AR")}
                    </p>
                    <p className="ahorro">
                      Ahorrás ${ahorro(oferta.precioConIva, oferta.precioFinal)}
                    </p>
                  
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
                </div>
              </Link>
            </SwiperSlide>
          ))}

          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
          <div className="swiper-pagination"></div>
        </Swiper>
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
