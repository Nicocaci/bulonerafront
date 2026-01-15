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
                        <option value="MercadoPago">Mercado Pago</option>
                        <option value="MercadoPago">Tarjeta de Crédito/Débito</option>
                    </select>
                </div>

                {formData.metodoPago === 'tarjeta' && (
                    <>
                        <div className="checkout-form-group">
                            <label htmlFor="cardNumber">Número de tarjeta *</label>
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={onChange}
                                className={errors.cardNumber ? 'error' : ''}
                                placeholder="1234 5678 9012 3456"
                            />
                            {errors.cardNumber && <span className="checkout-error">{errors.cardNumber}</span>}
                        </div>

                        <div className="checkout-form-group">
                            <label htmlFor="cardExpiry">Expiración (MM/AA) *</label>
                            <input
                                type="text"
                                id="cardExpiry"
                                name="cardExpiry"
                                value={formData.cardExpiry}
                                onChange={onChange}
                                className={errors.cardExpiry ? 'error' : ''}
                                placeholder="MM/AA"
                            />
                            {errors.cardExpiry && <span className="checkout-error">{errors.cardExpiry}</span>}
                        </div>

                        <div className="checkout-form-group">
                            <label htmlFor="cardCvc">CVC *</label>
                            <input
                                type="text"
                                id="cardCvc"
                                name="cardCvc"
                                value={formData.cardCvc}
                                onChange={onChange}
                                className={errors.cardCvc ? 'error' : ''}
                                placeholder="123"
                            />
                            {errors.cardCvc && <span className="checkout-error">{errors.cardCvc}</span>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Pago;
