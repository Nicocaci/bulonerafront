import React, { useRef, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import "../css/CartDropdown.css";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import Swal from "sweetalert2";

const CartDropdown = ({ onClose, isOpen }) => {
  const { cart, clearCartSilently, updateProductQuantity } = useCart();
  const [updatingQuantities, setUpdatingQuantities] = useState({});
  const [error, setError] = useState(null);
  const products = cart?.products || [];
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el clic fue fuera del dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Verificar si el clic NO fue en el botón del carrito ni en su wrapper
        const cartButton = event.target.closest(".navbar-cart-wrapper");
        if (!cartButton) {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const total = products.reduce((acc, item) => {
    const price =
      item.product?.precioConIva ||
      item.product?.price ||
      item.precioConIva ||
      item.price ||
      0;
    const quantity = item.quantity || item.cantidad || 1;
    return acc + price * quantity;
  }, 0);

  const handleQuantityChange = async (productId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);

    if (isNaN(quantity) || quantity < 0) return;

    setUpdatingQuantities((prev) => ({ ...prev, [productId]: true }));

    try {
      await updateProductQuantity(productId, quantity);
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      setError(error.message || "Error al actualizar la cantidad");
    } finally {
      setUpdatingQuantities((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  const handleClearCart = async () => {
    if (products.length === 0) return;

    const result = await Swal.fire({
      title: "¿Vaciar carrito?",
      text: "Se eliminarán todos los productos del carrito.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await clearCartSilently();
        Swal.fire({
          title: "Carrito vaciado",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al vaciar el carrito:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo vaciar el carrito. Intentá de nuevo.",
          icon: "error",
        });
      }
    }
  };
  return (
    <div className={`cart-dropdown ${isOpen ? "open" : ""}`} ref={dropdownRef}>
      <div>
        <p className="back-cart" onClick={onClose}>
          ➡
        </p>
      </div>
      <div className="cart-dropdown-header">
        <div>
          <p>Mi carrito</p>
        </div>
        <div>
          <p className="vaciar-carrito" onClick={handleClearCart}>Vaciar</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="cart-dropdown-empty">Tu carrito está vacío</div>
      ) : (
        <>
          <div className="cart-dropdown-items">
            {products.map((item) => {
              const product = item.product || item;
              const id = product._id || product.id;
              const image = getImageUrl(product.imagen || product.image);
              const name =
                product.item || product.nombre || product.name || "Producto";
              const marca = product.marca;
              const quantity = item.quantity || item.cantidad || 1;
              const price = product.precioConIva || product.price || 0;
              const itemTotal = price * quantity;

              return (
                <div
                  className="cart-dropdown-item"
                  key={id || item._id || Math.random()}
                >
                  <img
                    src={getImageUrl(
                      // Usar siempre la primera imagen disponible
                      Array.isArray(product.imagen)
                        ? product.imagen[0]
                        : Array.isArray(product.imagenes)
                          ? product.imagenes[0]
                          : product.imagen,
                    )}
                    alt={product.item || "Producto"}
                    className="cart-dropdown-image"
                    onError={(e) => {
                      const attemptedUrl = e.target.src;
                      console.error("❌ Error cargando imagen del producto:", {
                        producto: product.item,
                        rutaOriginal: product.imagen,
                        urlIntentada: attemptedUrl,
                        apiUrl:
                          import.meta.env.VITE_API_URL ||
                          "http://localhost:3000",
                      });
                      e.target.src = "/vite.svg";
                    }}
                  />
                  <div className="cart-dropdown-info">
                    <p className="cart-dropdown-marca">{marca}</p>
                    <p className="cart-dropdown-name">{name}</p>
                    <p className="cart-dropdown-price">
                      ${price.toLocaleString("es-AR")}/u
                    </p>
                    <div className="cart-dropdown-total-container">
                      <div className="cart-dropdown-quantity">
                        <label htmlFor={`quantity-${id}`}></label>
                        <div className="cantidad-container-cart">
                          <button
                            type="button"
                            className="cantidad-btn"
                            onClick={() =>
                              handleQuantityChange(
                                id,
                                Math.max(0, (item.quantity || 1) - 1),
                              )
                            }
                            disabled={updatingQuantities[id]}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            id={`quantity-${id}`}
                            min="0"
                            value={item.quantity || 1}
                            onChange={(e) =>
                              handleQuantityChange(id, e.target.value)
                            }
                            disabled={updatingQuantities[id]}
                            className="cart-dropdown-quantity-input"
                          />
                          <button
                            type="button"
                            className="cantidad-btn"
                            onClick={() =>
                              handleQuantityChange(id, (item.quantity || 1) + 1)
                            }
                            disabled={updatingQuantities[id]}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="cart-dropdown-total-item">
                          ${itemTotal.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-dropdown-footer">
            <div className="footer-total-container">
              <div>
                <p className="total-label">Total:</p>
              </div>
              <div>
                <span className="footer-total-cart">
                  ${total.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
            <div className="cart-dropdown-footer-buttons">
              <Link
                className="link-none"
                to={`/carrito/${cart._id}`}
                onClick={onClose}
              >
                <p className="cart-dropdown-checkout">IR A PAGAR</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartDropdown;
