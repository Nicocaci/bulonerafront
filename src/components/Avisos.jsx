import { useEffect, useState } from "react";
import { cerrarAviso, mostrarAvisoPendiente, suscribirAvisos } from "../utils/avisos.js";
import "../css/Avisos.css";

// Pila de avisos (toasts): arriba a la derecha en desktop, abajo en mobile.
// Se pide un aviso con avisar() de utils/avisos.js; este componente se monta una sola vez
// (App.jsx). Estilos en css/Avisos.css.

const Icono = ({ tipo }) => {
  const trazo = {
    exito: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    error: <path d="M7 7l10 10M17 7L7 17" />,
    advertencia: (
      <>
        <path d="M12 6v7" />
        <path d="M12 17.5v.01" />
      </>
    ),
    info: (
      <>
        <path d="M12 11v6" />
        <path d="M12 7v.01" />
      </>
    ),
  }[tipo];
  return (
    <span className="aviso__icono" aria-hidden="true">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {trazo}
      </svg>
    </span>
  );
};

const textoParaLectores = (aviso) =>
  aviso ? [aviso.titulo, ...aviso.lineas].filter(Boolean).join(". ") : "";

const Avisos = () => {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const desuscribir = suscribirAvisos(setAvisos);
    mostrarAvisoPendiente();
    return desuscribir;
  }, []);

  // Los lectores de pantalla leen el último aviso desde estas regiones, que existen
  // siempre (una región que aparece junto con su texto no siempre se anuncia).
  const ultimo = avisos[avisos.length - 1];
  const ultimoError = [...avisos].reverse().find((a) => a.tipo === "error");

  return (
    <>
      <div className="solo-lectores" role="status" aria-live="polite">
        {ultimo && ultimo.tipo !== "error" ? textoParaLectores(ultimo) : ""}
      </div>
      <div className="solo-lectores" role="alert">
        {textoParaLectores(ultimoError)}
      </div>

      <section className="avisos" aria-label="Avisos">
        {avisos.map((a) => (
          <div key={a.id} className={`aviso aviso--${a.tipo}`}>
            <div className="aviso__cuerpo">
              <Icono tipo={a.tipo} />
              <div className="aviso__textos">
                {a.titulo && <p className="aviso__titulo">{a.titulo}</p>}
                {a.lineas.map((linea, i) => (
                  <p key={i} className="aviso__texto">
                    {linea}
                  </p>
                ))}
                {a.accion && (
                  <button
                    type="button"
                    className="aviso__accion"
                    onClick={() => {
                      cerrarAviso(a.id);
                      a.accion.onClick?.();
                    }}
                  >
                    {a.accion.texto}
                  </button>
                )}
              </div>
              <button
                type="button"
                className="aviso__cerrar"
                aria-label="Cerrar aviso"
                onClick={() => cerrarAviso(a.id)}
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {a.duracion > 0 && (
              // La barra marca el tiempo que queda; cuando termina su animación, el aviso
              // se cierra (así se pausa sola con el mouse encima o con foco, por CSS)
              <div className="aviso__pista">
                <div
                  className="aviso__barra"
                  style={{ animationDuration: `${a.duracion}ms` }}
                  onAnimationEnd={() => cerrarAviso(a.id)}
                />
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
};

export default Avisos;
