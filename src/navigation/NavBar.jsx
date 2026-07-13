import React, { useState, useContext, useEffect, useRef } from "react";
import "../css/NavBar.css";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import { FiAlignJustify } from "react-icons/fi";

import AuthModal from "../components/AuthModal";
import ProductsDropdown from "./Navbar/ProductsDropdown.jsx";
import NavbarActions from "./Navbar/NavbarActions.jsx";
import axiosInstance from "../utils/axiosConfig";
import NavbarMenu from "./Navbar/NavbarMenu.jsx";

const NavBar = () => {
  const { isAuthenticated, logOut } = useContext(AuthContext);
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const searchRef = useRef(null);

  // scroll behavior
  const [isVisible, setIsVisible] = useState(!isHome);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbarMenu, setShowNavbarMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleUserClick = () => {
    if (!isAuthenticated) return setShowAuthModal(true);
    navigate("/perfil");
  };

  const cartItemsCount =
    cart?.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;

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
          params: {
            search: searchInput.trim(),
            limit: 8,
            page: 1,
          },
        });

        setResults(response.data?.products || []);
        setShowDropdown(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [searchInput]);

  // CERRAR AL CLICKEAR FUERA DEL MENÚ
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (isHome) {
        setIsVisible(currentY > 80); // en home: aparece al scrollear
      } else {
        setIsVisible(true); // en otras páginas: siempre visible/fijo
      }

      setIsScrolled(currentY > 10);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    setIsVisible(!isHome);
    setIsScrolled(false);
    lastScrollY.current = 0;
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const trimmedSearch = searchInput.trim();
    const nextUrl = trimmedSearch
      ? `/productos?search=${encodeURIComponent(trimmedSearch)}`
      : "/productos";

    navigate(nextUrl);
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen((prev) => {
      const nextValue = !prev;

      if (nextValue) {
        setTimeout(() => {
          searchRef.current?.querySelector("input")?.focus();
        }, 0);
      }

      return nextValue;
    });
  };

  return (
    <div className={`navbar-container`}>
      <div className="hamburger-container">
        <div className="div-navbar-2 navbar-actions-mobile">
          <NavbarActions
            isAuthenticated={isAuthenticated}
            logOut={logOut}
            onUserClick={handleUserClick}
            cartItemsCount={cartItemsCount}
            onSearchClick={handleMobileSearchToggle}
          />
          {showAuthModal && (
            <AuthModal onClose={() => setShowAuthModal(false)} />
          )}
        </div>
        <img
          className="logo-navbar logo-navbar-mobile"
          src="/soloLogo.png"
          alt="logo"
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <button className="hamburger-btn" onClick={toggleMenu}>
          {isMenuOpen ? "\u2715" : "\u2630"}
        </button>
      </div>
      {/* TOP */}
      <div className="navbar-top-container">
        <div className="navbar-top">
          <div className="div-navbar-1">
            <img
              className="logo-navbar"
              src="/logo_bulonera_completo.jpg"
              alt="logo"
              onClick={() => {
                window.location.href = "/";
              }}
            />
          </div>
          <div className="div-navbar">
            <form
              ref={searchRef}
              className={`input-search-container ${
                isMobileSearchOpen ? "mobile-search-open" : "mobile-search-closed"
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
                  if (e.target.value.trim()) {
                    setShowDropdown(true);
                  }
                }}
                onFocus={() => {
                  if (searchInput.trim()) {
                    setShowDropdown(true);
                  }
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
                        onClick={(e) => {
                          e.stopPropagation(); // evita que se cierre antes
                          setSearchInput(product.item || "");
                          setShowDropdown(false);
                          navigate(`/producto/${product._id}`);
                        }}
                        className="probando-drop"
                      >
                        <div className="dropdown-navbar-container">
                          <img
                            className="img-navbar-dropwdown  "
                            src={getImageUrl(product.imagen?.[0])}
                            alt={product.item}
                          />
                          <p className="nombre-prod-navbar">{product.item}</p>
                          <span className="precio-prod-navbar">
                            $ {product.precioConIva.toLocaleString("es-AR")}
                          </span>
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
            {showAuthModal && (
              <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="navbar-menu-container">
        <div
          className={`navbar-menu ${isMenuOpen ? "open" : ""}`}
          ref={menuRef}
        >
          <button className="close-btn" onClick={toggleMenu}>
            X
          </button>
          <button
            className="btn-navbar"
            onClick={() => setShowNavbarMenu((prev) => !prev)}
          >
            <FiAlignJustify />
            Productos
          </button>

          <NavbarMenu
            isOpen={showNavbarMenu}
            onClose={() => setShowNavbarMenu(false)}
          />
          <ul className="li-navbar">
            {/* <ProductsDropdown closeMenu={() => setIsMenuOpen(false)} /> */}
            <li >
              <Link
                to="/productos?ofertas=true"
                onClick={() => setIsMenuOpen(false)}
                className="ofertas-link"
              >
                OFERTAS
              </Link>
            </li>
            <div className="mxh-nav-sep"></div>
            <li>
              <Link
                to="/productos?categoria=Herramientas+Manuales"
                onClick={() => setIsMenuOpen(false)}
              >
                He. Manuales
              </Link>
            </li>
            <li>
              <Link
                to="/productos?categoria=Herramientas+Electricas"
                onClick={() => setIsMenuOpen(false)}
              >
                He. Eléctricas
              </Link>
            </li>
            <li>
              <Link
                to="/productos?categoria=Soldadura"
                onClick={() => setIsMenuOpen(false)}
              >
                Soldadura
              </Link>
            </li>
            <li>
              <Link
                to="/productos?categoria=Automotor"
                onClick={() => setIsMenuOpen(false)}
              >
                Automotor
              </Link>
            </li>
            <li>
              <Link
                to="/productos?categoria=Jardin"
                onClick={() => setIsMenuOpen(false)}
              >
                Jardín
              </Link>
            </li>
            <div className="mxh-nav-sep"></div>
            <li>
              <Link to="/contacto" onClick={() => setIsMenuOpen(false)}>
                CONTACTO
              </Link>
            </li>

            <li>
              <Link to="/nosotros" onClick={() => setIsMenuOpen(false)}>
                NOSOTROS
              </Link>
            </li>
          </ul>

          <button className="btn-navbar">Modo Claro</button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
