import React from 'react';

const Envio = ({ formData, errors, onChange }) => {
    return (
        <div className="checkout-step-content">
            <h2>Dirección de Envío</h2>
            <div className="checkout-form-grid">
                <div className="checkout-form-group checkout-form-group-full">
                    <label htmlFor="direccion">Dirección *</label>
                    <input
                        type="text"
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={onChange}
                        className={errors.direccion ? 'error' : ''}
                        placeholder="Calle y número"
                    />
                    {errors.direccion && <span className="checkout-error">{errors.direccion}</span>}
                </div>

                <div className="checkout-form-group">
                    <label htmlFor="ciudad">Ciudad *</label>
                    <input
                        type="text"
                        id="ciudad"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={onChange}
                        className={errors.ciudad ? 'error' : ''}
                    />
                    {errors.ciudad && <span className="checkout-error">{errors.ciudad}</span>}
                </div>

                <div className="checkout-form-group">
                    <label htmlFor="codigoPostal">Código Postal *</label>
                    <input
                        type="text"
                        id="codigoPostal"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={onChange}
                        className={errors.codigoPostal ? 'error' : ''}
                        maxLength="10"
                    />
                    {errors.codigoPostal && <span className="checkout-error">{errors.codigoPostal}</span>}
                </div>

                <div className="checkout-form-group checkout-form-group-full">
                    <label htmlFor="notas">Notas adicionales (opcional)</label>
                    <textarea
                        id="notas"
                        name="notas"
                        value={formData.notas}
                        onChange={onChange}
                        rows="4"
                        placeholder="Instrucciones especiales para la entrega..."
                    />
                </div>
            </div>
        </div>
    );
};

export default Envio;
