// src/components/checkout/Envio.jsx
import React from "react";
import { PROVINCIAS } from "../../utils/provincias";
import ShippingSelector from "./ShippingSelector";

const Envio = ({
  formData,
  errors,
  onChange,
  cartWeight,
  cartPaquetes,
  onSelectShipping,
}) => {
  const isRetiro = formData.deliveryMethod === "retiro_local";

  const handleMethodChange = (method) => {
    onChange({ target: { name: "deliveryMethod", value: method } });
    if (method === "retiro_local") {
      onSelectShipping({
        tipo: "retiro_local",
        correo: null,
        servicio: "Retiro en local",
        valor: 0,
        horas_entrega: null,
      });
    } else {
      onSelectShipping(null); // que vuelva a elegir en ShippingSelector
    }
  };

  return (
    <div className="checkout-step-content">
      <h2>Método de entrega</h2>

      <div className="checkout-delivery-toggle">
        <label className={`shipping-option ${!isRetiro ? "selected" : ""}`}>
          <input
            type="radio"
            name="deliveryMethod"
            checked={!isRetiro}
            onChange={() => handleMethodChange("envio")}
          />
          Envío a domicilio / sucursal
        </label>
        <label className={`shipping-option ${isRetiro ? "selected" : ""}`}>
          <input
            type="radio"
            name="deliveryMethod"
            checked={isRetiro}
            onChange={() => handleMethodChange("retiro_local")}
          />
          Retiro en el local
        </label>
      </div>

      {isRetiro ? (
        <div className="checkout-pickup-info" style={{ marginTop: "1rem" }}>
          <p><strong>Bulonera El Triángulo</strong></p>
          <p>Dirección del local, horarios de atención, etc.</p>
          <p>Sin costo de envío. Te avisamos por email cuando esté listo para retirar.</p>
        </div>
      ) : (
        <>
          <div className="checkout-form-grid">
            <div className="checkout-form-group">
              <label htmlFor="calle">Calle *</label>
              <input
                type="text"
                id="calle"
                name="calle"
                value={formData.calle}
                onChange={onChange}
                className={errors.calle ? "error" : ""}
                placeholder="Ej: Av. Corrientes"
              />
              {errors.calle && <span className="checkout-error">{errors.calle}</span>}
            </div>

            <div className="checkout-form-group">
              <label htmlFor="numero">Número *</label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={onChange}
                className={errors.numero ? "error" : ""}
                placeholder="Ej: 1234"
              />
              {errors.numero && <span className="checkout-error">{errors.numero}</span>}
            </div>

            <div className="checkout-form-group">
              <label htmlFor="ciudad">Ciudad *</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={onChange}
                className={errors.ciudad ? "error" : ""}
              />
              {errors.ciudad && <span className="checkout-error">{errors.ciudad}</span>}
            </div>

            <div className="checkout-form-group">
              <label htmlFor="provincia">Provincia *</label>
              <select
                id="provincia"
                name="provincia"
                value={formData.provincia}
                onChange={onChange}
                className={errors.provincia ? "error" : ""}
              >
                <option value="">Seleccioná una provincia</option>
                {PROVINCIAS.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              {errors.provincia && <span className="checkout-error">{errors.provincia}</span>}
            </div>

            <div className="checkout-form-group">
              <label htmlFor="codigoPostal">Código Postal *</label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={onChange}
                className={errors.codigoPostal ? "error" : ""}
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

          {formData.provincia && formData.codigoPostal && (
            <div className="checkout-form-group-full" style={{ marginTop: "1.5rem" }}>
              <h3>Opciones de envío</h3>
              <ShippingSelector
                provincia={formData.provincia}
                codigoPostal={formData.codigoPostal}
                peso={cartWeight}
                paquetes={cartPaquetes}
                selected={formData.shippingChoice}
                onSelect={onSelectShipping}
              />
              {errors.shippingChoice && <span className="checkout-error">{errors.shippingChoice}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Envio;