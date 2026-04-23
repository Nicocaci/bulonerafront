import React, { useState } from "react";
import CartDropdown from "../../components/CartDropdown.jsx";
import { FaShoppingCart } from "react-icons/fa";

const NavbarActions = ({
  isAuthenticated,
  logOut,
  onUserClick,
  cartItemsCount,
}) => {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="navbar-actions">
      <button onClick={onUserClick}>👤</button>

      <div>
        <button onClick={() => setShowCart((prev) => !prev)}>
          <FaShoppingCart />
          {cartItemsCount > 0 && <span>{cartItemsCount}</span>}
        </button>

        <CartDropdown isOpen={showCart} onClose={() => setShowCart(false)} />
      </div>

      {isAuthenticated && <button onClick={logOut}>🚪</button>}
    </div>
  );
};

export default NavbarActions;
