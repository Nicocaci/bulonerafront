import React from "react";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";
import axiosInstance from "../utils/axiosConfig.js";
import "../css/Checkout.css";
import Datos from "./checkout/Datos.jsx";
import Pago from "./checkout/Pago.jsx";
import Envio from "./checkout/Envio.jsx";
import Confirmar from "./checkout/Confirmar.jsx";
import {
  getCartWeight,
  getCartPaquetes,
  getCartPaquetesEnvio,
} from "../utils/cartShipping.js";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCart } = useCart();
  const { user } = useContext(AuthContext);
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
    shippingChoice: null,
  });

  const [errors, setErrors] = useState({});
  const [confirmAccepted, setConfirmAccepted] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        await getCart();

        if (user) {
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
            nombre: user.nombre || user.name || prev.nombre,
            apellido: user.apellido || prev.apellido,
          }));
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar el carrito",
        });
        navigate("/carrito");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [getCart, navigate, user]);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
      if (!formData.apellido.trim())
        newErrors.apellido = "El apellido es requerido";
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

    // Paso 2 (Pago): método fijo "mercadopago", nada que validar acá.

    if (step === 3) {
      if (!formData.calle.trim()) newErrors.calle = "La calle es requerida";
      if (!formData.numero.trim()) newErrors.numero = "El número es requerido";
      if (!formData.ciudad.trim()) newErrors.ciudad = "La ciudad es requerida";
      if (!formData.provincia)
        newErrors.provincia = "La provincia es requerida";
      if (!formData.codigoPostal.trim()) {
        newErrors.codigoPostal = "El código postal es requerido";
      } else if (!/^[0-9]+$/.test(formData.codigoPostal)) {
        newErrors.codigoPostal = "El código postal debe contener solo números";
      }
      if (!formData.shippingChoice)
        newErrors.shippingChoice = "Elegí una opción de envío";
    }

    if (step === 4) {
      if (!confirmAccepted)
        newErrors.confirm = "Debes confirmar para continuar";
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
    setCurrentStep((prev) => prev - 1);
  };

  const calculateTotal = () => {
    if (!cart || !cart.products) return 0;

    const productsTotal = cart.products.reduce((acc, item) => {
      const price =
        item.product?.precioConIva ||
        item.product?.price ||
        item.precio ||
        item.price ||
        0;
      const quantity = item.quantity || item.cantidad || 1;
      return acc + price * quantity;
    }, 0);

    const shippingCost = Number(formData.shippingChoice?.valor) || 0;

    return productsTotal + shippingCost;
  };

  const handleSelectShipping = (option) => {
    setFormData((prev) => ({ ...prev, shippingChoice: option }));
    if (errors.shippingChoice) {
      setErrors((prev) => ({ ...prev, shippingChoice: "" }));
    }
  };

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
        <h2>Tu carrito está vacío</h2>
        <button
          onClick={() => navigate("/productos")}
          className="checkout-btn-primary"
        >
          Ver productos
        </button>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Finalizar Compra</h1>

      <div className="checkout-steps">
        <div
          className={`checkout-step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}
        >
          <div className="checkout-step-number">1</div>
          <div className="checkout-step-label">Datos</div>
        </div>
        <div
          className={`checkout-step-line ${currentStep > 1 ? "completed" : ""}`}
        ></div>

        <div
          className={`checkout-step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}
        >
          <div className="checkout-step-number">2</div>
          <div className="checkout-step-label">Pago</div>
        </div>
        <div
          className={`checkout-step-line ${currentStep > 2 ? "completed" : ""}`}
        ></div>

        <div
          className={`checkout-step ${currentStep >= 3 ? "active" : ""} ${currentStep > 3 ? "completed" : ""}`}
        >
          <div className="checkout-step-number">3</div>
          <div className="checkout-step-label">Envío</div>
        </div>
        <div
          className={`checkout-step-line ${currentStep > 3 ? "completed" : ""}`}
        ></div>

        <div className={`checkout-step ${currentStep >= 4 ? "active" : ""}`}>
          <div className="checkout-step-number">4</div>
          <div className="checkout-step-label">Confirmar</div>
        </div>
      </div>

      <div className="checkout-content">
        {currentStep === 1 && (
          <Datos
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
        )}
        {currentStep === 2 && <Pago />}
        {currentStep === 3 && (
          <Envio
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
            cartWeight={getCartWeight(cart)}
            cartPaquetes={getCartPaquetes(cart)}
            onSelectShipping={handleSelectShipping}
          />
        )}
        {currentStep === 4 && (
          <Confirmar
            formData={formData}
            cart={cart}
            total={total}
            confirmAccepted={confirmAccepted}
            onToggleConfirm={() => setConfirmAccepted((prev) => !prev)}
            errors={errors}
            paquetes={getCartPaquetesEnvio(cart)}
          />
        )}

        <div className="checkout-actions">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => {
                setConfirmAccepted(false);
                handleBack();
              }}
              className="checkout-btn-secondary"
            >
              Atrás
            </button>
          )}
          {currentStep < 4 && (
            <button
              type="button"
              onClick={handleNext}
              className="checkout-btn-primary"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;