// Avisos chicos (toasts) del sitio: reemplazan a SweetAlert2 para todo lo que no
// necesita una decisión del usuario. Los dibuja components/Avisos.jsx (montado una vez en
// App.jsx); se pueden pedir desde cualquier archivo, también desde los contextos.
//
//   avisar.exito("Perfil actualizado", "Tus datos se han actualizado correctamente.");
//   avisar.error("No se pudo vaciar el carrito", "Intentá de nuevo.", {
//     accion: { texto: "Reintentar", onClick: vaciar },
//   });
//
// Tipos: "exito", "error", "advertencia", "info".
// Se cierran solos a los 4 s (se pausan con el mouse encima o con foco); los errores
// quedan hasta que se cierran. `duracion: 0` hace que cualquier aviso quede fijo.
// `texto` puede ser un string o una lista de strings (una línea cada uno).

const DURACION = 4000;
const MAXIMO = 3; // si llegan más, se van los más viejos
const CLAVE_PENDIENTE = "aviso-pendiente";

let siguienteId = 1;
let avisos = [];
const oyentes = new Set();

const emitir = () => oyentes.forEach((fn) => fn(avisos));

export function suscribirAvisos(fn) {
  oyentes.add(fn);
  fn(avisos);
  return () => oyentes.delete(fn);
}

export function cerrarAviso(id) {
  avisos = avisos.filter((a) => a.id !== id);
  emitir();
}

export function avisar({ tipo = "info", titulo, texto, accion, duracion } = {}) {
  const id = siguienteId++;
  const lineas = Array.isArray(texto) ? texto : texto ? [texto] : [];
  // El mismo aviso dos veces seguidas (doble click, varios pedidos que fallan) se muestra una vez
  const repetido = avisos.find(
    (a) => a.tipo === tipo && a.titulo === titulo && a.lineas.join("\n") === lineas.join("\n"),
  );
  if (repetido) avisos = avisos.filter((a) => a !== repetido);

  const aviso = {
    id,
    tipo,
    titulo,
    lineas,
    accion,
    duracion: duracion ?? (tipo === "error" ? 0 : DURACION),
  };
  avisos = [...avisos, aviso].slice(-MAXIMO);
  emitir();
  return id;
}

avisar.exito = (titulo, texto, extra) => avisar({ ...extra, tipo: "exito", titulo, texto });
avisar.error = (titulo, texto, extra) => avisar({ ...extra, tipo: "error", titulo, texto });
avisar.advertencia = (titulo, texto, extra) =>
  avisar({ ...extra, tipo: "advertencia", titulo, texto });
avisar.info = (titulo, texto, extra) => avisar({ ...extra, tipo: "info", titulo, texto });

// Para un aviso que se tiene que ver después de recargar la página (por ejemplo,
// "Sesión cerrada" antes de volver al inicio). Solo admite avisos sin `accion`.
export function avisarDespuesDeRecargar(aviso) {
  try {
    sessionStorage.setItem(CLAVE_PENDIENTE, JSON.stringify(aviso));
  } catch {
    // Sin sessionStorage (modo privado estricto): el aviso no se muestra, no pasa nada
  }
}

export function mostrarAvisoPendiente() {
  try {
    const guardado = sessionStorage.getItem(CLAVE_PENDIENTE);
    if (!guardado) return;
    sessionStorage.removeItem(CLAVE_PENDIENTE);
    avisar(JSON.parse(guardado));
  } catch {
    // Dato roto o sin sessionStorage: se ignora
  }
}
