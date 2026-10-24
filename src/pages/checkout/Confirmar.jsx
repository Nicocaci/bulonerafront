import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import React, { useEffect, useMemo, useState } from "react";
import { getImageUrl } from "../../utils/imageUtils";
import axiosInstance from "../../utils/axiosConfig.js";
import {
  getPrecioUnitario,
  getProductIdDeItem,
  formatearPrecio,
} from "../../utils/precio.js";

const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

if (publicKey) {
  initMercadoPago(publicKey, { locale: "es-AR" });
} else {
  console.error("Falta la public key de Mercado Pago (VITE_MP_PUBLIC_KEY)");
}

const PROVINCIAS_LABEL = {
  C: "CABA", B: "Buenos Aires", K: "Catamarca", H: "Chaco", U: "Chubut", X: "Córdoba",
  W: "Corrientes", E: "Entre Ríos", P: "Formosa", Y: "Jujuy", L: "La Pampa", F: "La Rioja",
  M: "Mendoza", N: "Misiones", Q: "Neuquén", R: "Río Negro", A: "Salta", J: "San Juan",
  D: "San Luis", Z: "Santa Cruz", S: "Santa Fe", G: "Santiago del Estero",
  V: "Tierra del Fuego", T: "Tucumán",
};

// Lo que se manda al backend: solo IDs, cantidades, datos del comprador y la opción de envío.
// Los precios y el costo de envío los vuelve a calcular el servidor.
const armarPedido = (formData, cart) => {
  const esRetiro = formData.deliveryMethod === "retiro_local";
  const opcion = formData.shippingChoice;

  return {
    items: (cart?.products || [])
      .map((item) => ({ productId: getProductIdDeItem(item), quantity: item.quantity }))
      .filter((item) => item.productId && item.quantity > 0),
    comprador: {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
    },
    envio: esRetiro
      ? { metodo: "retiro_local" }
      : {
          metodo: "envio",
          calle: formData.calle,
          numero: formData.numero,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          codigoPostal: formData.codigoPostal,
          notas: formData.notas,
          opcion: opcion
            ? {
                tipo: opcion.tipo,
                correo: opcion.correo,
                servicio: opcion.servicio,
                sucursalId: opcion.sucursal?.id,
              }
            : null,
        },
  };
};

const Confirmar = ({
  formData,
  cart,
  total,
  confirmAccepted,
  onToggleConfirm,
  errors,
}) => {
  const [pago, setPago] = useState(null); // { preferenceId, total }
  const [loading, setLoading] = useState(false);
  const [errorPago, setErrorPago] = useState("");

  // Si cambia el carrito o los datos, el pago generado ya no corresponde: hay que generarlo de nuevo.
  useEffect(() => {
    setPago(null);
    setErrorPago("");
  }, [cart, formData]);

  const productos = useMemo(
    () => (cart?.products || []).filter((item) => (item.quantity || 0) > 0),
    [cart],
  );

  const productsTotal = productos.reduce(
    (acc, item) => acc + getPrecioUnitario(item.product) * (item.quantity || 1),
    0,
  );
  const shippingCost = Number(formData.shippingChoice?.valor) || 0;

  const generarPago = async () => {
    setLoading(true);
    setErrorPago("");
    try {
      const { data } = await axiosInstance.post(
        "/api/mp/create_order",
        armarPedido(formData, cart),
      );
      setPago({ preferenceId: data.preferenceId, total: data.total });
    } catch (error) {
      setErrorPago(
        error.response?.data?.message ||
          "No pudimos generar el pago. Revisá tu conexión y probá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalCambio = pago && Math.abs(Number(pago.total) - total) >= 1;
  const esRetiro = formData.deliveryMethod === "retiro_local";

  return (
    <div className="checkout-step-content">
      <h2>Confirmación</h2>

      <div className="checkout-summary">
        {/* DATOS CLIENTE */}
        <div className="checkout-summary-section">
          <h3>Datos del Cliente</h3>
          <p>
            <strong>Nombre:</strong> {formData.nombre} {formData.apellido}
          </p>
          <p>
            <strong>Email:</strong> {formData.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {formData.telefono}
          </p>
        </div>

        {/* ENTREGA */}
        <div className="checkout-summary-section">
          {esRetiro ? (
            <>
              <h3>Entrega</h3>
              <p>Retiro en el local — Bulonera El Triángulo</p>
              <p>Costo: $0</p>
            </>
          ) : (
            <>
              <h3>Dirección de Envío</h3>
              <p>
                {formData.calle} {formData.numero}
              </p>
              <p>
                {formData.ciudad}, {PROVINCIAS_LABEL[formData.provincia] || formData.provincia} — CP{" "}
                {formData.codigoPostal}
              </p>
            </>
          )}
        </div>

        {/* MÉTODO DE ENVÍO */}
        {!esRetiro && (
          <div className="checkout-summary-section">
            <h3>Envío</h3>
            {formData.shippingChoice ? (
              <>
                <p>
                  {formData.shippingChoice.tipo === "sucursal" ? "A sucursal" : "A domicilio"}{" "}
                  — {formData.shippingChoice.correo || "Envío"} ({formData.shippingChoice.servicio})
                </p>
                <p>
                  <strong>Costo de envío:</strong> {formatearPrecio(shippingCost)}
                </p>
              </>
            ) : (
              <p>No se seleccionó método de envío</p>
            )}
          </div>
        )}

        {/* MÉTODO DE PAGO */}
        <div className="checkout-summary-section">
          <h3>Método de Pago</h3>
          <p>Mercado Pago</p>
        </div>

        {/* PRODUCTOS */}
        <div className="checkout-summary-section">
          <h3>Productos</h3>
          <div className="checkout-products-list">
            {productos.length === 0 ? (
              <div>No hay productos en el carrito</div>
            ) : (
              productos.map((item) => {
                const product = item.product || {};
                const productId = getProductIdDeItem(item);
                const name = product.item || "Producto";
                const price = getPrecioUnitario(product);
                const quantity = item.quantity || 1;
                const imagen = Array.isArray(product.imagen)
                  ? product.imagen[0]
                  : product.imagen;

                return (
                  <div key={productId} className="checkout-product-item">
                    <img
                      src={getImageUrl(imagen)}
                      alt={name}
                      className="checkout-product-image"
                    />
                    <div className="checkout-product-info">
                      <span className="checkout-product-name">{name}</span>
                      <span className="checkout-product-quantity">x{quantity}</span>
                    </div>
                    <span className="checkout-product-price">
                      {formatearPrecio(price * quantity)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* TOTAL */}
        <div className="checkout-summary-total">
          <p>Subtotal productos: {formatearPrecio(productsTotal)}</p>
          <p>Envío: {formatearPrecio(shippingCost)}</p>
          <h3>Total: {formatearPrecio(total)}</h3>
        </div>

        {/* CONFIRMACIÓN */}
        <div className="checkout-confirm-accept">
          <label>
            <input
              type="checkbox"
              checked={confirmAccepted}
              onChange={onToggleConfirm}
            />{" "}
            Confirmo que los datos son correctos y deseo realizar la compra
          </label>

          {errors?.confirm && (
            <div className="checkout-error" style={{ marginTop: "8px" }}>
              {errors.confirm}
            </div>
          )}
        </div>

        {/* PAGO */}
        {confirmAccepted && (
          <div className="checkout-pago">
            {errorPago && (
              <div className="checkout-alerta checkout-alerta-error" role="alert">
                {errorPago}
              </div>
            )}

            {!pago && (
              <button
                type="button"
                onClick={generarPago}
                disabled={loading}
                className="btn-mp"
              >
                {loading ? "Generando pago..." : "Pagar con Mercado Pago"}
              </button>
            )}

            {pago && (
              <>
                {totalCambio && (
                  <div className="checkout-alerta" role="status">
                    El total se actualizó a <strong>{formatearPrecio(pago.total)}</strong> según
                    los precios y el costo de envío vigentes.
                  </div>
                )}
                <Wallet
                  initialization={{ preferenceId: pago.preferenceId }}
                  customization={{ texts: { valueProp: "smart_option" } }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirmar;
