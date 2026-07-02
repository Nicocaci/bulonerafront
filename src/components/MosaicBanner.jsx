import React from "react";
import "../css/MosaicBanner.css";

function Tile({ item, positionClass, placeholderLabel }) {
  const content = item?.src ? (
    <img
      src={item.src}
      alt={item.alt || ""}
      className="tileImg"
      loading="lazy"
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
        <Tile item={center} positionClass="center" placeholderLabel="Imagen principal" />
        <Tile item={topRight} positionClass="topRight" placeholderLabel="Imagen 4" />
        <Tile item={bottomRight} positionClass="bottomRight" placeholderLabel="Imagen 5" />
      </div>
    </div>
  );
}