import { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosConfig.js";

function DetalleVentas({ refresh }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/api/orders/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, [refresh]);

  if (!stats)
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Cargando Detalle de ventas</p>
      </div>
    );

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Ventas</h3>
        <p>${stats.totalRevenue.toLocaleString("es-AR")}</p>
      </div>

      <div className="stat-card">
        <h3>Ventas Efectivo</h3>
        <p>${stats.salesByPaymentMethod.efectivo.toLocaleString("es-AR")}</p>
      </div>

      <div className="stat-card">
        <h3>Ventas MercadoPago</h3>
        <p>${stats.salesByPaymentMethod.mercadopago.toLocaleString("es-AR")}</p>
      </div>

      <div className="stat-card">
        <h3>Órdenes</h3>
        <p>{stats.totalOrders}</p>
      </div>

      <div className="stat-card">
        <h3>Productos vendidos</h3>
        <p>{stats.totalProductsSold}</p>
      </div>

      <div className="stat-card">
        <h3>Pendientes</h3>
        <p>{stats.ordersByStatus.pendiente}</p>
      </div>

      <div className="stat-card">
        <h3>Enviados</h3>
        <p>{stats.ordersByStatus.enviado}</p>
      </div>

      <div className="stat-card">
        <h3>Entregados</h3>
        <p>{stats.ordersByStatus.entregado}</p>
      </div>

      <div className="stat-card">
        <h3>Cancelados</h3>
        <p>{stats.ordersByStatus.cancelado}</p>
      </div>
    </div>
  );
}

export default DetalleVentas;
