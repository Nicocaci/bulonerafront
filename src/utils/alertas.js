// SweetAlert2 pesa ~77 KB: en lugar de bajarlo al abrir el sitio, se descarga recién la
// primera vez que hay que mostrar un aviso (después queda cargado).
// Se usa igual que la librería: Swal.fire({...}) devuelve la misma promesa con el resultado.
// Solo lo necesitan los archivos que se cargan al inicio (contextos, navbar, carrito);
// las páginas que se cargan por partes pueden importar "sweetalert2" directamente.
let modulo = null;
let carga = null;
let pendientes = 0; // avisos pedidos mientras la librería se descarga

const cargar = () => {
  if (!carga) {
    carga = import("sweetalert2").then((m) => {
      modulo = m.default;
      return modulo;
    });
    // Si falló la descarga (sin conexión), el próximo aviso lo vuelve a intentar
    carga.catch(() => {
      carga = null;
    });
  }
  return carga;
};

const Swal = {
  fire(...args) {
    pendientes++;
    return cargar().then(
      (S) => {
        pendientes--;
        return S.fire(...args);
      },
      (error) => {
        pendientes--;
        throw error;
      },
    );
  },
  // Un aviso que se está descargando cuenta como visible (para no abrir otro encima)
  isVisible() {
    return pendientes > 0 || (modulo ? modulo.isVisible() : false);
  },
};

export default Swal;
