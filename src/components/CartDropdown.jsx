import React, { useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import "../css/CartDropdown.css";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import Swal from "sweetalert2";

const CartDropdown = ({ onClose, isOpen }) => {
  const { cart, clearCart, updateProductQuantity } = useCart();
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

  return (
    <div className={`cart-dropdown ${isOpen ? "open" : ""}`} ref={dropdownRef}>
      <div>
        <p className="back-cart" onClick={onClose}>➡</p>
      </div>
      <div className="cart-dropdown-header">
        <p>Mi carrito</p>
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
              const quantity = item.quantity || item.cantidad || 1;
              const price = product.precioConIva || product.price || 0;

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
                    <p className="cart-dropdown-name">{name}</p>
                    <div className="cart-dropdown-qty-container">
                      <div className="center">
                        <p className="cart-dropdown-qty">
                          Cantidad: {quantity}
                        </p>
                        <svg
                          onClick={() =>
                            updateProductQuantity(id, quantity - 1)
                          }
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="icono-delete"
                          viewBox="0 0 16 16"
                        >
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                        </svg>
                      </div>
                      <p className="cart-dropdown-price">${price.toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-dropdown-footer">
            <div className="cart-dropdown-footer-buttons">
              <p className="cart-dropdown-clear" onClick={() => clearCart()}>
                Limpiar carrito
              </p>
              <Link
                className="link-none"
                to={`/carrito/${cart._id}`}
                onClick={onClose}
              >
                <p className="cart-dropdown-checkout">IR A PAGAR</p>
              </Link>
            </div>
            <span className="cart-dropdown-total">
              Total: ${total.toLocaleString('es-AR')}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default CartDropdown;
