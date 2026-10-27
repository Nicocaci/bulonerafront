import { Link } from "react-router-dom";
import {
  ANCHO_TARJETA,
  SIZES_TARJETA,
  cldSrcSet,
  getImageUrl,
  usarPlaceholder,
} from "../utils/imageUtils.js";
import "../css/TarjetaProducto.css";

const pesos = (n) => `$${Number(n || 0).toLocaleString("es-AR")}`;

// Tarjeta de producto del catálogo y de los carruseles (antes cada lugar tenía la suya).
// La foto se muestra entera sobre fondo blanco (antes se estiraba para llenar el cuadro).
const TarjetaProducto = ({ producto }) => {
  const imagen = Array.isArray(producto.imagen) ? producto.imagen[0] : producto.imagen;
  const enOferta = Boolean(producto.ofertaVigente);
  const sinStock = producto.stock === 0;

  return (
    <Link to={`/producto/${producto._id}`} className="tarjeta-producto">
      <div className="tarjeta-producto__foto">
        <img
          src={getImageUrl(imagen, ANCHO_TARJETA)}
          srcSet={cldSrcSet(getImageUrl(imagen), ANCHO_TARJETA)}
          sizes={SIZES_TARJETA}
          alt={producto.item}
          onError={usarPlaceholder}
          loading="lazy"
          decoding="async"
        />
        {enOferta && (
          <span className="tarjeta-producto__descuento">-{producto.oferta?.descuento}%</span>
        )}
      </div>
      <div className="tarjeta-producto__info">
        <span className="tarjeta-producto__marca">{producto.marca}</span>
        <span className="tarjeta-producto__nombre">{producto.item}</span>
        <div className="tarjeta-producto__precios">
          {enOferta && (
            <span className="tarjeta-producto__precio-anterior">{pesos(producto.precioConIva)}</span>
          )}
          <span className="tarjeta-producto__precio">
            {pesos(enOferta ? producto.precioFinal : producto.precioConIva)}
          </span>
          <span className="tarjeta-producto__iva">IVA incluido</span>
        </div>
        {sinStock && <span className="tarjeta-producto__sin-stock">Sin stock</span>}
      </div>
    </Link>
  );
};

export default TarjetaProducto;
