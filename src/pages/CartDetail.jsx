import { useEffect, useState, useContext, useRef } from "react";
import "../css/CartDetail.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { ANCHO_MINIATURA, getImageUrl, usarPlaceholder } from "../utils/imageUtils";
import Swal from "sweetalert2";
import { getPrecioUnitario } from "../utils/precio.js";

// Mismo formato de precio que tenía el carrito (y que usa el carrito lateral): $6.068
const pesos = (n) => `$${Number(n || 0).toLocaleString("es-AR")}`;

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

const IconoCandado = () => (
  <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const IconoCarrito = () => (
  <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 8H6" />
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </svg>
);

// 🎨 Pantalla amigable cuando falta iniciar sesión
const SesionExpirada = () => {
  const abrirLogin = () => {
    window.dispatchEvent(new CustomEvent("open-login-modal"));
  };

  return (
    <div className="carrito-estado">
      <span className="carrito-estado__icono">
        <IconoCandado />
      </span>
      <h1 className="carrito-estado__titulo">Necesitás iniciar sesión</h1>
      <p className="carrito-estado__texto">
        Tu sesión expiró o todavía no iniciaste sesión. Iniciá sesión para ver tu carrito y
        continuar con tu compra.
      </p>
      <button type="button" className="carrito-btn carrito-btn--marca" onClick={abrirLogin}>
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

  const { cart, getCartById, updateProductQuantity, removeProductFromCart, clearCartSilently } =
    useCart();

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

  if (loading) return <div className="carrito-cargando" aria-busy="true" />;

  if (error) {
    if (isAuthError(error)) {
      return <SesionExpirada />;
    }
    return (
      <div className="carrito-estado">
        <p className="carrito-estado__texto">
          Ocurrió un problema al cargar tu carrito. Por favor, intentá de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (!cart || !cart.products) {
    return (
      <div className="carrito-estado">
        <p className="carrito-estado__texto">No se encontró el carrito</p>
      </div>
    );
  }

  if (cart.products.length === 0) {
    return (
      <div className="carrito-estado">
        <span className="carrito-estado__icono">
          <IconoCarrito />
        </span>
        <h1 className="carrito-estado__titulo">Tu carrito está vacío</h1>
        <p className="carrito-estado__texto">Agregá productos desde el catálogo para comprarlos.</p>
        <Link to="/productos?todos=true" className="carrito-btn carrito-btn--marca">
          Ver productos
        </Link>
      </div>
    );
  }

  const total = cart.products.reduce((acc, item) => {
    const price = getPrecioUnitario(item.product);
    const quantity = item.quantity || 1;
    return acc + price * quantity;
  }, 0);

  const totalItems = cart.products.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const marcarActualizando = (productId, valor) =>
    setUpdatingQuantities((prev) => {
      const newState = { ...prev };
      if (valor) newState[productId] = true;
      else delete newState[productId];
      return newState;
    });

  const handleQuantityChange = async (productId, newQuantity, maxStock) => {
    const quantity = parseInt(newQuantity, 10);

    if (isNaN(quantity) || quantity < 0) return;

    if (maxStock != null && quantity > maxStock) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${maxStock} unidades disponibles`,
        confirmButtonColor: "#d33",
      });
      return;
    }

    marcarActualizando(productId, true);

    try {
      await updateProductQuantity(productId, quantity);
    } catch (err) {
      console.error("Error al actualizar la cantidad:", err);
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text: err.message || "Error al actualizar la cantidad",
        confirmButtonColor: "#d33",
      });
    } finally {
      marcarActualizando(productId, false);
    }
  };

  const handleQuitar = async (productId) => {
    marcarActualizando(productId, true);
    try {
      await removeProductFromCart(productId);
    } catch (err) {
      console.error("Error al quitar el producto:", err);
      Swal.fire({
        icon: "error",
        title: "No se pudo quitar",
        text: err.message || "Error al quitar el producto",
        confirmButtonColor: "#d33",
      });
    } finally {
      marcarActualizando(productId, false);
    }
  };

  // Misma confirmación que el carrito lateral
  const handleVaciar = async () => {
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
    if (!result.isConfirmed) return;
    try {
      await clearCartSilently();
    } catch (err) {
      console.error("Error al vaciar el carrito:", err);
      Swal.fire({
        title: "Error",
        text: "No se pudo vaciar el carrito. Intentá de nuevo.",
        icon: "error",
      });
    }
  };

  return (
    <div className="carrito">
      <div className="carrito__interior">
        <div className="carrito__encabezado">
          <h1 className="carrito__titulo">Tu carrito</h1>
          <span className="carrito__cantidad">
            {totalItems} {totalItems === 1 ? "producto" : "productos"}
          </span>
        </div>

        <div className="carrito__grilla">
          <section className="carrito-lista" aria-label="Productos">
            {cart.products.map((item) => {
              const product = item.product || item;
              const id = product._id || product.id;
              const stock = product.stock;
              const name = product.item || product.nombre || product.name || "Producto";
              const marca = product.marca;
              const price = getPrecioUnitario(product);
              const cantidad = item.quantity || 1;
              const itemTotal = price * cantidad;
              const ocupado = Boolean(updatingQuantities[id]);

              return (
                <div className="carrito-item" key={id || item._id || Math.random()}>
                  <Link to={`/producto/${id}`} className="carrito-item__foto" tabIndex={-1} aria-hidden="true">
                    <img
                      src={getImageUrl(
                        Array.isArray(product.imagen)
                          ? product.imagen[0]
                          : Array.isArray(product.imagenes)
                            ? product.imagenes[0]
                            : product.imagen,
                        ANCHO_MINIATURA,
                      )}
                      alt=""
                      onError={usarPlaceholder}
                    />
                  </Link>
                  <div className="carrito-item__info">
                    {marca && <span className="carrito-item__marca">{marca}</span>}
                    <Link to={`/producto/${id}`} className="carrito-item__nombre">
                      {name}
                    </Link>
                    <span className="carrito-item__unitario">{pesos(price)} c/u</span>
                    <button
                      type="button"
                      className="carrito-item__quitar carrito-item__quitar--desktop"
                      onClick={() => handleQuitar(id)}
                      disabled={ocupado}
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="carrito-item__controles">
                    <div className="selector-cantidad selector-cantidad--chico" role="group" aria-label={`Cantidad de ${name}`}>
                      <button
                        type="button"
                        aria-label="Restar una unidad"
                        onClick={() => handleQuantityChange(id, Math.max(0, cantidad - 1), stock)}
                        disabled={ocupado}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        id={`quantity-${id}`}
                        aria-label="Cantidad"
                        min="0"
                        max={stock}
                        value={cantidad}
                        onChange={(e) => handleQuantityChange(id, e.target.value, stock)}
                        disabled={ocupado}
                      />
                      <button
                        type="button"
                        aria-label="Sumar una unidad"
                        onClick={() => handleQuantityChange(id, cantidad + 1, stock)}
                        disabled={ocupado}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="carrito-item__quitar carrito-item__quitar--mobile"
                      onClick={() => handleQuitar(id)}
                      disabled={ocupado}
                    >
                      Quitar
                    </button>
                    <span className="carrito-item__subtotal">{pesos(itemTotal)}</span>
                  </div>
                </div>
              );
            })}
            <div className="carrito-lista__pie">
              <Link to="/productos?todos=true" className="carrito-lista__seguir">
                ← Seguir comprando
              </Link>
              <button type="button" className="carrito-lista__vaciar" onClick={handleVaciar}>
                Vaciar carrito
              </button>
            </div>
          </section>

          <aside className="carrito-resumen" aria-label="Resumen de la compra">
            <h2 className="carrito-resumen__titulo">Resumen</h2>
            <div className="carrito-resumen__fila">
              <span>Subtotal</span>
              <span>{pesos(total)}</span>
            </div>
            <div className="carrito-resumen__fila">
              <span>Envío</span>
              <span>Se calcula al finalizar</span>
            </div>
            <div className="carrito-resumen__barra">
              <div className="carrito-resumen__total">
                <span>Total</span>
                <span className="carrito-resumen__importe">{pesos(total)}</span>
              </div>
              <button
                type="button"
                className="carrito-btn carrito-btn--marca carrito-resumen__finalizar"
                onClick={() => navigate(`/checkout/${cartId}`)}
              >
                Finalizar compra
              </button>
            </div>
            <p className="carrito-resumen__nota">Pagás de forma segura con Mercado Pago</p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartDetail;
