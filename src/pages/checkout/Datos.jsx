import React from "react";

// Campo de texto con su etiqueta y su mensaje de error
const Campo = ({ id, label, error, ...props }) => (
  <div className="checkout-campo">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      name={id}
      className={error ? "error" : ""}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
    {error && (
      <span className="checkout-error" id={`${id}-error`}>
        {error}
      </span>
    )}
  </div>
);

const Datos = ({ formData, errors, onChange }) => {
  return (
    <div className="checkout-paso">
      <div>
        <h1 className="checkout-paso__titulo">Tus datos</h1>
        <p className="checkout-paso__ayuda">Los usamos para enviarte la confirmación y coordinar la entrega.</p>
      </div>
      <div className="checkout-campos">
        <Campo
          id="nombre"
          label="Nombre *"
          type="text"
          autoComplete="given-name"
          value={formData.nombre}
          onChange={onChange}
          error={errors.nombre}
        />
        <Campo
          id="apellido"
          label="Apellido *"
          type="text"
          autoComplete="family-name"
          value={formData.apellido}
          onChange={onChange}
          error={errors.apellido}
        />
        <Campo
          id="email"
          label="Email *"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={onChange}
          error={errors.email}
        />
        <Campo
          id="telefono"
          label="Teléfono *"
          type="tel"
          autoComplete="tel"
          placeholder="+54 11 1234-5678"
          value={formData.telefono}
          onChange={onChange}
          error={errors.telefono}
        />
      </div>
    </div>
  );
};

export default Datos;
