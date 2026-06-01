import React, { useEffect, useState } from "react";
import "../css/CartDetail.css";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUtils";

const CartDetail = () => {
  const { cartId } = useParams();
  const navigate = useNavigate();

  // 🔥 AHORA TRAEMOS EL CART DESDE EL CONTEXT
  const { cart, getCartById, updateProductQuantity, error: cartError } = useCart();

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

  const   total = cart.products.reduce((acc, item) => {
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

      <div className="cart-detail-products-list">
        {cart.products.map((item) => {
          const productId = item.product._id; // 🔥 SIEMPRE ESTE

          return (
            <div key={item._id} className="cart-detail-products-list-item">
              <img
                src={getImageUrl(
                  Array.isArray(item.product.imagen)
                    ? item.product.imagen[0]
                    : item.product.imagen
                )}
                alt={item.product.item || "Producto"}
                className="cart-dropdown-image"
                onError={(e) => {
                  e.target.src = "/vite.svg";
                }}
              />

              <h3 className="cart-detail-products-list-title">
                {item.product?.item}
              </h3>

              <p className="cart-detail-price">
                Precio: ${item.product?.precioConIva.toLocaleString("es-AR")}
              </p>

              <div className="cart-detail-quantity">
                <label htmlFor={`quantity-${productId}`}>Cantidad:</label>

                <input
                  type="number"
                  id={`quantity-${productId}`}
                  min="0"
                  value={item.quantity || 1}
                  onChange={(e) =>
                    handleQuantityChange(productId, e.target.value)
                  }
                  disabled={updatingQuantities[productId]}
                  className="cart-detail-quantity-input"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-detail-total">
        <button
          className="cart-detail-checkout"
          onClick={() => navigate(`/checkout/${cartId}`)}
        >
          Finalizar compra
        </button>

        <span className="cart-detail-total-text">
          Total: ${total.toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  );
};

export default CartDetail;