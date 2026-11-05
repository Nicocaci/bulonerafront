// src/components/checkout/Envio.jsx
import React from "react";
import { PROVINCIAS } from "../../utils/provincias";
import { CONTACTO } from "../../utils/contacto.js";

const MensajeError = ({ id, children }) =>
  children ? (
    <span className="checkout-error" id={id}>
      {children}
    </span>
  ) : null;

// Props de accesibilidad para un campo con posible error
const conError = (id, error) => ({
  className: error ? "error" : "",
  "aria-invalid": error ? "true" : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});

// Envío a domicilio: el costo no se cobra en el checkout. Después de la compra la tienda
// le pasa al cliente el costo y el link de pago por WhatsApp.
const Envio = ({ formData, errors, onChange }) => {
  const isEnvio = formData.deliveryMethod === "envio";
  const isRetiro = formData.deliveryMethod === "retiro_local";

  const handleMethodChange = (method) => {
    onChange({ target: { name: "deliveryMethod", value: method } });
  };

  return (
    <div className="checkout-paso">
      <h1 className="checkout-paso__titulo">¿Cómo querés recibirlo?</h1>

      <div className="checkout-entrega" role="radiogroup" aria-label="Método de entrega">
        <label className={`checkout-opcion ${isEnvio ? "checkout-opcion--elegida" : ""}`}>
          <input
            type="radio"
            name="deliveryMethod"
            checked={isEnvio}
            onChange={() => handleMethodChange("envio")}
          />
          <span>
            <strong>Envío a domicilio</strong>
            <span className="checkout-opcion__detalle">A todo el país · Costo a coordinar por WhatsApp</span>
          </span>
        </label>
        <label className={`checkout-opcion ${isRetiro ? "checkout-opcion--elegida" : ""}`}>
          <input
            type="radio"
            name="deliveryMethod"
            checked={isRetiro}
            onChange={() => handleMethodChange("retiro_local")}
          />
          <span>
            <strong>Retiro en el local</strong>
            <span className="checkout-opcion__detalle">Sin cargo · {CONTACTO.direccion}</span>
          </span>
        </label>
      </div>

      <MensajeError id="deliveryMethod-error">{errors.deliveryMethod}</MensajeError>

      {isRetiro && (
        <div className="checkout-retiro">
          <p>
            <strong>Bulonera El Triángulo</strong>
          </p>
          <p>
            <strong>Dirección:</strong> Camino General Belgrano 6444
          </p>
          <p>
            <strong>Horarios de atención:</strong> lunes a viernes de 8 a 18 hs de corrido, sábados de 8 a 13 hs
          </p>
          <p>Te avisamos por email cuando esté listo para retirar.</p>
        </div>
      )}

      {isEnvio && (
        <>
          <div className="checkout-campos checkout-campos--direccion">
            <div className="checkout-campo checkout-campo--calle">
              <label htmlFor="calle">Calle *</label>
              <input
                type="text"
                id="calle"
                name="calle"
                autoComplete="address-line1"
                value={formData.calle}
                onChange={onChange}
                placeholder="Ej: Av. Corrientes"
                {...conError("calle", errors.calle)}
              />
              <MensajeError id="calle-error">{errors.calle}</MensajeError>
            </div>

            <div className="checkout-campo checkout-campo--numero">
              <label htmlFor="numero">Número *</label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={onChange}
                placeholder="Ej: 1234"
                {...conError("numero", errors.numero)}
              />
              <MensajeError id="numero-error">{errors.numero}</MensajeError>
            </div>

            <div className="checkout-campo checkout-campo--piso">
              <label htmlFor="pisoDepto">Piso / Depto (opcional)</label>
              <input
                type="text"
                id="pisoDepto"
                name="pisoDepto"
                autoComplete="address-line2"
                value={formData.pisoDepto}
                onChange={onChange}
                maxLength="40"
                placeholder="Ej: 3° B"
              />
            </div>

            <div className="checkout-campo checkout-campo--ciudad">
              <label htmlFor="ciudad">Ciudad *</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                autoComplete="address-level2"
                value={formData.ciudad}
                onChange={onChange}
                {...conError("ciudad", errors.ciudad)}
              />
              <MensajeError id="ciudad-error">{errors.ciudad}</MensajeError>
            </div>

            <div className="checkout-campo checkout-campo--provincia">
              <label htmlFor="provincia">Provincia *</label>
              <select
                id="provincia"
                name="provincia"
                value={formData.provincia}
                onChange={onChange}
                {...conError("provincia", errors.provincia)}
              >
                <option value="">Seleccioná una provincia</option>
                {PROVINCIAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <MensajeError id="provincia-error">{errors.provincia}</MensajeError>
            </div>

            <div className="checkout-campo checkout-campo--cp">
              <label htmlFor="codigoPostal">Código postal *</label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                inputMode="numeric"
                autoComplete="postal-code"
                value={formData.codigoPostal}
                onChange={onChange}
                maxLength="10"
                {...conError("codigoPostal", errors.codigoPostal)}
              />
              <MensajeError id="codigoPostal-error">{errors.codigoPostal}</MensajeError>
            </div>

            <div className="checkout-campo checkout-campo--notas">
              <label htmlFor="notas">Notas adicionales (opcional)</label>
              <textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={onChange}
                rows="3"
                placeholder="Entre calles, horario para recibir, referencias..."
              />
            </div>
          </div>

          <div className="checkout-nota-envio" role="note">
            <strong>¿Cómo sigue el envío?</strong>
            <p>
              Ahora pagás solo los productos. Cuando se confirme el pago, te pasamos el costo del
              envío y el link de pago por WhatsApp.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Envio;
