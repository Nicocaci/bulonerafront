import axiosInstance from "../utils/axiosConfig.js";
import "../css/OfertasDestacadas.css";
import { Link } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto.jsx";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BREAKPOINTS_DEFAULT = {
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
};

const ProductosDestacados = ({
  id,
  titulo,
  subtitulo,
  filtros = {},
  linkVerTodos,
  limit = 20,
  productosIniciales, // si se pasa, se muestran estos productos y no se consulta la API
  className = "",
  breakpoints = BREAKPOINTS_DEFAULT,
}) => {
  const {
    data: productosApi = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["catalogo", "destacados", filtros, limit],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/products", {
        params: { ...filtros, limit, vista: "resumen" },
      });
      return data.products;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !productosIniciales,
  });
  const productos = productosIniciales ?? productosApi;

  if (isLoading) {
    return <div className="ofertas-loading">Cargando productos...</div>;
  }

  if (isError) {
    return <div className="ofertas-error">Error al cargar productos</div>;
  }

  if (productos.length === 0) return null; // no muestra la sección si está vacía

  return (
    <div className={className}>
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
          breakpoints={breakpoints}
          className="ofertas-swiper"
        >
          {productos.map((producto) => (
            <SwiperSlide key={producto._id}>
              <TarjetaProducto producto={producto} />
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
