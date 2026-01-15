import React from 'react';
import { Link } from 'react-router-dom';

const Gracias = () => {
    return (
        <div className="checkout-container">
            <h1 className="checkout-title">¡Gracias por tu compra!</h1>
            <div className="checkout-content">
                <div className="checkout-step-content">
                    <h2>Tu pedido se ha realizado con éxito.</h2>
                    <p>
                        En breve nos pondremos en contacto contigo para coordinar el envío y los detalles de tu compra.
                    </p>
                    <div style={{ marginTop: '2rem' }}>
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


