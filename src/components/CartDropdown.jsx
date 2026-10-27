import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../css/CartDropdown.css";
import { ANCHO_MINIATURA, getImageUrl, usarPlaceholder } from "../utils/imageUtils";
import Swal from "../utils/alertas.js";
import { getPrecioUnitario } from "../utils/precio.js";

const pesos = (n) => `$${Number(n || 0).toLocaleString("es-AR")}`;

const primeraImagen = (product) => {
  if (Array.isArray(product.imagen)) return product.imagen[0];
  if (Array.isArray(product.imagenes)) return product.imagenes[0];
  return product.imagen;
};

/**
 * Carrito lateral (Fase 5F): panel desde la derecha con la página atenuada atrás.
 * Se cierra con la X, "Seguir comprando", Escape o tocando afuera; al cerrar, el foco
 * vuelve al botón del carrito. En mobile ocupa toda la pantalla.
 */
const CartDropdown = ({ onClose, isOpen }) => {
  const { cart, clearCartSilently, updateProductQuantity } = useCart();
  const [updatingQuantities, setUpdatingQuantities] = useState({});
  const products = cart?.products || [];
  const panelRef = useRef(null);
  const cerrarRef = useRef(null);

  // Al abrir: foco en "Cerrar", la página de atrás no se desplaza y Escape cierra.
  // Al cerrar, el foco vuelve a donde estaba (el botón del carrito).
  useEffect(() => {
    if (!isOpen) return;
    const previo = document.activeElement;
    cerrarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alEscape = (e) => {
      // Si hay un aviso abierto (por ejemplo, "¿Vaciar carrito?"), Escape cierra el aviso
      if (e.key === "Escape" && !Swal.isVisible()) onClose();
    };
    document.addEventListener("keydown", alEscape);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", alEscape);
      previo?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unidades = products.reduce((acc, item) => acc + (item.quantity || item.cantidad || 1), 0);
  const total = products.reduce((acc, item) => {
    const price = getPrecioUnitario(item.product || item);
    const quantity = item.quantity || item.cantidad || 1;
    return acc + price * quantity;
  }, 0);

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
      return; // no llega a pegarle al backend
    }

    setUpdatingQuantities((prev) => ({ ...prev, [productId]: true }));

    try {
      // Cantidad 0 = quitar el producto
      await updateProductQuantity(productId, quantity);
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text: error.message || "Error al actualizar la cantidad",
        confirmButtonColor: "#d33",
      });
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

  // Tab no sale del panel
  const alTab = (e) => {
    if (e.key !== "Tab") return;
    const enfocables = panelRef.current?.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled])",
    );
    if (!enfocables?.length) return;
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  };

  return (
    <div className="carrito-lateral__fondo" onMouseDown={onClose}>
      <aside
        ref={panelRef}
        className="carrito-lateral"
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-lateral-titulo"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={alTab}
      >
        <header className="carrito-lateral__cabecera">
          <h2 id="carrito-lateral-titulo">Tu carrito</h2>
          {unidades > 0 && (
            <span className="carrito-lateral__cantidad">
              {unidades} {unidades === 1 ? "producto" : "productos"}
            </span>
          )}
          <button
            ref={cerrarRef}
            type="button"
            className="carrito-lateral__cerrar"
            aria-label="Cerrar carrito"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {products.length === 0 ? (
          <div className="carrito-lateral__vacio">
            <svg
              aria-hidden="true"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 8H6" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            <p>Tu carrito está vacío.</p>
            <Link to="/productos?todos=true" className="carrito-lateral__pagar" onClick={onClose}>
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <ul className="carrito-lateral__lista">
              {products.map((item) => {
                const product = item.product || item;
                const id = product._id || product.id;
                const stock = product.stock;
                const name = product.item || product.nombre || product.name || "Producto";
                const quantity = item.quantity || item.cantidad || 1;
                const price = getPrecioUnitario(product);
                const ocupado = Boolean(updatingQuantities[id]);

                return (
                  <li className="carrito-lateral__item" key={id || item._id}>
                    <img
                      src={getImageUrl(primeraImagen(product), ANCHO_MINIATURA)}
                      alt=""
                      width={72}
                      height={72}
                      className="carrito-lateral__foto"
                      onError={usarPlaceholder}
                    />
                    <div className="carrito-lateral__info">
                      {product.marca && (
                        <span className="carrito-lateral__marca">{product.marca}</span>
                      )}
                      <Link
                        to={`/producto/${id}`}
                        className="carrito-lateral__nombre"
                        onClick={onClose}
                      >
                        {name}
                      </Link>
                      <span className="carrito-lateral__unitario">{pesos(price)} c/u</span>
                      <div className="carrito-lateral__acciones">
                        <div
                          className="carrito-lateral__cantidad-control"
                          role="group"
                          aria-label={`Cantidad de ${name}`}
                        >
                          <button
                            type="button"
                            aria-label={
                              quantity === 1 ? `Quitar ${name}` : `Restar una unidad de ${name}`
                            }
                            onClick={() => handleQuantityChange(id, quantity - 1, stock)}
                            disabled={ocupado}
                          >
                            −
                          </button>
                          <span aria-live="polite">{quantity}</span>
                          <button
                            type="button"
                            aria-label={`Sumar una unidad de ${name}`}
                            onClick={() => handleQuantityChange(id, quantity + 1, stock)}
                            disabled={ocupado || (stock != null && quantity >= stock)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="carrito-lateral__quitar"
                          onClick={() => handleQuantityChange(id, 0, stock)}
                          disabled={ocupado}
                        >
                          Quitar
                        </button>
                        <span className="carrito-lateral__subtotal">{pesos(price * quantity)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="carrito-lateral__pie">
              <div className="carrito-lateral__total">
                <span>Subtotal</span>
                <span>{pesos(total)}</span>
              </div>
              <p className="carrito-lateral__nota">
                El envío se calcula al finalizar la compra. IVA incluido.
              </p>
              <Link
                to={`/carrito/${cart?._id ?? "mi-carrito"}`}
                className="carrito-lateral__pagar"
                onClick={onClose}
              >
                Ir a pagar
              </Link>
              <div className="carrito-lateral__secundarios">
                <button type="button" className="carrito-lateral__seguir" onClick={onClose}>
                  Seguir comprando
                </button>
                <button type="button" className="carrito-lateral__vaciar" onClick={handleClearCart}>
                  Vaciar carrito
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDropdown;
