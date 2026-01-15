import React from 'react';

const Datos = ({ formData, errors, onChange }) => {
    return (
        <div className="checkout-step-content">
            <h2>Datos Personales</h2>
            <div className="checkout-form-grid">
                <div className="checkout-form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={onChange}
                        className={errors.nombre ? 'error' : ''}
                    />
                    {errors.nombre && <span className="checkout-error">{errors.nombre}</span>}
                </div>

                <div className="checkout-form-group">
                    <label htmlFor="apellido">Apellido *</label>
                    <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={onChange}
                        className={errors.apellido ? 'error' : ''}
                    />
                    {errors.apellido && <span className="checkout-error">{errors.apellido}</span>}
                </div>

                <div className="checkout-form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="checkout-error">{errors.email}</span>}
                </div>

                <div className="checkout-form-group">
                    <label htmlFor="telefono">Teléfono *</label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={onChange}
                        className={errors.telefono ? 'error' : ''}
                        placeholder="+54 11 1234-5678"
                    />
                    {errors.telefono && <span className="checkout-error">{errors.telefono}</span>}
                </div>
            </div>
        </div>
    );
};

export default Datos;
