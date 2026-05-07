import React, { useState } from "react";
import DetalleVentas from "./DetalleVentas.jsx";
import UltimasOrdenes from "./UltimasOrdenes.jsx";
import "../../../../css/AdminOrder.css";

const AdminVentas = () => {
  const [refreshStats, setRefreshStats] = useState(false);

  const handleOrderUpdated = () => {
    setRefreshStats((prev) => !prev);
  };

  return (
    <div className="admin-section">
      <div>
        <p className="titulo-admin-section">Dashboard Ventas</p>

        <div>
          <DetalleVentas refresh={refreshStats} />
        </div>

        <div className="table-section-orders">
          <UltimasOrdenes onOrderUpdated={handleOrderUpdated} />
        </div>
      </div>
    </div>
  );
};

export default AdminVentas;