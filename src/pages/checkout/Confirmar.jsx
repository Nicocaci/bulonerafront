import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import React, { useEffect, useMemo, useState } from "react";
import { ANCHO_MINIATURA, getImageUrl } from "../../utils/imageUtils";
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
  onEditar,
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
    <div className="checkout-paso">
      <h1 className="checkout-paso__titulo">Revisá tu pedido</h1>

      <div className="checkout-revision">
        {/* DATOS CLIENTE */}
        <section className="checkout-revision__bloque">
          <div className="checkout-revision__encabezado">
            <h2>Tus datos</h2>
            <button type="button" onClick={() => onEditar?.(1)}>
              Editar <span className="solo-lectores">tus datos</span>
            </button>
          </div>
          <p>
            {formData.nombre} {formData.apellido}
          </p>
          <p>{formData.email}</p>
          <p>{formData.telefono}</p>
        </section>

        {/* ENTREGA */}
        <section className="checkout-revision__bloque">
          <div className="checkout-revision__encabezado">
            <h2>Entrega</h2>
            <button type="button" onClick={() => onEditar?.(2)}>
              Editar <span className="solo-lectores">la entrega</span>
            </button>
          </div>
          {esRetiro ? (
            <>
              <p>Retiro en el local — Bulonera El Triángulo</p>
              <p>Costo: $0</p>
            </>
          ) : (
            <>
              <p>
                {formData.calle} {formData.numero}
              </p>
              <p>
                {formData.ciudad}, {PROVINCIAS_LABEL[formData.provincia] || formData.provincia} — CP{" "}
                {formData.codigoPostal}
              </p>
              {formData.shippingChoice ? (
                <p>
                  {formData.shippingChoice.tipo === "sucursal" ? "A sucursal" : "A domicilio"}{" "}
                  — {formData.shippingChoice.correo || "Envío"} ({formData.shippingChoice.servicio}) ·{" "}
                  {formatearPrecio(shippingCost)}
                </p>
              ) : (
                <p>No se seleccionó método de envío</p>
              )}
            </>
          )}
        </section>

        {/* PRODUCTOS */}
        <section className="checkout-revision__bloque">
          <h2>Productos</h2>
          <div className="checkout-revision__productos">
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
                  <div key={productId} className="checkout-revision__producto">
                    <span className="checkout-resumen__foto">
                      <img src={getImageUrl(imagen, ANCHO_MINIATURA)} alt="" />
                    </span>
                    <span className="checkout-revision__nombre">
                      {name} <span className="checkout-resumen__cantidad">× {quantity}</span>
                    </span>
                    <span>{formatearPrecio(price * quantity)}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* TOTAL */}
        <div className="checkout-revision__totales">
          <div>
            <span>Subtotal productos</span>
            <span>{formatearPrecio(productsTotal)}</span>
          </div>
          <div>
            <span>Envío</span>
            <span>{formatearPrecio(shippingCost)}</span>
          </div>
          <div className="checkout-revision__total">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
        </div>

        {/* CONFIRMACIÓN */}
        <div className="checkout-confirmacion">
          <label>
            <input
              type="checkbox"
              checked={confirmAccepted}
              onChange={onToggleConfirm}
              aria-describedby={errors?.confirm ? "confirm-error" : undefined}
            />
            <span>Confirmo que los datos son correctos y deseo realizar la compra</span>
          </label>

          {errors?.confirm && (
            <div className="checkout-error" id="confirm-error">
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
        {!confirmAccepted && (
          <p className="checkout-pago__ayuda">
            Marcá la confirmación para ver el botón de pago. Vas a pagar en Mercado Pago con
            tarjeta de crédito, débito o dinero en cuenta.
          </p>
        )}
      </div>
    </div>
  );
};

export default Confirmar;
