import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../css/CartDropdown.css";
import { ANCHO_MINIATURA, getImageUrl, usarPlaceholder } from "../utils/imageUtils";
import { avisar } from "../utils/avisos.js";
import { confirmar, hayConfirmacionAbierta } from "../utils/confirmar.js";
import { getPrecioUnitario, formatearPrecio } from "../utils/precio.js";

const pesos = (n) => formatearPrecio(n);

const primeraImagen = (product) => {
  if (Array.isArray(product.imagen)) return product.imagen[0];
  if (Array.isArray(product.imagenes)) return product.imagenes[0];
  return product.imagen;
};

/**
 * Carrito lateral (Fase 5F): panel desde la derecha con la página atenuada atrás.
 * Se cierra con la X, "Seguir comprando", Escape o tocando afuera; al cerrar, el foco
 * vuelve al botón del carrito. En mobile ocupa toda la pantalla.
 * `recienAgregado`: _id del producto que se acaba de agregar desde el detalle (se muestra
 * "Agregaste este producto al carrito" y se resalta ese producto).
 */
const CartDropdown = ({ onClose, isOpen, recienAgregado = null }) => {
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
      // Si está abierta la confirmación "¿Vaciar carrito?", Escape cierra la confirmación
      if (e.key === "Escape" && !hayConfirmacionAbierta()) onClose();
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
      avisar.advertencia("Stock insuficiente", `Solo hay ${maxStock} unidades disponibles`);
      return; // no llega a pegarle al backend
    }

    setUpdatingQuantities((prev) => ({ ...prev, [productId]: true }));

    try {
      // Cantidad 0 = quitar el producto
      await updateProductQuantity(productId, quantity);
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      avisar.error("No se pudo actualizar", error.message || "Error al actualizar la cantidad");
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

    const ok = await confirmar({
      titulo: "¿Vaciar carrito?",
      texto: "Se eliminarán todos los productos del carrito.",
      confirmar: "Vaciar carrito",
      peligro: true,
    });
    if (!ok) return;

    try {
      await clearCartSilently();
      avisar.exito("Carrito vaciado");
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      avisar.error("No se pudo vaciar el carrito", "Intentá de nuevo.", {
        accion: { texto: "Reintentar", onClick: handleClearCart },
      });
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
      <div
        ref={panelRef}
        className="carrito-lateral"
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-lateral-titulo"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={alTab}
      >
        <div className="carrito-lateral__cabecera">
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
        </div>

        {recienAgregado && products.length > 0 && (
          <div className="carrito-lateral__agregado" role="status">
            <span className="carrito-lateral__agregado-icono" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            Agregaste este producto al carrito
          </div>
        )}
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
                  <li
                    className={`carrito-lateral__item ${
                      recienAgregado && String(id) === String(recienAgregado)
                        ? "carrito-lateral__item--nuevo"
                        : ""
                    }`}
                    key={id || item._id}
                  >
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

            <div className="carrito-lateral__pie">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDropdown;
