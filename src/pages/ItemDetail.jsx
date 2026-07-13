import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";
import { getImageUrl } from "../utils/imageUtils";
import "../css/ItemDetail.css";
import { BsTruck } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { MdOutlineVerified, MdOutlineVerifiedUser } from "react-icons/md";
import { PiHeadsetDuotone } from "react-icons/pi";

const ItemDetail = () => {
  const { prodId } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const { addProductToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/api/products/${prodId}`);

        // Normalizar las imágenes que vienen del backend:
        // - Puede venir como `imagen` (string o array)
        // - O como `imagenes` (array)
        let imagenesNormalizadas = [];

        if (
          Array.isArray(response.data.imagenes) &&
          response.data.imagenes.length > 0
        ) {
          imagenesNormalizadas = response.data.imagenes;
        } else if (Array.isArray(response.data.imagen)) {
          imagenesNormalizadas = response.data.imagen;
        } else if (response.data.imagen) {
          imagenesNormalizadas = [response.data.imagen];
        }

        // Guardamos el producto con el array normalizado en `imagenes`
        setProducto({
          ...response.data,
          imagenes: imagenesNormalizadas,
        });

        // Establecer la imagen inicial (la primera del array normalizado)
        const primeraImagen = imagenesNormalizadas[0];
        setImagenSeleccionada(
          primeraImagen ? getImageUrl(primeraImagen) : null,
        );
      } catch (error) {
        setError(
          error.response?.data?.message || "Error al cargar el producto",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [prodId]);

  const handleAddToCart = (productId) => {
    addProductToCart(productId, cantidad, producto);
    Swal.fire({
      icon: "success",
      title: "Producto agregado al carrito",
      text: "El producto ha sido agregado al carrito correctamente",
      confirmButtonColor: "#28a745",
      timer: 2500,
      showConfirmButton: true,
    });
  };
  const descripcionFormateada = producto?.descripcion?.replace(/\\n/g, "\n");

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!producto) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div className="item-page">
      <div className="item-detail-container">
        <div className="item-detail-grid">
          <div className="item-grid-1">
            <img
              className="img-item-detail"
              src={
                imagenSeleccionada ||
                getImageUrl(producto.imagenes?.[0] || producto.imagen)
              }
              alt={producto.item}
              onError={(e) => {
                console.error("❌ Error cargando imagen principal:", {
                  producto: producto.item,
                  rutaOriginal: producto.imagen,
                  imagenSeleccionada: imagenSeleccionada,
                  urlIntentada: e.target.src,
                });
                e.target.src = "/vite.svg";
              }}
            />
            <div className="thumbnails-container">
              {(producto.imagenes || []).map((imagen, index) => {
                const imagenUrl = getImageUrl(imagen);
                return (
                  <img
                    key={index}
                    className={`thumbnail ${imagenSeleccionada === imagenUrl ? "thumbnail-active" : ""}`}
                    src={imagenUrl}
                    alt={`${producto.item} - Imagen ${index + 1}`}
                    onClick={() => setImagenSeleccionada(imagenUrl)}
                    onError={(e) => {
                      console.error(
                        `❌ Error cargando thumbnail ${index + 1}:`,
                        {
                          rutaOriginal: imagen,
                          urlIntentada: e.target.src,
                        },
                      );
                      e.target.src = "/vite.svg";
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="item-grid-2">
            <div className="item-grid-2-content">
              <p className="titulo-categoria">{producto.categoria}</p>
              <p className="titulo-detail">{producto.item}</p>
              <div className="item-grid-2-content-sku">
                <p className="precio-siniva">SKU: {producto.sku}</p>
              </div>
              <div className="item-grid-2-content-precio">
                <p className="item-grid-2-content-precio-value">
                  {producto.precioConIva.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
                <p className="precio-siniva">
                  Precio sin IVA:{" "}
                  {producto.precio.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
                <div className="item-grid-2-content-stats">
                  <div className="probando2">
                    <p>6</p>
                    <p>Cuotas sin interés</p>
                  </div>
                  <div className="probando1">
                    <BsTruck />
                    <div>
                      <p>Envío a todo el país</p>
                      <p className="precio-siniva">Calcula tu envío</p>
                    </div>
                  </div>
                  <div className="probando1">
                    <p>🟢</p>
                    <div>
                      <p>Stock disponible</p>
                      <p className="precio-siniva">Entrega Inmediata</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="precio-siniva">Cantidad</p>
                  <div className="item-grid-2-content-stats">
                    <div>
                      {" "}
                      <div className="cantidad-container">
                        <button
                          className="cantidad-btn"
                          onClick={() =>
                            setCantidad((prev) => Math.max(1, prev - 1))
                          }
                          disabled={cantidad <= 1}
                        >
                          −
                        </button>
                        <div className="cantidad-divider" />
                        <input
                          className="cantidad-input"
                          type="number"
                          value={cantidad}
                          min={1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1) setCantidad(val);
                          }}
                        />
                        <div className="cantidad-divider" />
                        <button
                          className="cantidad-btn"
                          onClick={() => setCantidad((prev) => prev + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        className="btn-item"
                        onClick={() => handleAddToCart(producto._id)}
                      >
                        Agregar al carrito
                      </button>
                    </div>
                    <div>
                      <CiHeart />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="titulo-descripcion">Descripción</p>
        <div className="item-grid-3">
          <div>
            <p className="descripcion-detail">
              {descripcionFormateada.split("\n").map((linea, index) => (
                <React.Fragment key={index}>
                  {linea}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>
          <div className="descripcion-detail">
            <div className="item-stats">
              <MdOutlineVerified />
              <div>
                <p>Garantía Oficial</p>
                <p className="precio-siniva">12 meses</p>
              </div>
            </div>
            <div className="item-stats">
              <PiHeadsetDuotone />
              <div>
                <p>Soporte Técnico</p>
                <p className="precio-siniva">Asesoramiento post venta</p>
              </div>
            </div>
            <div className="item-stats">
              <MdOutlineVerifiedUser />
              <div>
                <p>Compra Protegida</p>
                <p className="precio-siniva">Tus datos y pagos seguros</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
