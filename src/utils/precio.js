// Precio que se cobra por unidad: con IVA y con la oferta aplicada si está vigente.
// El backend calcula precioFinal; precioConIva queda como respaldo para datos viejos
// (por ejemplo, un carrito de invitado guardado antes de este cambio).
// Es solo para mostrar: el total real lo calcula el servidor al generar el pago.
export const getPrecioUnitario = (product) =>
  product?.precioFinal ?? product?.precioConIva ?? product?.price ?? 0;

export const tieneOfertaVigente = (product) => Boolean(product?.ofertaVigente);

export const formatearPrecio = (valor) =>
  Number(valor || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

// ID del producto de un ítem del carrito (logueado: product poblado; invitado: _id del ítem)
export const getProductIdDeItem = (item) => {
  if (item?.product && typeof item.product === "object") return item.product._id;
  if (typeof item?.product === "string") return item.product;
  return item?._id;
};
