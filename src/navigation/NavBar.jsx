import React, { useState, useContext } from "react";
import "../css/NavBar.css";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

import AuthModal from "../components/AuthModal";
import ProductsDropdown from "./Navbar/ProductsDropdown.jsx";
import NavbarActions from "./Navbar/NavBarActions.jsx";

const NavBar = () => {
  const { isAuthenticated, logOut } = useContext(AuthContext);
  const { cart } = useCart();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const handleUserClick = () => {
    if (!isAuthenticated) return setShowAuthModal(true);
    navigate("/perfil");
  };

  const cartItemsCount =
    cart?.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;

  return (
    <div className="navbar-container">
      
      {/* TOP */}
      <div className="navbar-top">
        <Link to="/">
          <img className="logo-navbar" src="/logo-completo.png" alt="logo" />
        </Link>

        <button className="hamburger-btn" onClick={toggleMenu}>
          ☰
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