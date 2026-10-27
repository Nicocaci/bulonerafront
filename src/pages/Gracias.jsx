import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axiosInstance from "../utils/axiosConfig.js";
import { urlWhatsapp } from "../utils/contacto.js";
import "../css/Checkout.css";

const Svg = ({ children }) => (
  <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// Ícono según el resultado del pago
const ICONOS = {
  ok: (
    <Svg>
      <path d="M5 12l5 5 9-10" />
    </Svg>
  ),
  espera: (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  ),
  error: (
    <Svg>
      <path d="M7 7l10 10M17 7L7 17" />
    </Svg>
  ),
  info: (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  ),
};

// Mercado Pago vuelve a esta página en todos los casos (aprobado, pendiente o rechazado)
// con ?status=...&external_reference=<id de la orden>&payment_id=...
// El estado real se consulta al backend: los parámetros de la URL se pueden modificar.

const ESTADOS_PAGADOS = ["pagado", "enviado", "entregado"];
const MAX_REINTENTOS = 5;
const ESPERA_MS = 3000;

const Gracias = () => {
  const [searchParams] = useSearchParams();
  const { clearCartSilently } = useCart();

  const orderId = searchParams.get("external_reference");
  const paymentIdParam = searchParams.get("payment_id");
  const paymentId = /^\d+$/.test(paymentIdParam || "") ? paymentIdParam : null;
  const statusMp = searchParams.get("status") || searchParams.get("collection_status");

  const [estado, setEstado] = useState(orderId ? "cargando" : "sin_orden");
  const [orderNumber, setOrderNumber] = useState(null);
  const carritoLimpio = useRef(false);

  useEffect(() => {
    if (!orderId) return;

    let cancelado = false;
    let timeoutId;

    const consultar = async (intento = 1) => {
      try {
        const { data } = await axiosInstance.get(`/api/orders/${orderId}/estado-pago`, {
          params: paymentId ? { payment_id: paymentId } : {},
        });
        if (cancelado) return;

        setOrderNumber(data.orderNumber);

        if (ESTADOS_PAGADOS.includes(data.status)) {
          setEstado("aprobado");
          return;
        }
        if (data.status === "rechazado") {
          setEstado("rechazado");
          return;
        }
        if (data.status === "pendiente_pago") {
          // El pago puede estar aprobado y la confirmación demorarse unos segundos
          const deberiaEstarAprobado = statusMp === "approved";
          if (deberiaEstarAprobado && intento < MAX_REINTENTOS) {
            setEstado("confirmando");
            timeoutId = setTimeout(() => consultar(intento + 1), ESPERA_MS);
            return;
          }
          setEstado(paymentId ? "pendiente" : "sin_pago");
          return;
        }
        setEstado("otro");
      } catch {
        if (!cancelado) setEstado("error");
      }
    };

    consultar();

    return () => {
      cancelado = true;
      clearTimeout(timeoutId);
    };
  }, [orderId, paymentId, statusMp]);

  // El carrito se vacía solo cuando el pago está confirmado
  useEffect(() => {
    if (estado === "aprobado" && !carritoLimpio.current) {
      carritoLimpio.current = true;
      clearCartSilently().catch(() => {});
    }
  }, [estado, clearCartSilently]);

  const numero = orderNumber ? ` #${orderNumber}` : "";

  const contenido = {
    cargando: {
      titulo: "Verificando tu pago...",
      texto: "Esperá un momento, estamos consultando el estado de tu pago.",
    },
    confirmando: {
      titulo: "Confirmando tu pago...",
      texto: "Mercado Pago aprobó el pago y lo estamos registrando. Esto puede tardar unos segundos.",
    },
    aprobado: {
      titulo: "¡Gracias por tu compra!",
      texto: `Tu pedido${numero} se realizó con éxito. Te enviamos un email con el detalle de tu compra.`,
    },
    pendiente: {
      titulo: "Tu pago está en proceso",
      texto: `Mercado Pago todavía no confirmó el pago de tu pedido${numero}. Te vamos a avisar por email cuando se acredite. No hace falta que vuelvas a pagar.`,
    },
    sin_pago: {
      titulo: "No se completó el pago",
      texto: `Tu pedido${numero} quedó sin pagar. Tus productos siguen en el carrito para que puedas intentarlo de nuevo.`,
    },
    rechazado: {
      titulo: "El pago no se realizó",
      texto: `Mercado Pago rechazó el pago de tu pedido${numero}. No se te cobró nada. Podés intentarlo de nuevo con otro medio de pago; tus productos siguen en el carrito.`,
    },
    otro: {
      titulo: `Pedido${numero}`,
      texto: "Si tenés dudas sobre el estado de tu pedido, escribinos por WhatsApp o desde la página de contacto.",
    },
    error: {
      titulo: "No pudimos verificar tu pago",
      texto: "Si Mercado Pago te confirmó el pago, quedate tranquilo: vas a recibir un email con el detalle. Ante cualquier duda, escribinos por WhatsApp.",
    },
    sin_orden: {
      titulo: "No encontramos tu pedido",
      texto: "Si realizaste un pago, vas a recibir un email de confirmación. Ante cualquier duda, escribinos por WhatsApp.",
    },
  }[estado];

  const puedeReintentar = ["rechazado", "sin_pago"].includes(estado);
  const esperando = ["cargando", "confirmando"].includes(estado);
  const tipoIcono = esperando
    ? null
    : estado === "aprobado"
      ? "ok"
      : estado === "pendiente"
        ? "espera"
        : puedeReintentar
          ? "error"
          : "info";
  const mensajeWhatsapp = `Hola! Tengo una consulta sobre mi pedido${numero}`;

  return (
    <div className="resultado">
      <section className="resultado__tarjeta" role="status" aria-live="polite">
        {esperando ? (
          <div className="checkout-spinner" />
        ) : (
          <span className={`resultado__icono resultado__icono--${tipoIcono}`}>
            {ICONOS[tipoIcono]}
          </span>
        )}
        <h1 className="resultado__titulo">{contenido.titulo}</h1>
        <p className="resultado__texto">{contenido.texto}</p>

        {estado === "aprobado" && (
          <ol className="resultado__pasos">
            <li>
              <span className="resultado__numero">1</span>
              <span>
                <strong>Revisá tu email.</strong> Ahí está el detalle del pedido.
              </span>
            </li>
            <li>
              <span className="resultado__numero">2</span>
              <span>
                <strong>Preparamos tu pedido.</strong> Si elegiste retiro, te avisamos por email
                cuando esté listo.
              </span>
            </li>
            <li>
              <span className="resultado__numero">3</span>
              <span>
                <strong>¿Dudas?</strong> Escribinos por WhatsApp con tu número de pedido.
              </span>
            </li>
          </ol>
        )}

        {!esperando && (
          <div className="resultado__acciones">
            {puedeReintentar ? (
              <Link to="/carrito/mi-carrito" className="checkout-btn-primary">
                Volver a intentar
              </Link>
            ) : (
              <>
                <Link to="/productos" className="checkout-btn-primary">
                  Seguir comprando
                </Link>
                <a
                  href={urlWhatsapp(mensajeWhatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resultado__secundario"
                >
                  Escribinos por WhatsApp
                </a>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Gracias;
