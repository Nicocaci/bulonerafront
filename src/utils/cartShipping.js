const DEFAULT_PESO_POR_PRODUCTO = 1;
const DEFAULT_PAQUETE = "20x15x10";

export function getCartWeight(cart) {
  if (!cart?.products?.length) return 0;
  return cart.products.reduce((total, item) => {
    const peso = item.product?.peso || DEFAULT_PESO_POR_PRODUCTO;
    const quantity = item.quantity || 1;
    return total + peso * quantity;
  }, 0);
}

export function getCartPaquetes() {
  // Simplificación: un solo bulto con dimensiones default.
  return DEFAULT_PAQUETE;
}
