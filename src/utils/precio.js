// Precio que se cobra por unidad: con IVA y con la oferta aplicada si está vigente.
// El backend calcula precioFinal; precioConIva queda como respaldo para datos viejos
// (por ejemplo, un carrito de invitado guardado antes de este cambio).
// Es solo para mostrar: el total real lo calcula el servidor al generar el pago.
export const getPrecioUnitario = (product) =>
  product?.precioFinal ?? product?.precioConIva ?? product?.price ?? 0;

export const tieneOfertaVigente = (product) => Boolean(product?.ofertaVigente);

// Formato único de precios en todo el sitio (Fase 6): "$6.068" o "$6.068,50".
// Los centavos se muestran solo si el importe los tiene (y entonces siempre dos dígitos).
// maxDecimales = 0 redondea a pesos enteros (por ejemplo, el ticket promedio del panel).
export const formatearPrecio = (valor, maxDecimales = 2) => {
  const n = Number(valor) || 0;
  const conCentavos = maxDecimales > 0 && Math.round(Math.abs(n) * 100) % 100 !== 0;
  const texto = Math.abs(n).toLocaleString("es-AR", {
    minimumFractionDigits: conCentavos ? 2 : 0,
    maximumFractionDigits: conCentavos ? 2 : 0,
  });
  return `${n < 0 ? "-" : ""}$${texto}`;
};

// ID del producto de un ítem del carrito (logueado: product poblado; invitado: _id del ítem)
export const getProductIdDeItem = (item) => {
  if (item?.product && typeof item.product === "object") return item.product._id;
  if (typeof item?.product === "string") return item.product;
  return item?._id;
};
