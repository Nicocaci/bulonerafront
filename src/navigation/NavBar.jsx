import React, { useState, useContext, useEffect, useRef } from "react";
import "../css/NavBar.css";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";

import AuthModal from "../components/AuthModal";
import ProductsDropdown from "./Navbar/ProductsDropdown.jsx";
import NavbarActions from "./Navbar/NavbarActions.jsx";
import axiosInstance from "../utils/axiosConfig";

const NavBar = () => {
  const { isAuthenticated, logOut } = useContext(AuthContext);
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

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
      return;
    }

    const controller = new AbortController();

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        setShowDropdown(true);

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

  // CERRAR AL CLICKEAR FUERA
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const trimmedSearch = searchInput.trim();
    const nextUrl = trimmedSearch
      ? `/productos?search=${encodeURIComponent(trimmedSearch)}`
      : "/productos";

    navigate(nextUrl);
    setIsMenuOpen(false);
  };

  return (
    <div className="navbar-container">
      {/* TOP */}
      <div className="navbar-top">
        <Link to="/">
          <img className="logo-navbar" src="/logo-completo.png" alt="logo" />
        </Link>

        <button className="hamburger-btn" onClick={toggleMenu}>
          {"\u2630"}
        </button>
      </div>

      {/* MENU */}
      <div className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
        <ul className="li-navbar">
          <ProductsDropdown closeMenu={() => setIsMenuOpen(false)} />

          <li>
            <Link to="/contacto" onClick={() => setIsMenuOpen(false)}>
              Contacto
            </Link>
          </li>

          <li>
            <Link to="/nosotros" onClick={() => setIsMenuOpen(false)}>
              Nosotros
            </Link>
          </li>
        </ul>

        <form
          ref={searchRef}
          className="input-search-container"
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
              {loading && <li>Cargando...</li>}

              {!loading && results.length === 0 && (
                <li>No se encontraron productos</li>
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
                     <img className="img-navbar-dropwdown" src={getImageUrl(product.imagen?.[0])} alt={product.item} />
                     <span className="nombre-prod-navbar">{product.item}</span>
                     <span className="precio-prod-navbar">$ {product.precio}</span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </form>

        <NavbarActions
          isAuthenticated={isAuthenticated}
          logOut={logOut}
          onUserClick={handleUserClick}
          cartItemsCount={cartItemsCount}
        />
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default NavBar;
