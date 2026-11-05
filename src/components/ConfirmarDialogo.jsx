import { useEffect, useRef, useState } from "react";
import { responderConfirmar, suscribirConfirmar } from "../utils/confirmar.js";
import { useDialogo } from "../hooks/useDialogo.js";
import "../css/Avisos.css";

// Diálogo de confirmación del sitio. Se abre con confirmar() de utils/confirmar.js y se
// monta una sola vez (App.jsx). El foco arranca en "Cancelar" (lo seguro), Tab no sale
// del diálogo y Escape o un click afuera cancelan.

const IconoPeligro = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" />
    <path d="M9 7V4.5h6V7" />
    <path d="M6.5 7l1 12.5h9l1-12.5" />
  </svg>
);

const IconoPregunta = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.3a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.2-2.4 3.7" />
    <path d="M12 17v.01" />
  </svg>
);

const ConfirmarDialogo = () => {
  const [pedido, setPedido] = useState(null);
  const dialogoRef = useRef(null);

  useEffect(() => suscribirConfirmar(setPedido), []);

  useDialogo(dialogoRef, () => responderConfirmar(false), { activo: Boolean(pedido) });

  if (!pedido) return null;

  return (
    <div className="confirmar__fondo" onMouseDown={() => responderConfirmar(false)}>
      <div
        ref={dialogoRef}
        className="confirmar"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        aria-describedby={pedido.texto ? "confirmar-texto" : undefined}
        data-dialogo-encima=""
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className={`confirmar__icono ${pedido.peligro ? "confirmar__icono--peligro" : ""}`}>
          {pedido.peligro ? <IconoPeligro /> : <IconoPregunta />}
        </span>
        <h2 id="confirmar-titulo" className="confirmar__titulo">
          {pedido.titulo}
        </h2>
        {pedido.texto && (
          <p id="confirmar-texto" className="confirmar__texto">
            {pedido.texto}
          </p>
        )}
        <div className="confirmar__botones">
          <button
            type="button"
            className="confirmar__boton confirmar__boton--cancelar"
            onClick={() => responderConfirmar(false)}
          >
            {pedido.cancelar}
          </button>
          <button
            type="button"
            className={`confirmar__boton ${pedido.peligro ? "confirmar__boton--peligro" : "confirmar__boton--principal"}`}
            onClick={() => responderConfirmar(true)}
          >
            {pedido.confirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarDialogo;
