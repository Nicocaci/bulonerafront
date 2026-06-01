import React from 'react';

const Pago = ({ formData, errors, onChange }) => {

    return (
        <div className="checkout-step-content">
            <h2>Método de Pago</h2>
            <div className="checkout-form-grid">
                <div className="checkout-form-group checkout-form-group-full">
                    <label htmlFor="metodoPago">Método de Pago *</label>
                    <select
                        id="metodoPago"
                        name="metodoPago"
                        value={formData.metodoPago}
                        onChange={onChange}
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="mercadopago">Mercado Pago</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Pago;
