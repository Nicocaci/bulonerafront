import { useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { avisar } from "../../../../utils/avisos.js";
import { confirmar } from "../../../../utils/confirmar.js";
import axiosInstance, { getErrorMessage } from "../../../../utils/axiosConfig.js";
import Pagination from "../../../../components/Pagination.jsx";
import TablaOrdenes from "./TablaOrdenes.jsx";
import { FILTROS_ORDENES, numeroOrden, paramsDeFiltro } from "./ordenes.js";
import Cargador from "../../../../components/Cargador.jsx";

const POR_PAGINA = 10;

const MENSAJE_VACIO = {
  "": "Todavía no hay ventas.",
  pagado: "No hay pedidos pagados para preparar.",
  atencion: "No hay órdenes que necesiten atención.",
};

/**
 * Listado de órdenes con filtros. El filtro viene de la URL (?estado=...), así los accesos
 * del Resumen ("Para hacer hoy", "Órdenes por estado") abren el listado ya filtrado.
 */
function OrdenesAdmin({ filtro, onFiltroChange }) {
  const queryClient = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const [revisando, setRevisando] = useState(null);

  // Si el filtro cambia desde afuera (botón "atrás" del navegador), se vuelve a la página 1
  const [filtroAnterior, setFiltroAnterior] = useState(filtro);
  if (filtro !== filtroAnterior) {
    setFiltroAnterior(filtro);
    setPagina(1);
  }

  const queryKey = ["admin", "ordenes", { pagina, filtro }];
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      axiosInstance
        .get("/api/orders/admin", {
          params: { page: pagina, limit: POR_PAGINA, ...paramsDeFiltro(filtro) },
        })
        .then((res) => res.data),
    placeholderData: keepPreviousData,
  });

  const orders = data?.orders || [];
  const totalPaginas = data?.pagination?.totalPages || 1;

  const cambiarFiltro = (valor) => {
    if (valor !== filtro) onFiltroChange(valor);
  };

  // Después de un cambio se recargan el listado, el Resumen y el contador del menú
  const actualizarPanel = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const cambiarEstado = async (order, nuevoEstado) => {
    if (nuevoEstado === order.status) return;

    if (nuevoEstado === "cancelado") {
      const ok = await confirmar({
        titulo: `¿Cancelar la orden ${numeroOrden(order)}?`,
        texto: "Cambiar el estado no devuelve el dinero en Mercado Pago ni repone el stock. Eso se hace aparte.",
        confirmar: "Cancelar orden",
        cancelar: "Volver",
        peligro: true,
      });
      if (!ok) return;
    }

    // Actualización optimista: se ve el cambio enseguida y se deshace si falla
    const anterior = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (prev) =>
      prev
        ? {
            ...prev,
            orders: prev.orders.map((o) =>
              o._id === order._id ? { ...o, status: nuevoEstado } : o,
            ),
          }
        : prev,
    );

    try {
      await axiosInstance.put(`/api/orders/${order._id}/status`, { status: nuevoEstado });
      actualizarPanel();
    } catch (err) {
      queryClient.setQueryData(queryKey, anterior);
      avisar.error("No se pudo actualizar el estado", getErrorMessage(err, "Probá de nuevo en unos segundos."));
    }
  };

  // Saca la marca de atención. El motivo queda guardado en la orden.
  const marcarRevisada = async (order) => {
    const ok = await confirmar({
      titulo: `¿Marcar la orden ${numeroOrden(order)} como revisada?`,
      texto: "Deja de aparecer en \"Necesitan atención\". Hacelo cuando ya hayas resuelto el problema.",
      confirmar: "Marcar como revisada",
      cancelar: "Volver",
    });
    if (!ok) return;

    const cambios = { necesitaAtencion: false };
    if (order.enviopack?.necesitaAtencion) cambios["enviopack.necesitaAtencion"] = false;

    setRevisando(order._id);
    try {
      await axiosInstance.put(`/api/orders/${order._id}`, cambios);
      await actualizarPanel();
    } catch (err) {
      avisar.error("No se pudo marcar como revisada", getErrorMessage(err, "Probá de nuevo en unos segundos."));
    } finally {
      setRevisando(null);
    }
  };

  let contenido;
  if (isLoading) {
    contenido = <Cargador tamano="bloque" texto="Cargando órdenes…" />;
  } else if (isError) {
    contenido = (
      <p className="admin-mensaje admin-mensaje--error">
        {getErrorMessage(error, "No se pudieron cargar las órdenes")}
      </p>
    );
  } else if (!orders.length) {
    contenido = (
      <p className="admin-mensaje">{MENSAJE_VACIO[filtro] || "No hay órdenes con ese estado."}</p>
    );
  } else {
    contenido = (
      <>
        <TablaOrdenes
          orders={orders}
          onCambiarEstado={cambiarEstado}
          onMarcarRevisada={marcarRevisada}
          revisando={revisando}
        />
        <Pagination currentPage={pagina} totalPages={totalPaginas} onPageChange={setPagina} />
      </>
    );
  }

  return (
    <section className="admin-caja admin-caja--tabla" aria-busy={isFetching}>
      <div className="admin-filtros" role="group" aria-label="Filtrar órdenes">
        {FILTROS_ORDENES.map((f) => (
          <button
            key={f.value}
            type="button"
            className="admin-chip"
            aria-pressed={filtro === f.value}
            onClick={() => cambiarFiltro(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {contenido}
    </section>
  );
}

export default OrdenesAdmin;
