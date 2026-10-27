import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import "../css/NavBar.css";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ANCHO_MINIATURA, getImageUrl, usarPlaceholder } from "../utils/imageUtils";
import { useTheme } from "../context/ThemeContext.jsx";
import { useFacetas } from "../hooks/useCatalogo.js";

import AuthModal from "../components/AuthModal";
import NavbarActions from "./Navbar/NavbarActions.jsx";
import NavbarMenu from "./Navbar/NavbarMenu.jsx";
import MenuMobile from "./Navbar/MenuMobile.jsx";
import axiosInstance from "../utils/axiosConfig";

// Categorías con acceso directo (barra de desktop y accesos rápidos de mobile).
// El valor es el nombre exacto de la categoría en la base.
const CATEGORIAS_DESTACADAS = [
  { valor: "Herramientas Manuales", texto: "Herramientas manuales", corto: "Manuales" },
  { valor: "Herramientas Electricas", texto: "Herramientas eléctricas", corto: "Eléctricas" },
  { valor: "Soldadura", texto: "Soldadura", corto: "Soldadura" },
  { valor: "Automotor", texto: "Automotor", corto: "Automotor", secundaria: true },
  { valor: "Jardin", texto: "Jardín", corto: "Jardín", secundaria: true },
];

const linkCategoria = (valor) => `/productos?categoria=${encodeURIComponent(valor)}`;

const NavBar = () => {
  const { isAuthenticated, user, logOut, getProfile } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // refs
  const searchRef = useRef(null); // <form> del buscador (input + resultados)
  const menuCategoriasRef = useRef(null); // botón "Todos los productos" + panel
  const hamburguesaRef = useRef(null);

  // estados de UI
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false);
  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // estados del buscador
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Categorías con cantidades (la misma consulta que usa la página de productos sin filtros)
  const { data: facetas, isLoading: cargandoCategorias } = useFacetas();
  const categorias = [...(facetas?.categorias ?? [])].sort((a, b) => b.cantidad - a.cantidad);

  // Nombre para el saludo "Hola, Nico" (una consulta por sesión, queda en caché)
  const { data: perfil } = useQuery({
    queryKey: ["perfil", user?.id],
    queryFn: getProfile,
    enabled: Boolean(isAuthenticated && user?.id),
    staleTime: 5 * 60 * 1000,
  });
  const nombre = perfil?.nombre?.trim().split(/\s+/)[0] || "";

  const cartItemsCount =
    cart?.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;

  const cerrarMenuMobile = useCallback(() => {
    setMenuMobileAbierto(false);
    hamburguesaRef.current?.focus();
  }, []);

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
          params: { search: searchInput.trim(), limit: 8, page: 1, vista: "resumen" },
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
  // CERRAR RESULTADOS DEL BUSCADOR Y MENÚ DE CATEGORÍAS AL CLICKEAR AFUERA
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!showDropdown && !menuCategoriasAbierto) return;

    const alClickAfuera = (event) => {
      if (showDropdown && !searchRef.current?.contains(event.target)) {
        setShowDropdown(false);
      }
      if (menuCategoriasAbierto && !menuCategoriasRef.current?.contains(event.target)) {
        setMenuCategoriasAbierto(false);
      }
    };
    const alEscape = (e) => {
      if (e.key !== "Escape") return;
      setShowDropdown(false);
      setMenuCategoriasAbierto(false);
    };

    document.addEventListener("mousedown", alClickAfuera);
    document.addEventListener("keydown", alEscape);
    return () => {
      document.removeEventListener("mousedown", alClickAfuera);
      document.removeEventListener("keydown", alEscape);
    };
  }, [showDropdown, menuCategoriasAbierto]);

  // ─────────────────────────────────────────────
  // AL CAMBIAR DE PÁGINA: CERRAR TODO
  // ─────────────────────────────────────────────
  useEffect(() => {
    setShowDropdown(false);
    setMenuMobileAbierto(false);
    setMenuCategoriasAbierto(false);
  }, [location.pathname, location.search]);

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
    searchRef.current?.querySelector("input")?.blur();
  };

  const handleProductClick = (productId) => {
    setSearchInput(""); // limpia el input → el effect no vuelve a buscar
    setShowDropdown(false);
    navigate(`/producto/${productId}`);
  };

  // La barra de categorías marca como activa la categoría que se está viendo
  const categoriaActual =
    location.pathname === "/productos"
      ? new URLSearchParams(location.search).get("categoria")
      : null;
  const enOfertas =
    location.pathname === "/productos" &&
    new URLSearchParams(location.search).get("ofertas") === "true";

  return (
    <>
      <header className="nav">
        <div className="nav-top">
          <div className="nav-top__contenedor">
            <button
              type="button"
              ref={hamburguesaRef}
              className="nav-hamburguesa"
              onClick={() => setMenuMobileAbierto(true)}
              aria-label="Abrir menú"
              aria-expanded={menuMobileAbierto}
              aria-controls="menu-mobile"
            >
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="nav-logo" aria-label="Bulonera El Triángulo, inicio">
              <img src="/logo-texto-blanco.svg" width={120} height={60} alt="Bulonera El Triángulo" />
            </Link>

            <form
              ref={searchRef}
              className="nav-buscador"
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <label htmlFor="buscador-navbar" className="solo-lectores">
                Buscar productos
              </label>
              <svg className="nav-buscador__lupa" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                id="buscador-navbar"
                placeholder="Buscá por nombre, marca o código"
                type="search"
                autoComplete="off"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value.trim()) setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchInput.trim()) setShowDropdown(true);
                }}
              />
              <button type="submit" className="nav-buscador__boton">
                Buscar
              </button>

              {showDropdown && searchInput.trim() && (
                <ul className="nav-resultados" aria-live="polite">
                  {loading && <li className="nav-resultados__estado">Buscando…</li>}

                  {!loading && hasSearched && results.length === 0 && (
                    <li className="nav-resultados__estado">No se encontraron productos</li>
                  )}

                  {!loading &&
                    results.map((product) => (
                      <li key={product._id}>
                        <button
                          type="button"
                          className="nav-resultados__item"
                          onClick={() => handleProductClick(product._id)}
                        >
                          <img
                            src={getImageUrl(product.imagen?.[0], ANCHO_MINIATURA)}
                            alt=""
                            width={56}
                            height={56}
                            onError={usarPlaceholder}
                          />
                          <span>
                            <span className="nav-resultados__marca">{product.marca}</span>
                            <span className="nav-resultados__nombre">{product.item}</span>
                          </span>
                        </button>
                      </li>
                    ))}

                  {!loading && results.length > 0 && (
                    <li>
                      <button type="submit" className="nav-resultados__todos">
                        Ver todos los resultados
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </form>

            <NavbarActions
              isAuthenticated={isAuthenticated}
              nombre={nombre}
              logOut={logOut}
              onLoginClick={() => setShowAuthModal(true)}
              cartItemsCount={cartItemsCount}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>
        </div>

        <div className="nav-barra">
          <nav className="nav-barra__contenedor" aria-label="Principal">
            <div className="nav-barra__productos" ref={menuCategoriasRef}>
              <button
                type="button"
                className={`nav-barra__todos ${menuCategoriasAbierto ? "abierto" : ""}`}
                aria-expanded={menuCategoriasAbierto}
                aria-controls="menu-categorias"
                onClick={() => setMenuCategoriasAbierto((v) => !v)}
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Todos los productos
                <svg className="nav-barra__flecha" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {menuCategoriasAbierto && (
                <NavbarMenu
                  id="menu-categorias"
                  categorias={categorias}
                  cargando={cargandoCategorias}
                  onElegir={() => setMenuCategoriasAbierto(false)}
                />
              )}
            </div>

            <Link
              to="/productos?ofertas=true"
              className="nav-barra__ofertas"
              aria-current={enOfertas ? "page" : undefined}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M19 5L5 19" />
                <circle cx="7" cy="7" r="2.5" />
                <circle cx="17" cy="17" r="2.5" />
              </svg>
              Ofertas
            </Link>

            <span className="nav-barra__separador" aria-hidden="true" />

            {CATEGORIAS_DESTACADAS.map((c) => (
              <Link
                key={c.valor}
                to={linkCategoria(c.valor)}
                className={`nav-barra__link ${c.secundaria ? "nav-barra__link--secundaria" : ""}`}
                aria-current={categoriaActual === c.valor ? "page" : undefined}
              >
                {c.texto}
              </Link>
            ))}

            <span className="nav-barra__espacio" />

            <NavLink to="/contacto" className="nav-barra__link nav-barra__link--info">
              Contacto
            </NavLink>
            <NavLink to="/nosotros" className="nav-barra__link nav-barra__link--info">
              Nosotros
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Mobile: accesos rápidos debajo del header (no quedan fijos al bajar) */}
      <nav className="nav-rapido" aria-label="Accesos rápidos">
        <Link to="/productos?ofertas=true" className="nav-rapido__ofertas">
          Ofertas
        </Link>
        {CATEGORIAS_DESTACADAS.map((c) => (
          <Link key={c.valor} to={linkCategoria(c.valor)}>
            {c.corto}
          </Link>
        ))}
      </nav>

      <MenuMobile
        abierto={menuMobileAbierto}
        onCerrar={cerrarMenuMobile}
        categorias={categorias}
        isAuthenticated={isAuthenticated}
        nombre={nombre}
        onLogin={() => setShowAuthModal(true)}
        logOut={logOut}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default NavBar;
