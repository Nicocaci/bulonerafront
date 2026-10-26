import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../../../utils/axiosConfig.js";
import PrintLabelButton from "./PrintLabelButton.jsx";

// Estados que el admin puede asignar a mano
const ESTADOS_EDITABLES = [
  { value: "pagado", label: "Pagado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

// Estados que pueden venir de la base pero no se eligen desde el panel
const ETIQUETAS_EXTRA = {
  pendiente: "Pendiente",
  reembolsado: "Reembolsado",
};

const opcionesPara = (estadoActual) => {
  if (ESTADOS_EDITABLES.some((e) => e.value === estadoActual)) {
    return ESTADOS_EDITABLES;
  }
  return [
    { value: estadoActual, label: ETIQUETAS_EXTRA[estadoActual] || estadoActual },
    ...ESTADOS_EDITABLES,
  ];
};

const nombreCliente = (order) => {
  if (order.user?.nombre) return `${order.user.nombre} ${order.user.apellido || ""}`.trim();
  if (order.comprador?.nombre) {
    return `${order.comprador.nombre} ${order.comprador.apellido || ""}`.trim();
  }
  return "Invitado";
};

const formatearPrecio = (valor) => `$${Number(valor || 0).toLocaleString("es-AR")}`;

function UltimasOrdenes({ onOrderUpdated }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/api/orders/admin?limit=5&page=1")
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) => {
        setError(err.response?.data?.message || "No se pudieron cargar las órdenes");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateOrderStatus = async (order, newStatus) => {
    if (newStatus === order.status) return;

    if (newStatus === "cancelado") {
      const { isConfirmed } = await Swal.fire({
        icon: "warning",
        title: `¿Cancelar la orden #${order.orderNumber ?? order._id.slice(-5)}?`,
        text: "Cambiar el estado no devuelve el dinero en Mercado Pago ni repone el stock. Eso se hace aparte.",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Volver",
        confirmButtonColor: "#d33",
      });
      if (!isConfirmed) return;
    }

    const previousOrders = orders;

    // Actualización optimista
    setOrders((prev) =>
      prev.map((o) => (o._id === order._id ? { ...o, status: newStatus } : o)),
    );

    try {
      await axiosInstance.put(`/api/orders/${order._id}/status`, {
        status: newStatus,
      });
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      setOrders(previousOrders);
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar el estado",
        text: err.response?.data?.message || "Probá de nuevo en unos segundos.",
      });
    }
  };

  if (loading) return <p>Cargando órdenes...</p>;
  if (error) return <p>{error}</p>;
  if (!orders.length) return <p>Todavía no hay órdenes.</p>;

  return (
    <table className="orders-table">
      <thead>
        <tr>
          <th>Orden</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Método de pago</th>
          <th>Estado</th>
          <th>Envío</th>
          <th>Fecha</th>
        </tr>
      </thead>

      <tbody>
        {orders.map((order) => (
          <tr key={order._id}>
            <td>
              #{order.orderNumber ?? order._id.slice(-5)}
              {order.necesitaAtencion && (
                <span
                  title={order.motivoAtencion || "Requiere revisión"}
                  aria-label="Requiere revisión"
                  style={{ marginLeft: 6 }}
                >
                  ⚠️
                </span>
              )}
            </td>

            <td>{nombreCliente(order)}</td>

            <td>{formatearPrecio(order.total)}</td>

            <td>{order.paymentMethod === "mercadopago" ? "Mercado Pago" : order.paymentMethod}</td>

            <td>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order, e.target.value)}
                className={`status-select ${order.status}`}
                aria-label={`Estado de la orden ${order.orderNumber ?? ""}`}
              >
                {opcionesPara(order.status).map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </td>

            <td>
              {order.enviopack?.necesitaAtencion && (
                <span title="El envío requiere atención" style={{ marginRight: 6 }}>
                  ⚠️
                </span>
              )}
              {order.enviopack?.envioId ? (
                <PrintLabelButton envioId={order.enviopack.envioId} />
              ) : (
                <span style={{ color: "#999" }}>
                  {order.envio?.metodo === "retiro_local" ? "Retiro en local" : "Sin envío"}
                </span>
              )}
            </td>

            <td>{new Date(order.date || order.createdAt).toLocaleDateString("es-AR")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UltimasOrdenes;