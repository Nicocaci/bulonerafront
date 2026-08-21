import { useEffect, useState } from "react";
import "../css/CartDetail.css";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUtils";

const CartDetail = () => {
  const { cartId } = useParams();
  const navigate = useNavigate();

  // 🔥 AHORA TRAEMOS EL CART DESDE EL CONTEXT
  const {
    cart,
    getCartById,
    updateProductQuantity,
    error: cartError,
  } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingQuantities, setUpdatingQuantities] = useState({});

  // 🔥 SOLO DISPARAMOS LA CARGA, NO GUARDAMOS EN STATE LOCAL
  useEffect(() => {
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

    fetchCart();
  }, [cartId]);

  if (loading) return <div>Cargando...</div>;

  if (error || cartError) {
    return <div className="cart-detail-error">Error: {error || cartError}</div>;
  }

  if (!cart || !cart.products) {
    return <div>No se encontró el carrito</div>;
  }

  const total = cart.products.reduce((acc, item) => {
    const price = item.product?.precioConIva || 0;
    const quantity = item.quantity || 1;
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

  return (
    <div className="cart-detail-container">
      <p className="cart-detail-title">Mi Carrito</p>
      <div className="cart-detail-grid">
        <div className="cart-detail-items">
          {cart.products.map((item) => {
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
                className="cart-detail-item"
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
                  className="cart-detail-image"
                  onError={(e) => {
                    const attemptedUrl = e.target.src;
                    console.error("❌ Error cargando imagen del producto:", {
                      producto: product.item,
                      rutaOriginal: product.imagen,
                      urlIntentada: attemptedUrl,
                      apiUrl:
                        import.meta.env.VITE_API_URL || "http://localhost:3000",
                    });
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
                      <label htmlFor={`quantity-${id}`}></label>
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
            <p>Resumen</p>
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

      <div className="cart-detail-total"></div>
    </div>
  );
};

export default CartDetail;
