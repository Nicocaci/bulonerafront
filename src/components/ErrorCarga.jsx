import { Component } from "react";

// Red de seguridad para las páginas que se cargan por partes: si el archivo de una página
// no se puede descargar (sin conexión, o un deploy en el medio), en lugar de dejar la
// pantalla en blanco se muestra un aviso con un botón para reintentar.
// Se reinicia al cambiar de página (App le pasa la ruta como key).
class ErrorCarga extends Component {
  state = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(error) {
    console.error("Error al mostrar la página:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="ruta-cargando error-carga" role="alert">
        <p>No pudimos cargar esta página. Revisá tu conexión e intentá de nuevo.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }
}

export default ErrorCarga;
