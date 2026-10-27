import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CartDropdown from "../../components/CartDropdown.jsx";

const IconoUsuario = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
);

const IconoCarrito = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 8H6" />
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </svg>
);

const IconoLuna = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
);

const IconoSol = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

// Cuenta, carrito y tema. Un solo juego para desktop y mobile (antes se dibujaba dos
// veces y había dos desplegables de carrito). En mobile se ocultan los textos y el tema
// (que pasa al menú lateral).
const NavbarActions = ({
  isAuthenticated,
  nombre,
  logOut,
  onLoginClick,
  cartItemsCount,
  theme,
  toggleTheme,
}) => {
  const [showCart, setShowCart] = useState(false);
  const [menuCuenta, setMenuCuenta] = useState(false);
  const cuentaRef = useRef(null);

  // Menú de la cuenta: se cierra al clickear afuera o con Escape
  useEffect(() => {
    if (!menuCuenta) return;
    const alClick = (e) => {
      if (!cuentaRef.current?.contains(e.target)) setMenuCuenta(false);
    };
    const alEscape = (e) => e.key === "Escape" && setMenuCuenta(false);
    document.addEventListener("mousedown", alClick);
    document.addEventListener("keydown", alEscape);
    return () => {
      document.removeEventListener("mousedown", alClick);
      document.removeEventListener("keydown", alEscape);
    };
  }, [menuCuenta]);

  return (
    <div className="nav-acciones">
      <div className="nav-cuenta" ref={cuentaRef}>
        {isAuthenticated ? (
          <button
            type="button"
            className="nav-accion"
            aria-haspopup="menu"
            aria-expanded={menuCuenta}
            onClick={() => setMenuCuenta((v) => !v)}
          >
            <IconoUsuario />
            <span className="nav-accion__textos">
              <span className="nav-accion__chico">{nombre ? `Hola, ${nombre}` : "Hola"}</span>
              <span className="nav-accion__texto">Mi cuenta</span>
            </span>
          </button>
        ) : (
          <button type="button" className="nav-accion" onClick={onLoginClick}>
            <IconoUsuario />
            <span className="nav-accion__textos">
              <span className="nav-accion__chico">Bienvenido</span>
              <span className="nav-accion__texto">Ingresar</span>
            </span>
          </button>
        )}

        {isAuthenticated && menuCuenta && (
          <div className="nav-cuenta__menu" role="menu">
            <Link to="/perfil" role="menuitem" onClick={() => setMenuCuenta(false)}>
              Mi cuenta
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuCuenta(false);
                logOut();
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <div className="cart-btn-container">
        <button
          type="button"
          className="nav-accion"
          aria-label={`Carrito, ${cartItemsCount} ${cartItemsCount === 1 ? "producto" : "productos"}`}
          aria-expanded={showCart}
          onClick={() => setShowCart((prev) => !prev)}
        >
          <span className="nav-carrito__icono">
            <IconoCarrito />
            {cartItemsCount > 0 && <span className="nav-carrito__cantidad">{cartItemsCount}</span>}
          </span>
          <span className="nav-accion__texto nav-solo-desktop">Carrito</span>
        </button>

        <CartDropdown isOpen={showCart} onClose={() => setShowCart(false)} />
      </div>

      <button
        type="button"
        className="nav-tema nav-solo-desktop"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      >
        {theme === "dark" ? <IconoSol /> : <IconoLuna />}
      </button>
    </div>
  );
};

export default NavbarActions;
