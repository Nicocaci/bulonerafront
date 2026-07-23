import React from "react";
import axiosInstance from "../utils/axiosConfig.js";
import "../css/OfertasDestacadas.css";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils.js";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CategoriaSeccion = () => {
  const navigate = useNavigate();
  const {
    data: productos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["herramientas-manuales"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/products", {
        params: {
          category: "Herramientas Manuales",
          limit: 20, // opcional, si querés mostrar más de 6
        },
      });

      return data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <div className="ofertas-loading">Cargando productos...</div>;
  }

  if (isError) {
    return <div className="ofertas-error">Error al cargar productos</div>;
  }
  console.log(productos);
  return (
    <div>
      <div className="ofertas-header">
        <h2 className="titulo-ofertas">HERRAMIENTAS MANUALES</h2>
        <p className="subtitulo-ofertas">Herramientas de confianza para trabajar sin límites.</p>
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
          {productos.map((producto) => (
            <SwiperSlide key={producto._id}>
              <Link to={`/producto/${producto._id}`} className="link-none">
                <div className="oferta-card">
                  <div className="img-container">
                  <img
                    className="oferta-image"
                    src={getImageUrl(producto.imagen?.[0])}
                    alt={producto.item}
                  />
                  </div>
                  <div className="titulo-oferta-container">
                    <p className="oferta-title">{producto.item}</p>

                    <p className="oferta-price">
                      ${producto.precioConIva.toLocaleString("es-AR")}
                    </p>
                  <div className="btn-container">
                    <button
                      className="btn-ver-producto"
                      onClick={() => navigate(`/producto/${producto._id}`)}
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
        <Link
          to="/productos?categoria=Herramientas%20Manuales"
          className="ver-todas-link"
        >
          Ver todos los productos
        </Link>
      </div>
    </div>
  );
};

export default CategoriaSeccion;
