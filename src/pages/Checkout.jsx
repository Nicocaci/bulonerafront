import React from "react";
import { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";
import "../css/Checkout.css";
import Datos from "./checkout/Datos.jsx";
import Envio from "./checkout/Envio.jsx";
import Confirmar from "./checkout/Confirmar.jsx";
import { getCartWeight, getCartPaquetes } from "../utils/cartShipping.js";
import { getPrecioUnitario, getProductIdDeItem, formatearPrecio } from "../utils/precio.js";
import { ANCHO_MINIATURA, getImageUrl, usarPlaceholder } from "../utils/imageUtils";

// Pasos del checkout (antes eran 4: el paso "Pago" no tenía nada para elegir,
// el pago se hace siempre en Mercado Pago desde el último paso)
const PASOS = ["Tus datos", "Entrega", "Revisar y pagar"];

const IconoTilde = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5 9-10" />
  </svg>
);

const Pasos = ({ actual }) => (
  <>
    <ol className="checkout-pasos" aria-label="Pasos de la compra">
      {PASOS.map((nombre, i) => {
        const numero = i + 1;
        const estado = numero < actual ? "hecho" : numero === actual ? "actual" : "pendiente";
        return (
          <React.Fragment key={nombre}>
            {i > 0 && (
              <li
                aria-hidden="true"
                className={`checkout-pasos__linea ${numero <= actual ? "checkout-pasos__linea--hecha" : ""}`}
              />
            )}
            <li
              className={`checkout-pasos__paso checkout-pasos__paso--${estado}`}
              aria-current={estado === "actual" ? "step" : undefined}
            >
              <span className="checkout-pasos__numero">
                {estado === "hecho" ? <IconoTilde /> : numero}
              </span>
              <span>
                {nombre}
                {estado === "hecho" && <span className="solo-lectores"> (completo)</span>}
              </span>
            </li>
          </React.Fragment>
        );
      })}
    </ol>
    <div className="checkout-pasos-mobile" aria-hidden="true">
      <p>
        Paso {actual} de {PASOS.length} · {PASOS[actual - 1]}
      </p>
      <div className="checkout-pasos-mobile__barras">
        {PASOS.map((nombre, i) => (
          <span
            key={nombre}
            className={i + 1 < actual ? "hecha" : i + 1 === actual ? "actual" : ""}
          />
        ))}
      </div>
    </div>
  </>
);

// Resumen del pedido (columna derecha en desktop, desplegable arriba en mobile)
const ResumenPedido = ({ productos, subtotal, envio, total }) => (
  <>
    <ul className="checkout-resumen__lista">
      {productos.map((item) => {
        const product = item.product || {};
        const cantidad = item.quantity || 1;
        const imagen = Array.isArray(product.imagen) ? product.imagen[0] : product.imagen;
        return (
          <li key={getProductIdDeItem(item)} className="checkout-resumen__item">
            <span className="checkout-resumen__foto">
              <img src={getImageUrl(imagen, ANCHO_MINIATURA)} alt="" onError={usarPlaceholder} />
            </span>
            <span className="checkout-resumen__nombre">
              {product.item || "Producto"}{" "}
              <span className="checkout-resumen__cantidad">× {cantidad}</span>
            </span>
            <span>{formatearPrecio(getPrecioUnitario(product) * cantidad)}</span>
          </li>
        );
      })}
    </ul>
    <div className="checkout-resumen__filas">
      <div>
        <span>Subtotal</span>
        <span>{formatearPrecio(subtotal)}</span>
      </div>
      <div>
        <span>Envío</span>
        <span>{envio}</span>
      </div>
    </div>
    <div className="checkout-resumen__total">
      <span>Total</span>
      <span className="checkout-resumen__importe">{formatearPrecio(total)}</span>
    </div>
    <p className="checkout-resumen__nota">El pago se hace en Mercado Pago, en el último paso.</p>
  </>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { cartId } = useParams();
  const { cart, getCart } = useCart();
  const { user, getProfile } = useContext(AuthContext);
  const userId = user?.id;
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    calle: "",
    numero: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    metodoPago: "mercadopago",
    notas: "",
    deliveryMethod: null, // "retiro_local" o "envio"
    shippingChoice: null,
  });

  const [errors, setErrors] = useState({});
  const [confirmAccepted, setConfirmAccepted] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        // getCart no lanza errores: si falla devuelve undefined
        const data = await getCart();
        if (!data) throw new Error("No se pudo cargar el carrito");
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar el carrito",
        });
        navigate(`/carrito/${cartId || "mi-carrito"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [getCart, navigate, cartId]);

  // Con sesión iniciada, se completan nombre, apellido y email con los datos de la cuenta
  // (antes se leían del token, que no los trae, y quedaban vacíos). No pisa lo ya escrito.
  useEffect(() => {
    if (!userId) return;
    let cancelado = false;
    getProfile()
      .then((perfil) => {
        if (cancelado || !perfil) return;
        setFormData((prev) => ({
          ...prev,
          nombre: prev.nombre || perfil.nombre || "",
          apellido: prev.apellido || perfil.apellido || "",
          email: prev.email || perfil.email || "",
        }));
      })
      .catch(() => {
        // Si falla, el cliente completa los datos a mano como siempre
      });
    return () => {
      cancelado = true;
    };
    // getProfile se recrea en cada render del contexto: alcanza con el id del usuario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Al cambiar de paso se vuelve arriba (en mobile el formulario es largo)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentStep]);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
      if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido";
      if (!formData.email.trim()) {
        newErrors.email = "El email es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "El email no es válido";
      }
      if (!formData.telefono.trim()) {
        newErrors.telefono = "El teléfono es requerido";
      } else if (!/^[0-9+\-\s()]+$/.test(formData.telefono)) {
        newErrors.telefono = "El teléfono no es válido";
      }
    }

    if (step === 2) {
      if (!formData.deliveryMethod) {
        newErrors.deliveryMethod = "Seleccioná un método de entrega";
      } else if (formData.deliveryMethod === "retiro_local") {
        if (!formData.shippingChoice) {
          newErrors.shippingChoice = "Seleccioná el retiro en el local";
        }
      } else {
        if (!formData.calle.trim()) newErrors.calle = "La calle es requerida";
        if (!formData.numero.trim()) newErrors.numero = "El número es requerido";
        if (!formData.ciudad.trim()) newErrors.ciudad = "La ciudad es requerida";
        if (!formData.provincia) newErrors.provincia = "La provincia es requerida";
        if (!formData.codigoPostal.trim()) {
          newErrors.codigoPostal = "El código postal es requerido";
        } else if (!/^[0-9]+$/.test(formData.codigoPostal)) {
          newErrors.codigoPostal = "El código postal debe contener solo números";
        }
        if (!formData.shippingChoice) newErrors.shippingChoice = "Elegí una opción de envío";
      }
    }

    if (step === 3) {
      if (!confirmAccepted) newErrors.confirm = "Debes confirmar para continuar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (confirmAccepted) setConfirmAccepted(false);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setConfirmAccepted(false);
    setCurrentStep((prev) => prev - 1);
  };

  // Desde "Revisar y pagar" se puede volver a un paso para corregir algo
  const irAPaso = (paso) => {
    setConfirmAccepted(false);
    setCurrentStep(paso);
  };

  const handleSelectShipping = useCallback((option) => {
    setFormData((prev) => ({ ...prev, shippingChoice: option }));
    setErrors((prev) => (prev.shippingChoice ? { ...prev, shippingChoice: "" } : prev));
  }, []);

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="checkout-spinner"></div>
        <p>Cargando información del carrito...</p>
      </div>
    );
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <div className="checkout-empty">
        <h1>Tu carrito está vacío</h1>
        <button onClick={() => navigate("/productos")} className="checkout-btn-primary">
          Ver productos
        </button>
      </div>
    );
  }

  // Solo para mostrar: el total que se cobra lo calcula el servidor al generar el pago.
  const productos = cart.products.filter((item) => (item.quantity || 0) > 0);
  const subtotal = cart.products.reduce((acc, item) => {
    const price = getPrecioUnitario(item.product);
    const quantity = item.quantity || item.cantidad || 1;
    return acc + price * quantity;
  }, 0);
  const shippingCost = Number(formData.shippingChoice?.valor) || 0;
  const total = subtotal + shippingCost;
  const cantidadProductos = productos.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const textoEnvio =
    formData.deliveryMethod === "retiro_local"
      ? "Sin cargo (retiro)"
      : formData.shippingChoice
        ? formatearPrecio(shippingCost)
        : "A calcular";

  const resumen = (
    <ResumenPedido productos={productos} subtotal={subtotal} envio={textoEnvio} total={total} />
  );

  return (
    <div className="checkout">
      <div className="checkout__interior">
        <Pasos actual={currentStep} />

        <details className="checkout-resumen-mobile">
          <summary>
            <span>
              Ver tu pedido ({cantidadProductos} {cantidadProductos === 1 ? "producto" : "productos"})
            </span>
            <strong>{formatearPrecio(total)}</strong>
          </summary>
          <div className="checkout-resumen checkout-resumen--mobile">{resumen}</div>
        </details>

        <div className="checkout__grilla">
          <section className="checkout-panel">
            {currentStep === 1 && (
              <Datos formData={formData} errors={errors} onChange={handleInputChange} />
            )}
            {currentStep === 2 && (
              <Envio
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
                cartWeight={getCartWeight(cart)}
                cartPaquetes={getCartPaquetes(cart)}
                onSelectShipping={handleSelectShipping}
              />
            )}
            {currentStep === 3 && (
              <Confirmar
                formData={formData}
                cart={cart}
                total={total}
                confirmAccepted={confirmAccepted}
                onToggleConfirm={() => setConfirmAccepted((prev) => !prev)}
                errors={errors}
                onEditar={irAPaso}
              />
            )}

            <div className={`checkout-acciones ${currentStep < 3 ? "checkout-acciones--fija" : ""}`}>
              {currentStep === 1 ? (
                <Link to={`/carrito/${cartId || "mi-carrito"}`} className="checkout-acciones__volver">
                  ← Volver al carrito
                </Link>
              ) : (
                <button type="button" onClick={handleBack} className="checkout-acciones__volver">
                  ← Volver
                </button>
              )}
              {currentStep < 3 && (
                <button type="button" onClick={handleNext} className="checkout-btn-primary">
                  Continuar
                </button>
              )}
            </div>
          </section>

          <aside className="checkout-resumen checkout-resumen--lateral" aria-label="Tu pedido">
            <h2 className="checkout-resumen__titulo">Tu pedido</h2>
            {resumen}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
