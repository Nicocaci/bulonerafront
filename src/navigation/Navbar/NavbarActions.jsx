import React, { useState } from "react";
import CartDropdown from "../../components/CartDropdown.jsx";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
const NavbarActions = ({
  isAuthenticated,
  logOut,
  onUserClick,
  cartItemsCount,
}) => {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="navbar-actions">
      <button onClick={onUserClick}>
        <FaUser />
      </button>

      <div className="cart-btn-container">
        <button onClick={() => setShowCart((prev) => !prev)}>
          <FaShoppingCart />
          {cartItemsCount > 0 && <span style={{fontSize: "15px"}}>{cartItemsCount}</span>}
        </button>

        <CartDropdown isOpen={showCart} onClose={() => setShowCart(false)} />
      </div>

      {isAuthenticated && <button onClick={logOut}><IoLogOut /></button>}
    </div>
  );
};

export default NavbarActions;
