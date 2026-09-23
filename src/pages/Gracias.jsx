import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../context/CartContext";

const Gracias = () => {
  const { clearCartSilently } = useCart();

  useEffect(() => {
    clearCartSilently();
  }, []);
  return (
    <div className="checkout-container">
      <h1 className="checkout-title">¡Gracias por tu compra!</h1>
      <div className="checkout-content">
        <div className="checkout-step-content">
          <h2>Tu pedido se ha realizado con éxito.</h2>
          <p>
            Hemos recibido tu pedido y estamos procesándolo. Te enviaremos un
            correo electrónico de confirmación con los detalles de tu compra.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <Link to="/productos" className="checkout-btn-primary">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gracias;
