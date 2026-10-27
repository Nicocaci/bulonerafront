import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getErrorMessage } from "../../../utils/axiosConfig.js";
import TablaOrdenes from "./ventas/TablaOrdenes.jsx";
import { IconoFlecha } from "./IconosAdmin.jsx";
import { pesos, plural } from "./ventas/ordenes.js";

// Estados que se muestran en "Órdenes por estado" (el color es el del punto)
const ESTADOS_RESUMEN = [
  { estado: "pendiente_pago", nombre: "Pago pendiente" },
  { estado: "pagado", nombre: "Pagado" },
  { estado: "enviado", nombre: "Enviado" },
  { estado: "entregado", nombre: "Entregado" },
  { estado: "cancelado", nombre: "Cancelado" },
  { estado: "reembolsado", nombre: "Reembolsado" },
];

const linkOrdenes = (estado) => ({
  search: estado ? `?seccion=ordenes&estado=${estado}` : "?seccion=ordenes",
});

const Tarjeta = ({ titulo, valor, detalle, className = "" }) => (
  <div className={`admin-tarjeta ${className}`}>
    <p className="admin-tarjeta__titulo">{titulo}</p>
    <p className="admin-tarjeta__valor">{valor}</p>
    {detalle && <p className="admin-tarjeta__detalle">{detalle}</p>}
  </div>
);

const Tarea = ({ cantidad, titulo, detalle, estado, tipo }) => (
  <Link
    to={linkOrdenes(estado)}
    className={`admin-tarea admin-tarea--${cantidad > 0 ? tipo : "vacia"}`}
  >
    <span className="admin-tarea__cantidad">{cantidad}</span>
    <span className="admin-tarea__texto">
      <strong>{titulo}</strong>
      <span>{detalle}</span>
    </span>
    <IconoFlecha />
  </Link>
);

function ResumenAdmin({ stats, cargandoStats, errorStats, usuarios }) {
  // Últimas 5 ventas concretadas (el backend oculta pago pendiente y rechazado)
  const ultimas = useQuery({
    queryKey: ["admin", "ordenes", { pagina: 1, limite: 5 }],
    queryFn: () =>
      axiosInstance
        .get("/api/orders/admin", { params: { page: 1, limit: 5 } })
        .then((res) => res.data.orders || []),
  });

  if (cargandoStats) return <p className="admin-mensaje">Cargando el resumen...</p>;
  if (errorStats) {
    return (
      <p className="admin-mensaje admin-mensaje--error">
        {getErrorMessage(errorStats, "No se pudo cargar el resumen")}
      </p>
    );
  }

  const {
    totalRevenue = 0,
    totalOrders = 0,
    totalProductsSold = 0,
    ordersByStatus = {},
    salesByPaymentMethod = {},
    necesitanAtencion = 0,
  } = stats || {};

  const ventasMP = salesByPaymentMethod.mercadopago ?? 0;
  const paraPreparar = ordersByStatus.pagado ?? 0;
  const clientes = usuarios ? usuarios.filter((u) => u.role === "user").length : 0;
  const admins = usuarios ? usuarios.filter((u) => u.role === "admin").length : 0;

  const estados = [...ESTADOS_RESUMEN];
  // Estado de órdenes viejas: solo aparece si queda alguna
  if (ordersByStatus.pendiente > 0) {
    estados.push({ estado: "pendiente", nombre: "Pendiente (anterior)" });
  }

  return (
    <>
      <div className="admin-tarjetas">
        <Tarjeta
          titulo="Ventas totales"
          valor={pesos(totalRevenue)}
          detalle={
            ventasMP === totalRevenue ? "Todo por Mercado Pago" : `Mercado Pago: ${pesos(ventasMP)}`
          }
        />
        <Tarjeta
          titulo="Órdenes"
          valor={totalOrders}
          detalle={`${totalProductsSold} ${plural(totalProductsSold, "producto vendido", "productos vendidos")}`}
          className="admin-tarjeta--solo-desktop"
        />
        <Tarjeta titulo="Órdenes" valor={totalOrders} className="admin-tarjeta--solo-mobile" />
        <Tarjeta
          titulo="Ticket promedio"
          valor={totalOrders ? pesos(totalRevenue / totalOrders, 0) : "—"}
          detalle="Ventas ÷ órdenes"
        />
        <Tarjeta
          titulo="Usuarios"
          valor={usuarios ? usuarios.length : "…"}
          detalle={
            usuarios
              ? `${clientes} ${plural(clientes, "cliente", "clientes")} · ${admins} ${plural(admins, "administrador", "administradores")}`
              : null
          }
          className="admin-tarjeta--solo-desktop"
        />
        <Tarjeta
          titulo="Productos vendidos"
          valor={totalProductsSold}
          className="admin-tarjeta--solo-mobile"
        />
      </div>

      <div className="admin-fila">
        <section className="admin-caja" aria-labelledby="titulo-para-hacer">
          <h2 id="titulo-para-hacer" className="admin-caja__titulo">
            Para hacer hoy
          </h2>
          <div className="admin-tareas">
            <Tarea
              cantidad={paraPreparar}
              titulo={plural(paraPreparar, "Pedido pagado para preparar", "Pedidos pagados para preparar")}
              detalle="Armar y despachar"
              estado="pagado"
              tipo="preparar"
            />
            <Tarea
              cantidad={necesitanAtencion}
              titulo={plural(necesitanAtencion, "Orden que necesita atención", "Órdenes que necesitan atención")}
              detalle="Revisá el motivo en cada orden"
              estado="atencion"
              tipo="atencion"
            />
          </div>
        </section>

        <section className="admin-caja" aria-labelledby="titulo-por-estado">
          <h2 id="titulo-por-estado" className="admin-caja__titulo">
            Órdenes por estado
          </h2>
          <ul className="admin-estados">
            {estados.map(({ estado, nombre }) => (
              <li key={estado}>
                <Link to={linkOrdenes(estado)} className="admin-estado">
                  <span className={`admin-estado__punto admin-estado__punto--${estado}`} aria-hidden="true" />
                  <span className="admin-estado__nombre">{nombre}</span>
                  <span className="admin-estado__cantidad">{ordersByStatus[estado] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="admin-caja admin-caja--tabla" aria-labelledby="titulo-ultimas">
        <div className="admin-caja__encabezado">
          <h2 id="titulo-ultimas" className="admin-caja__titulo">
            Últimas órdenes
          </h2>
          <Link to={linkOrdenes()} className="admin-link">
            Ver todas
          </Link>
        </div>
        {ultimas.isLoading && <p className="admin-mensaje">Cargando órdenes...</p>}
        {ultimas.isError && (
          <p className="admin-mensaje admin-mensaje--error">
            {getErrorMessage(ultimas.error, "No se pudieron cargar las órdenes")}
          </p>
        )}
        {ultimas.data &&
          (ultimas.data.length ? (
            <TablaOrdenes orders={ultimas.data} />
          ) : (
            <p className="admin-mensaje">Todavía no hay ventas.</p>
          ))}
      </section>
    </>
  );
}

export default ResumenAdmin;
