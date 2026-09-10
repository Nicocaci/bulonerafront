import React, { useState, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
 * Visor de imagen con zoom responsivo:
 * - Desktop: magnifier estilo Mercado Libre (panel aparte, imagen original intacta).
 * - Mobile: zoom por pinch/doble-tap (react-zoom-pan-pinch).
 *
 * Props:
 * - src: string (url de la imagen a mostrar, ya validada/con fallback resuelto)
 * - alt: string
 * - className: clase para la imagen base (mantiene tus estilos existentes)
 */
const ImageZoomViewer = ({ src, alt, className = "img-item-detail" }) => {
  const isMobile = useIsMobile();

  if (!src) return null;

  if (isMobile) {
    return (
      <div className="mobile-zoom-container">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          doubleClick={{ mode: "toggle" }}
          pinch={{ step: 5 }}
          wheel={{ disabled: true }}
        >
          <TransformComponent
            wrapperClass="mobile-zoom-wrapper"
            contentClass="mobile-zoom-content"
          >
            <img className={className} src={src} alt={alt} />
          </TransformComponent>
        </TransformWrapper>
      </div>
    );
  }

  return (
    <DesktopMagnifier src={src} alt={alt} className={className} zoomLevel={2.5} />
  );
};

export default ImageZoomViewer;