import { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosConfig.js";

function UltimasOrdenes({ onOrderUpdated }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/api/orders/admin?limit=5&page=1")
      .then((res) => {
        setOrders(res.data.orders);
      })
      .catch((err) => console.error(err));
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const previousOrders = [...orders];

    // actualizar visualmente
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order,
      ),
    );

    try {
      await axiosInstance.put(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (onOrderUpdated) {
        onOrderUpdated();
      }
    } catch (error) {
      console.error("Error actualizando estado", error);

      // rollback si falla
      setOrders(previousOrders);
    }
  };

  if (!orders.length)
    return <p>Cargando..</p>;

  return (
    <table className="orders-table">
      <thead>
        <tr>
          <th>Orden</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Metodo Pago</th>
          <th>Estado</th>
          <th>Fecha</th>
        </tr>
      </thead>

      <tbody>
        {orders.map((order) => (
          <tr key={order._id}>
            <td>#{order._id.slice(-5)}</td>

            <td>
              {order.user
                ? `${order.user.nombre} ${order.user.apellido}`
                : "Usuario"}
            </td>

            <td>${order.total}</td>

            <td>{order.paymentMethod}</td>

            <td>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                className={`status-select ${order.status}`}
              >
                <option value="pendiente">Pendiente</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </td>

            <td>{new Date(order.date).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UltimasOrdenes;
