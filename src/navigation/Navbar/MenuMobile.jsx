import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const IconoFlecha = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

// Menú lateral de mobile: cuenta, ofertas, categorías con cantidades, páginas
// informativas y el modo oscuro.
const MenuMobile = ({
  abierto,
  onCerrar,
  categorias,
  isAuthenticated,
  nombre,
  onLogin,
  logOut,
  theme,
  toggleTheme,
}) => {
  const cerrarRef = useRef(null);

  // Al abrir: foco en "Cerrar", Escape cierra y la página de atrás no se desplaza
  useEffect(() => {
    if (!abierto) return;
    cerrarRef.current?.focus();
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alEscape = (e) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alEscape);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", alEscape);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="menu-mobile__fondo" onClick={onCerrar}>
      <aside
        id="menu-mobile"
        className="menu-mobile"
        aria-label="Menú"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-mobile__cabecera">
          <img src="/logo-texto-blanco.svg" width={88} height={44} alt="Bulonera El Triángulo" />
          <button type="button" ref={cerrarRef} className="menu-mobile__cerrar" aria-label="Cerrar menú" onClick={onCerrar}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="menu-mobile__cuenta">
          {isAuthenticated ? (
            <>
              <span className="menu-mobile__avatar" aria-hidden="true">
                {(nombre || "?").charAt(0).toUpperCase()}
              </span>
              <span className="menu-mobile__saludo">
                <strong>{nombre ? `Hola, ${nombre}` : "Hola"}</strong>
                <Link to="/perfil" onClick={onCerrar}>Ver mi cuenta</Link>
              </span>
              <button
                type="button"
                className="menu-mobile__salir"
                onClick={() => {
                  onCerrar();
                  logOut();
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <button
              type="button"
              className="menu-mobile__ingresar"
              onClick={() => {
                onCerrar();
                onLogin();
              }}
            >
              Ingresar o crear cuenta
            </button>
          )}
        </div>

        <nav className="menu-mobile__cuerpo" aria-label="Secciones">
          <Link to="/productos?ofertas=true" className="menu-mobile__ofertas" onClick={onCerrar}>
            Ver ofertas
          </Link>

          <p className="menu-mobile__titulo">Productos</p>
          {categorias.map((c) => (
            <Link
              key={c.valor}
              to={`/productos?categoria=${encodeURIComponent(c.valor)}`}
              className="menu-mobile__link"
              onClick={onCerrar}
            >
              <span>{c.valor}</span>
              <span className="menu-mobile__cantidad">
                {c.cantidad}
                <IconoFlecha />
              </span>
            </Link>
          ))}
          <Link to="/productos?todos=true" className="menu-mobile__link menu-mobile__link--marca" onClick={onCerrar}>
            Ver todos los productos
          </Link>

          <p className="menu-mobile__titulo">Información</p>
          <Link to="/contacto" className="menu-mobile__link" onClick={onCerrar}>Contacto y cotizaciones</Link>
          <Link to="/nosotros" className="menu-mobile__link" onClick={onCerrar}>Nosotros</Link>
          <Link to="/faq" className="menu-mobile__link" onClick={onCerrar}>Preguntas frecuentes</Link>
        </nav>

        <label className="menu-mobile__tema">
          <span>Modo oscuro</span>
          <input type="checkbox" role="switch" checked={theme === "dark"} onChange={toggleTheme} />
        </label>
      </aside>
    </div>
  );
};

export default MenuMobile;
