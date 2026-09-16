import React from 'react';

const Pago = () => {
    return (
        <div className="checkout-step-content">
            <h2>Método de Pago</h2>
            <div className="checkout-form-grid">
                <div className="checkout-form-group checkout-form-group-full">
                    <p><strong>Mercado Pago</strong></p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                        Vas a poder pagar con tarjeta, transferencia o efectivo (Rapipago/Pago Fácil) directamente desde Mercado Pago.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pago;