import React, { useState, useEffect } from "react";
import { useProducto } from "../hooks/useCatalogo.js";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";
import {
  ANCHO_DETALLE,
  getImageUrl,
  PLACEHOLDER_PRODUCTO,
  usarPlaceholder,
} from "../utils/imageUtils";
import "../css/ItemDetail.css";
import Breadcrumb from "../components/Breadcrumb.jsx";
import ImageZoomViewer from "../components/ImageZoomViewer.jsx";
import GaleriaModal from "../components/GaleriaModal.jsx";
import ProductosRelacionados from "../destacadas/ProductosRelacionados.jsx";
import { getPrecioUnitario, formatearPrecio } from "../utils/precio.js";
import { urlWhatsapp } from "../utils/contacto.js";

const Icono = ({ children, size = 20 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// Miniaturas que entran en la columna de la galería. Si hay más fotos, la última
// muestra "+N" (las que faltan) y abre la galería completa.
const MAX_MINIATURAS = 5;

const formatearNumero = (n) => Number(n).toLocaleString("es-AR");

// Filas de especificaciones: solo las que el producto tiene cargadas
const armarEspecificaciones = (producto) => {
  const filas = [
    ["Marca", producto.marca],
    ["Categoría", producto.categoria],
    ["Subcategoría", producto.subcategoria],
    ["SKU", producto.sku],
  ];
  if (producto.peso != null) filas.push(["Peso", `${formatearNumero(producto.peso)} kg`]);
  if (producto.alto != null && producto.ancho != null && producto.largo != null) {
    filas.push([
      "Medidas",
      `${formatearNumero(producto.alto)} × ${formatearNumero(producto.ancho)} × ${formatearNumero(producto.largo)} cm (alto × ancho × largo)`,
    ]);
  }
  return filas.filter(([, valor]) => valor !== undefined && valor !== null && valor !== "");
};

const ItemDetail = () => {
  const { prodId } = useParams();
  const { data: producto, isLoading: loading, error: errorConsulta } = useProducto(prodId);
  const error = errorConsulta
    ? errorConsulta.response?.data?.message || "Error al cargar el producto"
    : null;
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenPrincipalValida, setImagenPrincipalValida] = useState(null);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);

  // URLs resueltas de todas las imágenes del producto, para el slider mobile.
  const imagenesUrls = (producto?.imagenes || []).map((img) =>
    getImageUrl(img, ANCHO_DETALLE),
  );
  const elegirImagen = (index) => {
    setIndiceSeleccionado(index);
    setImagenSeleccionada(imagenesUrls[index]);
  };
  const { addProductToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  // Lo que se ve en el campo: puede quedar vacío mientras se escribe
  // (antes no se podía borrar el número para escribir otro).
  const [cantidadTexto, setCantidadTexto] = useState("1");

  const fijarCantidad = (valor) => {
    const tope = Math.max(1, producto?.stock ?? 1);
    const normalizada = Math.min(Math.max(1, valor), tope);
    setCantidad(normalizada);
    setCantidadTexto(String(normalizada));
  };
  const [agregando, setAgregando] = useState(false);

  // Valida que la imagen principal cargue correctamente antes de pasarla
  // al visor de zoom (Magnify/pinch-zoom no reenvían onError de forma confiable).
  useEffect(() => {
    const urlCandidata =
      imagenSeleccionada ||
      (producto
        ? getImageUrl(producto.imagenes?.[0] || producto.imagen, ANCHO_DETALLE)
        : null);

    if (!urlCandidata) {
      setImagenPrincipalValida(null);
      return;
    }

    let cancelado = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelado) setImagenPrincipalValida(urlCandidata);
    };
    img.onerror = () => {
      if (!cancelado) setImagenPrincipalValida(PLACEHOLDER_PRODUCTO);
    };
    img.src = urlCandidata;

    return () => {
      cancelado = true;
    };
  }, [imagenSeleccionada, producto]);

  // Al llegar un producto (o cambiar de producto) se muestra su primera imagen
  const productoId = producto?._id;
  useEffect(() => {
    if (!productoId) return;
    const primeraImagen = producto.imagenes[0];
    setImagenSeleccionada(
      primeraImagen ? getImageUrl(primeraImagen, ANCHO_DETALLE) : null,
    );
    setIndiceSeleccionado(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoId]);

  const handleAddToCart = async (productId) => {
    if (agregando) return; // 🔒 bloquea clicks repetidos mientras hay una request en curso
    if (!cantidadTexto || !cantidad || cantidad < 1) {
      Swal.fire({
        icon: "warning",
        title: "Elegí una cantidad",
        text: "La cantidad debe ser al menos 1",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setAgregando(true);
    try {
      await addProductToCart(productId, cantidad, producto);
      Swal.fire({
        icon: "success",
        title: "Producto agregado al carrito",
        text: "El producto ha sido agregado al carrito correctamente",
        confirmButtonColor: "#28a745",
        timer: 2500,
        showConfirmButton: true,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo agregar",
        text: error.message || "Ocurrió un error al agregar el producto",
        confirmButtonColor: "#d33",
      });
    } finally {
      setAgregando(false);
    }
  };
  const descripcionFormateada = producto?.descripcion?.replace(/\\n/g, "\n");

  if (loading) {
    return <div className="item-cargando">Cargando...</div>;
  }

  if (error) {
    return <div className="detalle-mensaje">Error: {error}</div>;
  }

  if (!producto) {
    return <div className="detalle-mensaje">Producto no encontrado</div>;
  }

  const hayStock = producto.stock > 0;
  const variasImagenes = (producto.imagenes || []).length > 1;
  const especificaciones = armarEspecificaciones(producto);
  const mensajeWhatsapp = `Hola! Quiero consultar por ${producto.item} (SKU ${producto.sku})`;

  return (
    <div className={`detalle ${hayStock ? "detalle--con-barra" : ""}`}>
      {galeriaAbierta && (
        <GaleriaModal
          imagenes={imagenesUrls}
          indice={indiceSeleccionado}
          onCambiar={elegirImagen}
          onCerrar={() => setGaleriaAbierta(false)}
          titulo={producto.item}
        />
      )}
      <div className="detalle__interior">
        <Breadcrumb
          items={[
            { label: "Inicio", path: "/" },
            {
              label: producto.categoria,
              path: `/productos?categoria=${encodeURIComponent(producto.categoria)}`,
            },
            {
              label: producto.subcategoria,
              path: `/productos?categoria=${encodeURIComponent(producto.categoria)}&subcategoria=${encodeURIComponent(producto.subcategoria)}`,
            },
          ].filter((item) => item.label)}
        />

        <div className="detalle__principal">
          <div className={`detalle-galeria ${variasImagenes ? "" : "detalle-galeria--una"}`}>
            {variasImagenes && (
              <div className="detalle-galeria__miniaturas">
                {imagenesUrls.slice(0, MAX_MINIATURAS).map((imagenUrl, index) => {
                  const total = imagenesUrls.length;
                  const esUltimaConMas = total > MAX_MINIATURAS && index === MAX_MINIATURAS - 1;
                  if (esUltimaConMas) {
                    const restantes = total - (MAX_MINIATURAS - 1);
                    // Activa si la foto elegida es una de las que no tienen miniatura propia
                    const activa = indiceSeleccionado >= MAX_MINIATURAS - 1;
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`detalle-miniatura detalle-miniatura--mas ${activa ? "detalle-miniatura--activa" : ""}`}
                        aria-label={`Ver las ${total} fotos (${restantes} más)`}
                        aria-haspopup="dialog"
                        onClick={() => {
                          if (indiceSeleccionado < MAX_MINIATURAS - 1) elegirImagen(index);
                          setGaleriaAbierta(true);
                        }}
                      >
                        <img src={imagenUrl} alt="" onError={usarPlaceholder} />
                        <span className="detalle-miniatura__mas" aria-hidden="true">
                          +{restantes}
                        </span>
                      </button>
                    );
                  }
                  const activa = indiceSeleccionado === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`detalle-miniatura ${activa ? "detalle-miniatura--activa" : ""}`}
                      aria-label={`Ver imagen ${index + 1} de ${total}`}
                      aria-pressed={activa}
                      onClick={() => elegirImagen(index)}
                    >
                      <img src={imagenUrl} alt="" onError={usarPlaceholder} />
                    </button>
                  );
                })}
              </div>
            )}
            <div className="detalle-galeria__foto">
              <ImageZoomViewer
                src={imagenPrincipalValida}
                images={imagenesUrls}
                initialIndex={indiceSeleccionado}
                onIndexChange={elegirImagen}
                alt={producto.item}
                className="img-item-detail"
              />
              {producto.ofertaVigente && (
                <span className="detalle-galeria__descuento">-{producto.oferta.descuento}%</span>
              )}
              {imagenPrincipalValida && imagenPrincipalValida !== PLACEHOLDER_PRODUCTO && (
                <span className="detalle-galeria__ayuda" aria-hidden="true">
                  Pasá el mouse para ampliar
                </span>
              )}
            </div>
          </div>

          <div className="detalle-compra">
            <p className="detalle-compra__meta">
              {producto.marca}
              {producto.marca && producto.sku && " · "}
              {producto.sku && `SKU ${producto.sku}`}
            </p>
            <h1 className="detalle-compra__titulo">{producto.item}</h1>

            <div className="detalle-precio">
              {producto.ofertaVigente && (
                <span className="detalle-precio__anterior">
                  <span className="solo-lectores">Antes: </span>
                  {formatearPrecio(producto.precioConIva)}
                </span>
              )}
              <span
                className={`detalle-precio__actual ${producto.ofertaVigente ? "detalle-precio__actual--oferta" : ""}`}
              >
                {formatearPrecio(getPrecioUnitario(producto))}
              </span>
              <span className="detalle-precio__sin-iva">
                Precio sin IVA: {formatearPrecio(producto.precio)}
              </span>
            </div>

            <p className={`detalle-stock ${hayStock ? "detalle-stock--si" : "detalle-stock--no"}`}>
              <span className="detalle-stock__punto" aria-hidden="true" />
              {hayStock ? "En stock · listo para despachar" : "Sin stock · no disponible por el momento"}
            </p>

            <div className="detalle-compra__acciones">
              <div className="selector-cantidad" role="group" aria-label="Cantidad">
                <button
                  type="button"
                  aria-label="Restar una unidad"
                  onClick={() => fijarCantidad(cantidad - 1)}
                  disabled={!hayStock || cantidad <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  aria-label="Cantidad"
                  value={cantidadTexto}
                  min={1}
                  max={producto.stock}
                  disabled={!hayStock}
                  onChange={(e) => {
                    const texto = e.target.value.replace(/\D/g, "");
                    setCantidadTexto(texto);
                    const val = parseInt(texto, 10);
                    if (!isNaN(val) && val >= 1) {
                      setCantidad(Math.min(val, Math.max(1, producto.stock)));
                    }
                  }}
                  onBlur={() => fijarCantidad(parseInt(cantidadTexto, 10) || 1)}
                />
                <button
                  type="button"
                  aria-label="Sumar una unidad"
                  onClick={() => fijarCantidad(cantidad + 1)}
                  disabled={!hayStock || cantidad >= producto.stock}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="detalle-compra__agregar"
                onClick={() => handleAddToCart(producto._id)}
                disabled={!hayStock || agregando}
              >
                {agregando ? "Agregando..." : hayStock ? "Agregar al carrito" : "Sin stock"}
              </button>
            </div>

            <a
              className="detalle-compra__whatsapp"
              href={urlWhatsapp(mensajeWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icono size={18}>
                <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
              </Icono>
              Consultar por WhatsApp
            </a>

            <ul className="detalle-beneficios">
              <li>
                <Icono>
                  <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z" />
                  <circle cx="6" cy="18" r="1.8" />
                  <circle cx="17" cy="18" r="1.8" />
                </Icono>
                <span>
                  <strong>Envío a todo el país.</strong> Calculás el costo al finalizar la compra.
                </span>
              </li>
              <li>
                <Icono>
                  <path d="M3 10l9-6 9 6v10H3z" />
                  <path d="M9 20v-6h6v6" />
                </Icono>
                <span>
                  <strong>Retiro sin cargo</strong> en Gutiérrez.
                </span>
              </li>
              <li>
                <Icono>
                  <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
                  <path d="M8.5 12l2.5 2.5 4.5-5" />
                </Icono>
                <span>
                  <strong>Garantía oficial</strong> y pago seguro con Mercado Pago.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="detalle__info">
          <section className="detalle-bloque" aria-labelledby="detalle-descripcion">
            <h2 id="detalle-descripcion">Descripción</h2>
            <p className="detalle-bloque__descripcion">
              {(descripcionFormateada || "").split("\n").map((linea, index) => (
                <React.Fragment key={index}>
                  {linea}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </section>
          <section className="detalle-bloque" aria-labelledby="detalle-especificaciones">
            <h2 id="detalle-especificaciones">Especificaciones</h2>
            <dl className="detalle-especificaciones">
              {especificaciones.map(([nombre, valor]) => (
                <React.Fragment key={nombre}>
                  <dt>{nombre}</dt>
                  <dd>{valor}</dd>
                </React.Fragment>
              ))}
            </dl>
          </section>
        </div>

        <ProductosRelacionados producto={producto} />
      </div>
    </div>
  );
};

// Se monta de nuevo al cambiar de producto (por ejemplo, desde "relacionados"):
// así la imagen elegida, el zoom y la cantidad arrancan de cero para cada producto.
const ItemDetailPage = () => {
  const { prodId } = useParams();
  return <ItemDetail key={prodId} />;
};

export default ItemDetailPage;
