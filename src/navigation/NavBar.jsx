import React, { useState, useContext, useEffect, useRef } from "react";
import "../css/NavBar.css";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import { FiAlignJustify } from "react-icons/fi";
import { FaPercent } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext.jsx";

import AuthModal from "../components/AuthModal";
import NavbarActions from "./Navbar/NavbarActions.jsx";
import axiosInstance from "../utils/axiosConfig";
import NavbarMenu from "./Navbar/NavbarMenu.jsx";

const NavBar = () => {
  const { isAuthenticated, logOut } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // refs
  const searchRef = useRef(null); // <form> del buscador (input + dropdown)
  const menuRef = useRef(null); // menú mobile
  const hamburgerRef = useRef(null); // botón hamburguesa

  // estados de UI
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbarMenu, setShowNavbarMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // estados del buscador
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const cartItemsCount =
    cart?.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;

  const handleUserClick = () => {
    if (!isAuthenticated) return setShowAuthModal(true);
    navigate("/perfil");
  };

  const goHome = () => navigate("/");

  // ─────────────────────────────────────────────
  // BÚSQUEDA CON DEBOUNCE
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!searchInput.trim()) {
      setResults([]);
      setShowDropdown(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        setShowDropdown(true);
        setHasSearched(true);

        const response = await axiosInstance.get("/api/products", {
          signal: controller.signal,
          params: { search: searchInput.trim(), limit: 8, page: 1 },
        });

        setResults(response.data?.products || []);
      } catch (err) {
        // si la request fue cancelada por una búsqueda nueva, no hacemos nada
        if (controller.signal.aborted) return;
        console.error(err);
        setResults([]);
      } finally {
        // solo apagamos el loading si esta request sigue siendo la vigente
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [searchInput]);

  // ─────────────────────────────────────────────
  // CERRAR DROPDOWN DEL BUSCADOR AL CLICKEAR AFUERA
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutsideSearch = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, [showDropdown]);

  // ─────────────────────────────────────────────
  // CERRAR MENÚ MOBILE AL CLICKEAR AFUERA
  // (ignora el botón hamburguesa, si no se cerraba y se reabría al toque)
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event) => {
      const clickedInsideMenu = menuRef.current?.contains(event.target);
      const clickedHamburger = hamburgerRef.current?.contains(event.target);

      if (!clickedInsideMenu && !clickedHamburger) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // ─────────────────────────────────────────────
  // AL CAMBIAR DE PÁGINA: CERRAR TODO
  // ─────────────────────────────────────────────
  useEffect(() => {
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
    setIsMenuOpen(false);
    setShowNavbarMenu(false);
  }, [location.pathname]);

  // ─────────────────────────────────────────────
  // FOCUS AL ABRIR EL BUSCADOR EN MOBILE
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (isMobileSearchOpen) {
      searchRef.current?.querySelector("input")?.focus();
    }
  }, [isMobileSearchOpen]);

  // ─────────────────────────────────────────────
  // MODAL DE LOGIN ABIERTO DESDE OTROS COMPONENTES (ej: CartDetail)
  // ─────────────────────────────────────────────
  useEffect(() => {
    const handleOpenAuthModal = () => setShowAuthModal(true);
    window.addEventListener("open-login-modal", handleOpenAuthModal);
    return () =>
      window.removeEventListener("open-login-modal", handleOpenAuthModal);
  }, []);

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const trimmedSearch = searchInput.trim();
    const nextUrl = trimmedSearch
      ? `/productos?search=${encodeURIComponent(trimmedSearch)}`
      : "/productos";

    navigate(nextUrl);
    setShowDropdown(false);
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
    searchRef.current?.querySelector("input")?.blur();
  };

  const handleProductClick = (productId) => {
    setSearchInput(""); // limpia el input → el effect no vuelve a buscar
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
    navigate(`/producto/${productId}`);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen((prev) => !prev);
    setShowDropdown(false);
  };

  const closeAllMobileMenus = () => {
    setShowNavbarMenu(false);
    setIsMenuOpen(false);
  };

  const closeMenuOnLink = () => setIsMenuOpen(false);

  return (
    <div className="navbar-container">
      {/* ───────── BARRA MOBILE (logo + acciones + hamburguesa) ───────── */}
      <div className="hamburger-container">
        <img
          className="logo-navbar logo-navbar-mobile"
          src="/logo-fondo-negro.png"
          alt="logo"
          onClick={goHome}
        />
        <div className="div-navbar-2 navbar-actions-mobile">
          <NavbarActions
            isAuthenticated={isAuthenticated}
            logOut={logOut}
            onUserClick={handleUserClick}
            cartItemsCount={cartItemsCount}
            onSearchClick={handleMobileSearchToggle}
          />
        </div>

        <button
          type="button"
          ref={hamburgerRef}
          className="hamburger-btn"
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          {isMenuOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* ───────── TOP (logo + buscador + acciones desktop) ───────── */}
      <div
        className={`navbar-top-container ${
          isMobileSearchOpen ? "search-open" : "search-closed"
        }`}
      >
        <div className="navbar-top">
          <div className="div-navbar-1">
            <img
              className="logo-navbar"
              src="/logo-fondo-negro.png"
              alt="logo"
              onClick={goHome}
            />
          </div>

          <div className="div-navbar">
            <form
              ref={searchRef}
              className={`input-search-container ${
                isMobileSearchOpen
                  ? "mobile-search-open"
                  : "mobile-search-closed"
              }`}
              onSubmit={handleSearchSubmit}
            >
              <input
                placeholder="🔎 Buscar productos..."
                type="search"
                className="input-search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value.trim()) setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchInput.trim()) setShowDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowDropdown(false);
                }}
              />

              {showDropdown && searchInput.trim() && (
                <ul className="search-dropdown">
                  {loading && <li style={{ color: "#000000" }}>Cargando...</li>}

                  {!loading && hasSearched && results.length === 0 && (
                    <li style={{ color: "#000000" }}>
                      No se encontraron productos
                    </li>
                  )}

                  {!loading &&
                    results.map((product) => (
                      <li
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="probando-drop"
                      >
                        <div className="dropdown-navbar-container">
                          <img
                            className="img-navbar-dropwdown"
                            src={getImageUrl(product.imagen?.[0])}
                            alt={product.item}
                          />
                          <div>
                            <p className="marca-prod-navbar">{product.marca}</p>
                            <p className="nombre-prod-navbar">{product.item}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </form>
          </div>

          <div className="div-navbar-2 navbar-actions-desktop">
            <NavbarActions
              isAuthenticated={isAuthenticated}
              logOut={logOut}
              onUserClick={handleUserClick}
              cartItemsCount={cartItemsCount}
            />
          </div>
        </div>
      </div>

      {/* ───────── MENÚ ───────── */}
      <div className="navbar-menu-container">
        <div
          className={`navbar-menu ${isMenuOpen ? "open" : ""}`}
          ref={menuRef}
        >
          <button type="button" className="close-btn" onClick={toggleMenu}>
            X
          </button>

          <button
            type="button"
            className="btn-navbar"
            onClick={() => setShowNavbarMenu((prev) => !prev)}
          >
            <FiAlignJustify />
            Productos
          </button>

          <NavbarMenu
            isOpen={showNavbarMenu}
            onClose={() => setShowNavbarMenu(false)}
            onSelectCategory={closeAllMobileMenus}
          />

          <ul className="li-navbar">
            <li>
              <Link
                to="/productos?ofertas=true"
                onClick={closeMenuOnLink}
                className="ofertas-link"
              >
                <FaPercent size={10} className="icono-ofertas" /> OFERTAS
              </Link>
            </li>
            <div className="mxh-nav-sep"></div>
            <li>
              <Link
                to="/productos?categoria=Herramientas+Manuales"
                onClick={closeMenuOnLink}
              >
                He. Manuales
              </Link>
            </li>
            <li>
              <Link
                to="/productos?categoria=Herramientas+Electricas"
                onClick={closeMenuOnLink}
              >
                He. Eléctricas
              </Link>
            </li>
            <li>
              <Link
                to="/productos?categoria=Soldadura"
                onClick={closeMenuOnLink}
              >
                Soldadura
              </Link>
            </li>
            <li>
              <Link
                to="/productos?categoria=Automotor"
                onClick={closeMenuOnLink}
              >
                Automotor
              </Link>
            </li>
            <li>
              <Link to="/productos?categoria=Jardin" onClick={closeMenuOnLink}>
                Jardín
              </Link>
            </li>
            <div className="mxh-nav-sep"></div>
            <li>
              <Link to="/contacto" onClick={closeMenuOnLink}>
                CONTACTO
              </Link>
            </li>
            <li>
              <Link to="/nosotros" onClick={closeMenuOnLink}>
                NOSOTROS
              </Link>
            </li>
          </ul>

          <button
            type="button"
            className={`theme-toggle ${theme === "light" ? "light" : ""}`}
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            <span className="toggle-track">
              <span className="toggle-thumb">
                {theme === "light" ? "☀️" : "🌙"}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Un único AuthModal (antes se renderizaba dos veces) */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default NavBar;
