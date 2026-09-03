import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getImageUrl } from "../../utils/imageUtils";
import axiosInstance from "../../utils/axiosConfig.js";
const Confirmar = ({
  formData,
  cart,
  total,
  confirmAccepted,
  onToggleConfirm,
  errors,
  paquetes,
}) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productsWithDetails, setProductsWithDetails] = useState([]);

  const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

  // Inicializar Mercado Pago
  useEffect(() => {
    if (!publicKey) {
      console.error("Falta la public key de Mercado Pago");
      return;
    }

    initMercadoPago(publicKey, { locale: "es-AR" });
  }, [publicKey]);

  // Fetch product details if not populated
  useEffect(() => {
    const products = cart?.products || [];
    const fetchProducts = async () => {
      const details = await Promise.all(
        products.map(async (item) => {
          // Si item.product ya es un objeto poblado (tiene _id), no hace falta fetchear
          if (
            item.product &&
            typeof item.product === "object" &&
            item.product._id
          ) {
            return item;
          }
          // Si no está poblado, sacamos el id como string
          try {
            const productId =
              item.product_id ||
              (typeof item.product === "string" ? item.product : null) ||
              item._id;

            if (!productId) return item;

            const res = await axiosInstance.get(`/api/products/${productId}`);
            return { ...item, product: res.data };
          } catch (error) {
            console.error("Error fetching product:", error);
            return item;
          }
        }),
      );
      setProductsWithDetails(
        details.filter((item) => (item.quantity || 0) > 0),
      );
    };
    if (products.length > 0) {
      fetchProducts();
    } else {
      setProductsWithDetails([]);
    }
  }, [cart]);

  // Crear preference en el backend
  const createPreferenceIdFromApi = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/api/mp/create_order`,
        {
          cart,
          payer: {
            name: formData.nombre,
            surname: formData.apellido,
            email: formData.email,
          },
          shipping: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            calle: formData.calle,
            numero: formData.numero,
            codigo_postal: formData.codigoPostal,
            provincia: formData.provincia,
            localidad: formData.ciudad,
            paquetes,
            shippingChoice: formData.shippingChoice,
          },
        },
      );
      setPreferenceId(response.data.preferenceId);
    } catch (error) {
      console.error("Error creando la preference de MP", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-step-content">
      <h2>Confirmación</h2>

      {/* RESUMEN */}
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

        {/* DIRECCIÓN */}
        <div className="checkout-summary-section">
          <h3>Dirección de Envío</h3>
          <p>{formData.direccion}</p>
          <p>
            {formData.ciudad}, CP {formData.codigoPostal}
          </p>
        </div>

        {/* MÉTODO DE PAGO */}
        <div className="checkout-summary-section">
          <h3>Método de Pago</h3>
          <p>
            {formData.metodoPago === "efectivo"
              ? "Efectivo"
              : formData.metodoPago === "transferencia"
                ? "Transferencia Bancaria"
                : "Mercado Pago"}
          </p>
        </div>

        {/* PRODUCTOS */}
        <div className="checkout-summary-section">
          <h3>Productos</h3>
          <div className="checkout-products-list">
            {productsWithDetails.length === 0 ? (
              <div>No hay productos en el carrito</div>
            ) : (
              productsWithDetails.map((item) => {
                const product = item.product || item;
                const productId =
                  item.product_id ||
                  (typeof item.product === "string"
                    ? item.product
                    : item.product?._id) ||
                  item._id;
                const name = product.item || "Producto";
                const price = product.precioConIva || 0;
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
                      onError={(e) => {
                        e.target.src = "/vite.svg";
                      }}
                    />
                    <div className="checkout-product-info">
                      <span className="checkout-product-name">{name}</span>
                      <span className="checkout-product-quantity">
                        x{quantity}
                      </span>
                    </div>
                    <span className="checkout-product-price">
                      ${(price * quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* TOTAL */}
        <div className="checkout-summary-total">
          <h3>Total: ${total.toLocaleString("es-AR")}</h3>
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

        {/* BOTÓN MERCADO PAGO */}
        {formData.metodoPago === "mercadopago" && confirmAccepted && (
          <div style={{ marginTop: "20px" }}>
            {!preferenceId && (
              <button
                onClick={createPreferenceIdFromApi}
                disabled={loading}
                className="btn-mp"
              >
                {loading ? "Generando pago..." : "Pagar con Mercado Pago"}
              </button>
            )}

            {preferenceId && (
              <Wallet
                initialization={{ preferenceId }}
                customization={{
                  texts: { valueProp: "smart_option" },
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirmar;
