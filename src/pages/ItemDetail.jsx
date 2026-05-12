import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";
import { getImageUrl } from "../utils/imageUtils";
import "../css/ItemDetail.css";

const ItemDetail = () => {
  const { prodId } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const { addProductToCart } = useCart();

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
    const quantity = 1;
    addProductToCart(productId, quantity, producto);
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
              <h1 className="titulo-detail">{producto.item}</h1>
              <div className="item-grid-2-content-sku">
                <strong>Modelo:</strong>
                <p className="item-grid-2-content-sku-value">{producto.sku}</p>
              </div>
              <div className="item-grid-2-content-sku">
                <strong>Marca:</strong>
                <p className="item-grid-2-content-sku-value">{producto.marca}</p>
              </div>
            </div>
            <div className="item-grid-2-content-description">
              <div className="item-grid-2-content-subcategoria">
                <strong>Tipo de producto:</strong>
                <p>{producto.subcategoria}</p>
              </div>
              <strong>Descripción:</strong>
              {descripcionFormateada.split("\n").map((linea, i) => (
                <p className="descripcion-prod" key={i}>
                  {linea.trim()}
                </p>
              ))}
              <div className="item-grid-2-content-subcategoria">
                <strong>Precio:</strong>
                <p className="precio-item">
                  ${producto.precioConIva.toLocaleString()}
                </p>
              </div>
              <div className="btn-item-container">
                <button
                  className="btn-item"
                  onClick={() => handleAddToCart(producto._id)}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
