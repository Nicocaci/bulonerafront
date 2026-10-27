import { useEffect, useRef } from "react";
import { usarPlaceholder } from "../utils/imageUtils.js";

/**
 * Galería a pantalla completa del detalle de producto (se abre desde la miniatura "+N"
 * cuando el producto tiene más fotos de las que entran en la columna).
 * Teclado: flechas para cambiar de foto, Escape para cerrar. El índice es el mismo que
 * usa la foto principal: al cerrar, queda elegida la última foto que se miró.
 */
function GaleriaModal({ imagenes, indice, onCambiar, onCerrar, titulo }) {
  const cerrarRef = useRef(null);
  const miniaturasRef = useRef([]);
  const total = imagenes.length;

  const anterior = () => onCambiar((indice - 1 + total) % total);
  const siguiente = () => onCambiar((indice + 1) % total);

  // Foco en "Cerrar" al abrir, la página de atrás no se desplaza y al cerrar el foco
  // vuelve al botón que la abrió
  useEffect(() => {
    const previo = document.activeElement;
    cerrarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previo?.focus?.();
    };
  }, []);

  useEffect(() => {
    const alTeclado = (e) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowLeft") onCambiar((indice - 1 + total) % total);
      if (e.key === "ArrowRight") onCambiar((indice + 1) % total);
    };
    document.addEventListener("keydown", alTeclado);
    return () => document.removeEventListener("keydown", alTeclado);
  }, [indice, total, onCambiar, onCerrar]);

  // La miniatura elegida siempre queda a la vista
  useEffect(() => {
    miniaturasRef.current[indice]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [indice]);

  // Tab no sale del diálogo
  const alTab = (e) => {
    if (e.key !== "Tab") return;
    const enfocables = e.currentTarget.querySelectorAll("button");
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  };

  return (
    <div className="galeria-modal__fondo" onClick={onCerrar}>
      <div
        className="galeria-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Fotos de ${titulo}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={alTab}
      >
        <div className="galeria-modal__cabecera">
          <p className="galeria-modal__contador" aria-live="polite">
            Foto {indice + 1} de {total}
          </p>
          <button
            ref={cerrarRef}
            type="button"
            className="galeria-modal__cerrar"
            aria-label="Cerrar fotos"
            onClick={onCerrar}
          >
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="galeria-modal__foto">
          <button
            type="button"
            className="galeria-modal__flecha"
            aria-label="Foto anterior"
            onClick={anterior}
          >
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <img
            src={imagenes[indice]}
            alt={`${titulo} - foto ${indice + 1}`}
            onError={usarPlaceholder}
          />
          <button
            type="button"
            className="galeria-modal__flecha"
            aria-label="Foto siguiente"
            onClick={siguiente}
          >
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="galeria-modal__miniaturas">
          {imagenes.map((url, i) => (
            <button
              key={i}
              ref={(el) => (miniaturasRef.current[i] = el)}
              type="button"
              className={`detalle-miniatura ${i === indice ? "detalle-miniatura--activa" : ""}`}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-pressed={i === indice}
              onClick={() => onCambiar(i)}
            >
              <img src={url} alt="" loading="lazy" onError={usarPlaceholder} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GaleriaModal;
