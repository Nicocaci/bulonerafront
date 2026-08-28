import { useEffect, useState, useContext, useRef } from "react";
import "../css/CartDetail.css";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUtils";

// 🔒 Detecta si el error es por falta de sesión / token inválido o vencido
const isAuthError = (message) => {
  if (!message) return false;
  const msg = message.toLowerCase();
  return (
    msg.includes("token") ||
    msg.includes("jwt") ||
    msg.includes("no autorizado") ||
    msg.includes("unauthorized") ||
    msg.includes("sesión") ||
    msg.includes("sesion")
  );
};

// 🎨 Pantalla amigable cuando falta iniciar sesión
const SesionExpirada = () => {
  const abrirLogin = () => {
    window.dispatchEvent(new CustomEvent("open-login-modal"));
  };

  return (
    <div className="cart-detail-auth-container">
      <div className="cart-detail-auth-icon">🔒</div>
      <h2 className="cart-detail-auth-title">Necesitás iniciar sesión</h2>
      <p className="cart-detail-auth-text">
        Tu sesión expiró o todavía no iniciaste sesión. Iniciá sesión para ver
        tu carrito y continuar con tu compra.
      </p>
      <button className="cart-detail-auth-btn" onClick={abrirLogin}>
        Iniciar sesión
      </button>
    </div>
  );
};

const CartDetail = () => {
  const { cartId } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useContext(AuthContext);
  const wasAuthenticated = useRef(isAuthenticated);

  const {
    cart,
    getCartById,
    updateProductQuantity,
    error: cartError,
  } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingQuantities, setUpdatingQuantities] = useState({});

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      await getCartById(cartId);
    } catch (error) {
      setError(error.message || "Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchCart();
  }, [cartId]);

  // 🔥 Si el usuario se loguea DESPUÉS de haber visto la pantalla de "sesión expirada",
  // volvemos a pedir el carrito automáticamente.
  useEffect(() => {
    if (!wasAuthenticated.current && isAuthenticated) {
      fetchCart();
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  if (loading) return <div>Cargando...</div>;

  const activeError = error || cartError;

  if (activeError) {
    if (isAuthError(activeError)) {
      return <SesionExpirada />;
    }
    return (
      <div className="cart-detail-error">
        Ocurrió un problema al cargar tu carrito. Por favor, intentá de nuevo
        más tarde.
      </div>
    );
  }

  if (!cart || !cart.products) {
    return <div>No se encontró el carrito</div>;
  }

  const total = cart.products.reduce((acc, item) => {
    const price = item.product?.precioConIva || 0;
    const quantity = item.quantity || 1;
    return acc + price * quantity;
  }, 0);

  const totalItems = cart.products.reduce(
    (acc, item) => acc + (item.quantity || 0),
    0,
  );

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

  return (
    <div className="cart-detail-container">
      <p className="cart-detail-title">
        Mi Carrito{" "}
        {totalItems > 0 &&
          `(${totalItems} ${totalItems === 1 ? "item" : "items"})`}
      </p>
      <div className="cart-detail-grid">
        <div className="cart-detail-items">
          {cart.products.map((item) => {
            const product = item.product || item;
            const id = product._id || product.id;
            const name =
              product.item || product.nombre || product.name || "Producto";
            const marca = product.marca;
            const price = product.precioConIva || product.price || 0;
            const itemTotal = price * (item.quantity || 1);

            return (
              <div
                className="cart-detail-item"
                key={id || item._id || Math.random()}
              >
                <img
                  src={getImageUrl(
                    Array.isArray(product.imagen)
                      ? product.imagen[0]
                      : Array.isArray(product.imagenes)
                        ? product.imagenes[0]
                        : product.imagen,
                  )}
                  alt={product.item || "Producto"}
                  className="cart-detail-image"
                  onError={(e) => {
                    e.target.src = "/vite.svg";
                  }}
                />
                <div className="cart-detail-info">
                  <p className="cart-detail-marca">{marca}</p>
                  <p className="cart-detail-name">{name}</p>
                  <p className="cart-detail-price">
                    ${price.toLocaleString("es-AR")}/u
                  </p>
                  <div className="cart-detail-total-container">
                    <div className="cart-detail-quantity">
                      <div className="cantidad-container-cart">
                        <button
                          type="button"
                          className="cantidad-btn-detail"
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
                          className="cart-detail-quantity-input"
                        />
                        <button
                          type="button"
                          className="cantidad-btn-detail"
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
                      <p className="cart-detail-total-item">
                        ${itemTotal.toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="cart-detail-subtotal">
          <div>
            <p className="cart-detail-title">Resumen</p>
          </div>
          <div className="cart-detail-content">
            <p>Subtotal</p>
            <p>${total.toLocaleString("es-AR")}</p>
          </div>
          <div className="cart-detail-content">
            <p>Envío</p>
            <p>A coordinar</p>
          </div>
          <div className="cart-detail-content-total">
            <p>Total</p>
            <p>${total.toLocaleString("es-AR")}</p>
          </div>
          <button
            className="cart-detail-checkout"
            onClick={() => navigate(`/checkout/${cartId}`)}
          >
            Finalizar compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDetail;
