// Abre el carrito lateral desde cualquier página (lo escucha NavbarActions, que es el
// que lo tiene). `recienAgregado` es el _id del producto que se acaba de agregar: el
// carrito muestra "Agregaste este producto al carrito" y lo resalta.
export const EVENTO_ABRIR_CARRITO = "abrir-carrito-lateral";

export function abrirCarritoLateral(recienAgregado = null) {
  window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_CARRITO, { detail: { recienAgregado } }));
}

// En pantallas chicas el carrito lateral tapa todo: ahí, al agregar, se muestra un aviso
export const esPantallaChica = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
