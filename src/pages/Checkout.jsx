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

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCart, clearCart } = useCart();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    metodoPago: "efectivo",
    notas: "",
  });

  const [errors, setErrors] = useState({});
  const [confirmAccepted, setConfirmAccepted] = useState(false);

  const buildHeaders = () => {
    const headers = {};
    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }
    return headers;
  };

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

    if (step === 2) {
      if (!formData.metodoPago)
        newErrors.metodoPago = "El método de pago es requerido";

      if (formData.metodoPago === "tarjeta") {
        if (
          !formData.cardNumber?.trim() ||
          !/^[0-9\s]{13,19}$/.test(formData.cardNumber)
        ) {
          newErrors.cardNumber = "Número de tarjeta inválido";
        }
        if (
          !formData.cardExpiry?.trim() ||
          !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.cardExpiry)
        ) {
          newErrors.cardExpiry = "Fecha inválida (MM/AA)";
        }
        if (
          !formData.cardCvc?.trim() ||
          !/^[0-9]{3,4}$/.test(formData.cardCvc)
        ) {
          newErrors.cardCvc = "CVC inválido";
        }
      }
    }

    if (step === 3) {
      if (!formData.direccion.trim())
        newErrors.direccion = "La dirección es requerida";
      if (!formData.ciudad.trim()) newErrors.ciudad = "La ciudad es requerida";
      if (!formData.codigoPostal.trim()) {
        newErrors.codigoPostal = "El código postal es requerido";
      } else if (!/^[0-9]+$/.test(formData.codigoPostal)) {
        newErrors.codigoPostal = "El código postal debe contener solo números";
      }
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
    return cart.products.reduce((acc, item) => {
      const price =
        item.product?.precioConIva ||
        item.product?.price ||
        item.precio ||
        item.price ||
        0;
      const quantity = item.quantity || item.cantidad || 1;
      return acc + price * quantity;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }
    if (!validateStep(4)) {
      setCurrentStep(4);
      return;
    }

    if (!user?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes estar autenticado para realizar una compra.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    /**
     * SI EL PAGO ES CON MERCADO PAGO
     * NO CREAR ORDEN DESDE EL FRONT
     * LA CREA EL WEBHOOK
     */
    if (formData.metodoPago === "mercadopago") {
      return;
    }

    setProcessing(true);

    try {
      const products = cart.products.map((item) => {
        const productId = item.product?._id || item.product?.id || item.product;
        const quantity = item.quantity || item.cantidad || 1;

        if (!productId) {
          throw new Error("Producto sin ID válido");
        }

        return {
          product: productId,
          quantity: quantity,
        };
      });

      const orderData = {
        user: user.id,
        products: products,
        total: calculateTotal(),
        paymentMethod: formData.metodoPago,
        status: "pendiente",
      };

      console.log("orderData:", orderData);
      console.log("user:", user);

      const response = await axiosInstance.post("/api/orders", orderData, {
        headers: {
          Authorization: `Bearer ${user.token}`, // ← directo, sin buildHeaders
        },
      });

      try {
        await clearCart(cart?._id || null);
      } catch (clearError) {
        console.error("Error al vaciar el carrito:", clearError);
      }

      await Swal.fire({
        icon: "success",
        title: "¡Compra realizada!",
        text: "Tu pedido ha sido procesado correctamente.",
        confirmButtonColor: "#108202",
      });

      navigate("/gracias", {
        state: {
          order: response.data,
        },
      });
    } catch (error) {
      console.error("Error al procesar el pedido:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo procesar el pedido. Por favor, intenta nuevamente.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setProcessing(false);
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
        {currentStep === 2 && (
          <Pago
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
        )}
        {currentStep === 3 && (
          <Envio
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
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
              disabled={processing}
            >
              Atrás
            </button>
          )}
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="checkout-btn-primary"
            >
              Continuar
            </button>
          ) : formData.metodoPago !== "mercadopago" ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="checkout-btn-primary checkout-btn-submit"
              disabled={processing || !confirmAccepted}
            >
              {processing ? "Procesando..." : "Confirmar Pedido"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
