import { urlWhatsappCliente } from "./ordenes.js";
import {
  etiquetaEstado,
  fechaCorta,
  motivosAtencion,
  necesitaAtencion,
  nombreCliente,
  numeroOrden,
  pesos,
} from "./ordenes.js";

// Estados que el admin puede asignar a mano
const ESTADOS_EDITABLES = ["pagado", "enviado", "entregado", "cancelado"];

// El estado actual siempre aparece entre las opciones (aunque no se pueda elegir a mano)
const opcionesPara = (estadoActual) =>
  ESTADOS_EDITABLES.includes(estadoActual)
    ? ESTADOS_EDITABLES
    : [estadoActual, ...ESTADOS_EDITABLES];

// Envío a domicilio: se coordina por WhatsApp con el cliente (costo y link de pago aparte).
// Las órdenes viejas de Enviopack muestran el correo con el que salieron.
const Envio = ({ order }) => {
  if (order.envio?.metodo === "retiro_local") {
    return <span className="admin-texto-suave">Retiro en el local</span>;
  }
  if (order.envio?.metodo !== "envio") {
    return <span className="admin-texto-suave">Sin envío</span>;
  }

  const d = order.shippingAddress || {};
  const whatsapp = urlWhatsappCliente(order);
  const viaEnviopack = Boolean(order.enviopack?.envioId);

  return (
    <span className="orden-envio">
      <strong>{viaEnviopack ? `Enviopack (${order.shippingMethod?.correo || "correo"})` : "A domicilio · a coordinar"}</strong>
      <span className="admin-texto-suave">
        {`${d.calle || ""} ${d.numero || ""}`.trim()}
        {d.pisoDepto ? `, ${d.pisoDepto}` : ""}
        {d.ciudad ? ` — ${d.ciudad}` : ""}
        {d.codigoPostal ? ` (CP ${d.codigoPostal})` : ""}
      </span>
      {whatsapp && !viaEnviopack && (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="orden-envio__whatsapp">
          Escribirle por WhatsApp
        </a>
      )}
    </span>
  );
};

/**
 * Tabla de órdenes del panel. En pantallas chicas cada orden se ve como una tarjeta.
 * - Sin `onCambiarEstado`: solo lectura (Resumen).
 * - Con `onCambiarEstado` y `onMarcarRevisada`: estado editable y aviso de atención con su motivo.
 */
function TablaOrdenes({ orders, onCambiarEstado, onMarcarRevisada, revisando }) {
  const editable = Boolean(onCambiarEstado);

  return (
    <div className="admin-tabla">
      <table>
        <thead>
          <tr>
            <th scope="col">Orden</th>
            <th scope="col">Cliente</th>
            <th scope="col">Total</th>
            <th scope="col">Estado</th>
            <th scope="col">Envío</th>
            <th scope="col">Fecha</th>
          </tr>
        </thead>
        {orders.map((order) => {
          const atencion = necesitaAtencion(order);
          return (
            // Un <tbody> por orden: en mobile cada uno es una tarjeta
            <tbody key={order._id} className={atencion ? "orden--atencion" : undefined}>
              <tr className="orden-fila">
                <td className="orden-col orden-col--numero">
                  {numeroOrden(order)}
                  {atencion && (
                    <span className="orden-marca-atencion" title={motivosAtencion(order).join(" ")}>
                      <span aria-hidden="true">●</span>
                      <span className="visualmente-oculto">Necesita atención</span>
                    </span>
                  )}
                </td>
                <td className="orden-col orden-col--cliente">{nombreCliente(order)}</td>
                <td className="orden-col orden-col--total">{pesos(order.total)}</td>
                <td className="orden-col orden-col--estado">
                  {editable ? (
                    <select
                      value={order.status}
                      onChange={(e) => onCambiarEstado(order, e.target.value)}
                      className={`estado-orden estado-orden--${order.status} estado-orden--select`}
                      aria-label={`Estado de la orden ${numeroOrden(order)}`}
                    >
                      {opcionesPara(order.status).map((estado) => (
                        <option key={estado} value={estado}>
                          {etiquetaEstado(estado)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`estado-orden estado-orden--${order.status}`}>
                      {etiquetaEstado(order.status)}
                    </span>
                  )}
                </td>
                <td className="orden-col orden-col--envio">
                  <Envio order={order} />
                </td>
                <td className="orden-col orden-col--fecha">{fechaCorta(order)}</td>
              </tr>
              {atencion && editable && (
                <tr className="orden-aviso">
                  <td colSpan={6}>
                    <div className="orden-aviso__caja">
                      <p>
                        <strong>Necesita atención:</strong> {motivosAtencion(order).join(" ")}
                      </p>
                      {onMarcarRevisada && (
                        <button
                          type="button"
                          className="admin-boton-secundario"
                          onClick={() => onMarcarRevisada(order)}
                          disabled={revisando === order._id}
                        >
                          {revisando === order._id ? "Guardando..." : "Marcar como revisada"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

export default TablaOrdenes;
