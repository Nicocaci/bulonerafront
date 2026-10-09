import axiosInstance from "../utils/axiosConfig.js";
import "../css/OfertasDestacadas.css";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils.js";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { MdVerified } from "react-icons/md";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProductosDestacados = ({
  id,
  titulo,
  subtitulo,
  filtros = {},
  linkVerTodos,
  limit = 20,
}) => {
  const {
    data: productos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["productos-destacados", filtros, limit],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/products", {
        params: { ...filtros, limit },
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

  if (productos.length === 0) return null; // no muestra la sección si está vacía

  return (
    <div>
      <div className="ofertas-header">
        <h2 className="titulo-ofertas">{titulo}</h2>
        {subtitulo && <p className="subtitulo-ofertas">{subtitulo}</p>}
      </div>

      <div className="ofertas-wrapper">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            prevEl: `.prev-${id}`,
            nextEl: `.next-${id}`,
          }}
          pagination={{
                el: `.pagination-${id}`,
                clickable: true,
                dynamicBullets: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            stopOnLastSlide: false,
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
                      loading="lazy"
                    />
                  </div>
                  <div className="product-card-description">
                    <p className="product-card-text">{producto.item}</p>
                    <div className="product-marca-container">
                      <p className="product-marca">{producto.marca}</p>
                      <MdVerified className="verified-icon" />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: 4,
                      }}
                    >
                      {producto.oferta?.activa ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <p className="product-price-tachado">
                              ${producto.precioConIva.toLocaleString("es-AR")}
                            </p>
                            <p className="product-price">
                              ${producto.precioFinal.toLocaleString("es-AR")}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                            }}
                          >
                            <span className="product-oferta-badge">
                              -{producto.oferta.descuento}%
                            </span>
                            <p className="product-iva">IVA inc.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="product-price">
                            ${producto.precioConIva.toLocaleString("es-AR")}
                          </p>
                          <p className="product-iva">IVA inc.</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}

          <div className={`swiper-button-prev prev-${id}`}></div>
          <div className={`swiper-button-next next-${id}`}></div>
          <div className={`swiper-pagination pagination-${id}`}></div>
        </Swiper>
      </div>

      {linkVerTodos && (
        <div className="ofertas-footer">
          <Link to={linkVerTodos} className="ver-todas-link">
            Ver todos los productos
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductosDestacados;
