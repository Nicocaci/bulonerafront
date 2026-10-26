import React from "react";
import "../css/MosaicBanner.css";
import { cldSrcSet, cldUrl } from "../utils/imageUtils.js";

// El banner está arriba de todo: sus imágenes no esperan al scroll (antes eran lazy y
// demoraban la carga), y la principal se pide primero porque es lo más grande que se ve.
// Anchos: la principal ocupa media pantalla en desktop y todo el ancho en mobile;
// las laterales, un cuarto en desktop y media pantalla en mobile.
const ANCHO_PRINCIPAL = 800;
const ANCHO_LATERAL = 400;
const SIZES_PRINCIPAL = "(max-width: 768px) 100vw, 640px";
const SIZES_LATERAL = "(max-width: 768px) 50vw, 320px";

function Tile({ item, positionClass, placeholderLabel, principal = false }) {
  const ancho = principal ? ANCHO_PRINCIPAL : ANCHO_LATERAL;
  const content = item?.src ? (
    <img
      src={cldUrl(item.src, ancho)}
      srcSet={cldSrcSet(item.src, ancho)}
      sizes={principal ? SIZES_PRINCIPAL : SIZES_LATERAL}
      alt={item.alt || ""}
      className="tileImg"
      fetchpriority={principal ? "high" : undefined}
    />
  ) : (
    <div className="placeholder">{placeholderLabel}</div>
  );

  const className = `tile ${positionClass}`;

  if (item?.href) {
    return (
      <a href={item.href} className={className}>
        {content}
        <div className="tileOverlay" />
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function MosaicBanner({ images = {} }) {
  const { topLeft, bottomLeft, center, topRight, bottomRight } = images;

  return (
    <div className="mosaicBanner">
      <div className="mosaicGrid">
        <Tile item={topLeft} positionClass="topLeft" placeholderLabel="Imagen 1" />
        <Tile item={bottomLeft} positionClass="bottomLeft" placeholderLabel="Imagen 2" />
        <Tile item={center} positionClass="center" placeholderLabel="Imagen principal" principal />
        <Tile item={topRight} positionClass="topRight" placeholderLabel="Imagen 4" />
        <Tile item={bottomRight} positionClass="bottomRight" placeholderLabel="Imagen 5" />
      </div>
    </div>
  );
}