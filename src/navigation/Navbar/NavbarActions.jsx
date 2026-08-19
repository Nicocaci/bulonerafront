import React, { useState } from "react";
import CartDropdown from "../../components/CartDropdown.jsx";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";

const NavbarActions = ({
  isAuthenticated,
  logOut,
  onUserClick,
  cartItemsCount,
  onSearchClick,
}) => {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="navbar-actions">
      <button  className="btn-actions" type="button" onClick={onSearchClick} aria-label="Buscar productos">
        <IoMdSearch />
      </button>

      <button className="btn-actions" onClick={onUserClick}>
        <FaUser />
      </button>

      <div className="cart-btn-container">
        <button className="btn-actions" onClick={() => setShowCart((prev) => !prev)}>
          <FaShoppingCart />
          {cartItemsCount > 0 && <span style={{fontSize: "15px"}}>{cartItemsCount}</span>}
        </button>

        <CartDropdown isOpen={showCart} onClose={() => setShowCart(false)} />
      </div>

      {isAuthenticated && <button className="btn-actions" onClick={logOut}><IoLogOut /></button>}
    </div>
  );
};

export default NavbarActions;
