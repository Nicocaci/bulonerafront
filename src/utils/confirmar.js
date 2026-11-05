// Confirmaciones del sitio (reemplazan a SweetAlert2 para "¿Vaciar carrito?", "¿Eliminar
// usuario?", etc.). Las dibuja components/ConfirmarDialogo.jsx, montado una vez en App.jsx.
//
//   const ok = await confirmar({
//     titulo: "¿Vaciar carrito?",
//     texto: "Se eliminarán todos los productos del carrito.",
//     confirmar: "Vaciar carrito",
//     peligro: true,
//   });
//   if (!ok) return;
//
// Devuelve una promesa con true (confirmó) o false (canceló, Escape o click afuera).
// Opciones: titulo, texto, confirmar (texto del botón), cancelar (default "Cancelar"),
// peligro (botón rojo, para acciones que no se pueden deshacer).

let actual = null;
const oyentes = new Set();

const emitir = () => oyentes.forEach((fn) => fn(actual));

export function suscribirConfirmar(fn) {
  oyentes.add(fn);
  fn(actual);
  return () => oyentes.delete(fn);
}

export function confirmar(opciones) {
  return new Promise((resolve) => {
    // Si había otra abierta (no debería pasar), se da por cancelada
    actual?.resolve(false);
    actual = { cancelar: "Cancelar", confirmar: "Aceptar", ...opciones, resolve };
    emitir();
  });
}

export function responderConfirmar(valor) {
  const abierta = actual;
  actual = null;
  emitir();
  abierta?.resolve(valor);
}

// Para que Escape no cierre lo que está atrás (carrito lateral, modales) mientras hay una
// confirmación abierta
export const hayConfirmacionAbierta = () => actual !== null;
