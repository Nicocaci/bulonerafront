import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/pagination";

/**
 * Hook simple para detectar si estamos en viewport mobile.
 */
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false,
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};

/**
 * Magnifier estilo Mercado Libre / Amazon:
 * - La imagen original queda intacta, tal cual.
 * - Al hacer hover aparece un panel aparte (a la derecha) con la zona
 *   ampliada, siguiendo la posición del mouse.
 * - No usa ninguna librería externa: es CSS + background-position.
 */
const DesktopMagnifier = ({ src, alt, className, zoomLevel = 2.5 }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });
  const wrapperRef = useRef(null);

  // Tamaño de la "lupa" (recuadro sobre la imagen original) como % del contenedor.
  const lensSizePercent = 100 / zoomLevel;

  const handleMouseMove = (e) => {
    const rect = wrapperRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    const half = lensSizePercent / 2;
    x = Math.min(Math.max(x, half), 100 - half);
    y = Math.min(Math.max(y, half), 100 - half);

    setLensPos({ x: x - half, y: y - half });
    setBgPos({ x, y });
  };

  return (
    <div
      className="desktop-magnifier-wrapper"
      ref={wrapperRef}
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img src={src} alt={alt} className={className} />

      {showZoom && (
        <>
          {/* Recuadro que sigue al mouse sobre la imagen original */}
          <div
            className="magnifier-lens"
            style={{
              width: `${lensSizePercent}%`,
              height: `${lensSizePercent}%`,
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
            }}
          />
          {/* Panel aparte con la imagen ampliada */}
          <div className="magnifier-zoom-pane">
            <div
              className="magnifier-zoom-pane-inner"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Visor mobile estilo Mercado Libre:
 * - Slider horizontal entre TODAS las imágenes del producto (Swiper).
 * - Zoom (pinch / doble-tap) dentro de cada slide, vía el módulo Zoom de Swiper.
 * - Mientras está zoomeado, Swiper desactiva el swipe entre slides, así no
 *   se pelean los dos gestos (eso es lo que causaba el "se mueve todo").
 * - Sincroniza el slide activo con las thumbnails de abajo, en ambas direcciones:
 *   tocar una thumbnail mueve el slider, y deslizar el slider resalta la thumbnail.
 *
 * Props:
 * - images: string[] (urls ya resueltas de todas las imágenes del producto)
 * - initialIndex: number (índice seleccionado desde afuera, ej. al tocar una thumbnail)
 * - onIndexChange: (index: number) => void (avisa al padre cuando el usuario swipea)
 * - alt: string
 * - className: clase para cada <img>, mantiene tus estilos existentes
 */
const MobileGallery = ({ images, initialIndex = 0, onIndexChange, alt, className }) => {
  const swiperRef = useRef(null);

  // Si el padre cambia el índice (usuario tocó una thumbnail), movemos el swiper.
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.activeIndex !== initialIndex) {
      swiperRef.current.slideTo(initialIndex);
    }
  }, [initialIndex]);

  return (
    <div className="mobile-zoom-container">
      <Swiper
        modules={[Zoom, Pagination]}
        zoom={{ maxRatio: 3 }}
        pagination={{ clickable: true }}
        initialSlide={initialIndex}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => onIndexChange?.(swiper.activeIndex)}
        className="mobile-gallery-swiper"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="swiper-zoom-container">
              <img
                className={className}
                src={img}
                alt={`${alt} - ${i + 1}`}
                onError={(e) => {
                  e.target.src = "/vite.svg";
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

/**
 * Visor de imagen con zoom responsivo:
 * - Desktop: magnifier estilo Mercado Libre (panel aparte, imagen original intacta).
 * - Mobile: slider entre imágenes + zoom por pinch/doble-tap dentro de cada slide.
 *
 * Props:
 * - src: string — imagen actual para DESKTOP (la que ya usabas)
 * - images: string[] — todas las imágenes del producto, para MOBILE
 * - initialIndex: number — índice actualmente seleccionado (sync con thumbnails)
 * - onIndexChange: (index: number) => void — se dispara al swipear en mobile
 * - alt: string
 * - className: clase para la imagen base (mantiene tus estilos existentes)
 */
const ImageZoomViewer = ({
  src,
  images = [],
  initialIndex = 0,
  onIndexChange,
  alt,
  className = "img-item-detail",
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    if (!images.length) return null;
    return (
      <MobileGallery
        images={images}
        initialIndex={initialIndex}
        onIndexChange={onIndexChange}
        alt={alt}
        className={className}
      />
    );
  }

  if (!src) return null;

  return (
    <DesktopMagnifier src={src} alt={alt} className={className} zoomLevel={2.5} />
  );
};

export default ImageZoomViewer;