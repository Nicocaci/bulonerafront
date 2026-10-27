import { normalizarTexto } from "../utils/categorias.js";

// Íconos de línea de la tienda (Home y navbar). Son decorativos: siempre van junto a un texto.
const Icono = ({ tam = 20, grosor = 1.8, children }) => (
  <svg
    width={tam}
    height={tam}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={grosor}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export const IconoWhatsapp = ({ tam = 18 }) => (
  <Icono tam={tam}>
    <path d="M4 20l1.4-4A8 8 0 1 1 8.5 19z" />
    <path d="M9 10.5c.5 2 2 3.5 4 4l1.2-1.2 2 1-.4 1.6c-3.5.4-7.6-3.7-7.2-7.2l1.6-.4 1 2z" />
  </Icono>
);

export const IconoFlechaDerecha = ({ tam = 16 }) => (
  <Icono tam={tam} grosor={2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icono>
);

export const IconoAnterior = () => (
  <Icono tam={18}>
    <path d="M15 6l-6 6 6 6" />
  </Icono>
);

export const IconoSiguiente = () => (
  <Icono tam={18}>
    <path d="M9 6l6 6-6 6" />
  </Icono>
);

export const IconoCamion = ({ tam = 28, grosor = 1.6 }) => (
  <Icono tam={tam} grosor={grosor}>
    <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Icono>
);

export const IconoTarjeta = () => (
  <Icono tam={28} grosor={1.6}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </Icono>
);

export const IconoLocal = () => (
  <Icono tam={28} grosor={1.6}>
    <path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10h18" />
    <path d="M10 20v-5h4v5" />
  </Icono>
);

export const IconoReloj = () => (
  <Icono tam={28} grosor={1.6}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icono>
);

// Íconos de categoría: se eligen por palabras del nombre (el nombre viene de la base)
const ICONOS_CATEGORIA = {
  manual: <path d="M14.5 6.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-2z" />,
  electric: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  inalambric: (
    <>
      <rect x="3" y="8" width="16" height="9" rx="2" />
      <path d="M21 11v3M7 11v3M11 11v3" />
    </>
  ),
  organizador: (
    <>
      <path d="M3 8l9-4 9 4v8l-9 4-9-4z" />
      <path d="M3 8l9 4 9-4M12 12v8" />
    </>
  ),
  jardin: (
    <>
      <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
      <path d="M5 19l7-7" />
    </>
  ),
  automotor: (
    <>
      <path d="M5 16V12l2-5h10l2 5v4" />
      <path d="M3 16h18v2H3z" />
      <circle cx="8" cy="13" r=".8" />
      <circle cx="16" cy="13" r=".8" />
    </>
  ),
  soldadura: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
  ),
  insumo: (
    <>
      <path d="M8 3h8l-1 3H9z" />
      <path d="M12 6v15M9.5 9l5 1.5M9.5 12l5 1.5M9.5 15l5 1.5" />
    </>
  ),
};

export const IconoCategoria = ({ nombre, tam = 26 }) => {
  const n = normalizarTexto(nombre);
  const clave = Object.keys(ICONOS_CATEGORIA).find((k) => n.includes(k));
  return (
    <Icono tam={tam} grosor={1.7}>
      {ICONOS_CATEGORIA[clave] || ICONOS_CATEGORIA.organizador}
    </Icono>
  );
};
