// Datos y formatos compartidos por el Resumen y el listado de órdenes del panel.

// Nombre visible de cada estado (los valores son los del backend, en order-model.js)
export const ETIQUETAS_ESTADO = {
  pendiente_pago: "Pago pendiente",
  rechazado: "Pago rechazado",
  pagado: "Pagado",
  pendiente: "Pendiente (anterior)",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

export const etiquetaEstado = (estado) => ETIQUETAS_ESTADO[estado] || estado;

// Filtros del listado. "" = ventas concretadas (el backend oculta pago pendiente y
// rechazado si no se pide un estado); "atencion" = marcadas para revisión.
export const FILTROS_ORDENES = [
  { value: "", label: "Todas las ventas" },
  { value: "pagado", label: "Para preparar" },
  { value: "atencion", label: "Necesitan atención" },
  { value: "enviado", label: "Enviadas" },
  { value: "entregado", label: "Entregadas" },
  { value: "cancelado", label: "Canceladas" },
  { value: "reembolsado", label: "Reembolsadas" },
  { value: "pendiente_pago", label: "Pago pendiente" },
  { value: "rechazado", label: "Pago rechazado" },
];

export const esFiltroValido = (valor) => FILTROS_ORDENES.some((f) => f.value === valor);

// Parámetros de GET /api/orders/admin para un filtro
export const paramsDeFiltro = (filtro) => {
  if (filtro === "atencion") return { atencion: 1 };
  if (filtro) return { status: filtro };
  return {};
};

export const nombreCliente = (order) => {
  if (order.user?.nombre) return `${order.user.nombre} ${order.user.apellido || ""}`.trim();
  if (order.comprador?.nombre) {
    return `${order.comprador.nombre} ${order.comprador.apellido || ""}`.trim();
  }
  return "Invitado";
};

// Mismo formato que tenía el panel ("$73.000"); hasta 2 decimales si los hay
export const pesos = (valor, decimales = 2) =>
  `$${Number(valor || 0).toLocaleString("es-AR", { maximumFractionDigits: decimales })}`;

export const fechaCorta = (order) =>
  new Date(order.date || order.createdAt).toLocaleDateString("es-AR");

export const numeroOrden = (order) => `#${order.orderNumber ?? order._id.slice(-5)}`;

export const necesitaAtencion = (order) =>
  Boolean(order.necesitaAtencion || order.enviopack?.necesitaAtencion);

// Motivos de revisión de una orden, en texto (puede tener los dos)
export const motivosAtencion = (order) => {
  const motivos = [];
  if (order.necesitaAtencion) motivos.push(order.motivoAtencion || "Requiere revisión.");
  if (order.enviopack?.necesitaAtencion) {
    const condicion = order.enviopack.condicion ? ` (Enviopack: ${order.enviopack.condicion})` : "";
    motivos.push(`Problema con el envío${condicion}.`);
  }
  return motivos;
};

// Singular o plural según la cantidad
export const plural = (n, singular, pluralTexto) => (n === 1 ? singular : pluralTexto);
