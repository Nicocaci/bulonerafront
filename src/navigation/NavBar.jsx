import React, { useState, useContext, useEffect, useRef } from 'react';
import '../css/NavBar.css'
import AuthModal from '../components/AuthModal';
import CartDropdown from '../components/CartDropdown';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import {FaShoppingCart} from "react-icons/fa";

const NavBar = () => {
  const { isAuthenticated, logOut } = useContext(AuthContext);
  const { cart } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({});
  const navigate = useNavigate();



  const handleUserIconClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigate('/perfil');
    }
  };

  const handleCartIconClick = () => {
    setShowCartDropdown((prev) => !prev);
  };

  const handleCloseModal = () => setShowAuthModal(false);

  const cartItemsCount = cart?.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;

  const dropdownRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const openDropdown = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowProductsDropdown(true);
  };

  const closeDropdownSoon = (delay = 150) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setShowProductsDropdown(false);
      hideTimeoutRef.current = null;
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        // Fall back to fetching all products and extracting unique "categoria"
        const response = await axiosInstance.get('/api/products', { params: { limit: 1000 } });
        const productosData = response.data?.products || response.data || [];
        const uniqueCategories = [...new Set(productosData.map(p => p.categoria).filter(Boolean))].sort();

        // Map subcategories under each category
        const map = {};
        productosData.forEach(p => {
          const cat = p.categoria || '';
          const sub = p.subcategoria || '';
          if (!cat) return;
          if (!map[cat]) map[cat] = new Set();
          if (sub) map[cat].add(sub);
        });
        const grouped = {};
        Object.keys(map).forEach(cat => grouped[cat] = Array.from(map[cat]).sort());

        if (isMounted) {
          setCategories(uniqueCategories);
          setSubcategoriesByCategory(grouped);
        }
      } catch (err) {
        console.error('Error fetching categories for NavBar:', err);
      }
    };

    fetchCategories();
    return () => { isMounted = false };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setShowProductsDropdown(false);
      }
    };

    if (showProductsDropdown) {
      document.addEventListener('mousedown', handleDocumentClick);
    }

    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [showProductsDropdown]);

  // Close dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowProductsDropdown(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);


  return (
    <div className={`navbar-container`}>
      <div>
        <Link to={'/'}><img className='logo-navbar' src="/logo-completo.png" alt="logo" /></Link>
      </div>
      <div >
        <ul className='li-navbar'>
          <li ref={dropdownRef} className='navbar-item-with-dropdown' onMouseEnter={openDropdown} onMouseLeave={() => closeDropdownSoon()} onFocus={openDropdown} onBlur={() => closeDropdownSoon()}>
            <Link className='link-navbar' to={'/productos'}>Productos</Link>

            {showProductsDropdown && (
              <div className='products-dropdown' onMouseEnter={openDropdown} onMouseLeave={() => closeDropdownSoon()} onFocus={openDropdown} onBlur={() => closeDropdownSoon()}>
                <div className='products-dropdown-body'>
                  <div className='filter-group'>
                    {categories.length === 0 ? (
                      <div className='loading-small'>Cargando...</div>
                    ) : (
                      <>
                        {categories.map((cat) => (
                          <div key={cat} className='category-item'>
                            <Link className='category-link' to={`/productos?categoria=${encodeURIComponent(cat)}`} onClick={() => setShowProductsDropdown(false)}>{cat}</Link>

                            {subcategoriesByCategory[cat] && subcategoriesByCategory[cat].length > 0 && (
                              <ul className='subcategory-list'>
                                {subcategoriesByCategory[cat].map((sub) => (
                                  <li key={sub} className='subcategory-item'>
                                    <Link to={`/productos?categoria=${encodeURIComponent(cat)}&subcategoria=${encodeURIComponent(sub)}`} className='subcategory-link' onClick={() => setShowProductsDropdown(false)}>{sub}</Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>
          <Link className='link-navbar' to={'/contacto'}><li>Contacto</li></Link>
          <Link className='link-navbar' to={'/nosotros'}><li>Nosotros</li></Link>
        </ul>
      </div>
      <div className='li-navbar2 navbar-actions'>
        <button className='navbar-icon-button' onClick={handleUserIconClick} title={isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#ffffff" className="bi bi-person-fill" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
          </svg>
        </button>

        <div className="navbar-cart-wrapper">
          <button
            className='navbar-icon-button'
            onClick={handleCartIconClick}
            title="Ver carrito"
          >
            <FaShoppingCart color='#ffffff' size={25} />
            {cartItemsCount > 0 && (
              <span className="navbar-cart-badge">{cartItemsCount}</span>
            )}
          </button>

          {showCartDropdown && (
            <CartDropdown onClose={() => setShowCartDropdown(false)} />
          )}
        </div>

        <div className='logout' onClick={() => isAuthenticated && logOut()} style={{ cursor: isAuthenticated ? 'pointer' : 'default' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#ffffff" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
          </svg>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default NavBar