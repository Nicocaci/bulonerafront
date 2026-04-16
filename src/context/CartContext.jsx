import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./AuthContext.jsx";
import axiosInstance from "../utils/axiosConfig.js";

const LOCAL_CART_KEY = "guest_cart";

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =============================
  // 🟡 LOCAL CART
  // =============================

  const getLocalCart = () => {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : { products: [] };
  };

  const saveLocalCart = (cartData) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartData));
    setCart(cartData);
  };

  const removeFromLocalCart = (productId) => {
    const guestCart = getLocalCart();
    guestCart.products = guestCart.products.filter((p) => p._id !== productId);
    saveLocalCart(guestCart);
    return guestCart;
  };

  const updateLocalQuantity = (productId, quantity) => {
    const guestCart = getLocalCart();

    if (quantity === 0) {
      return removeFromLocalCart(productId);
    }

    guestCart.products = guestCart.products.map((p) =>
      p._id === productId ? { ...p, quantity } : p,
    );

    saveLocalCart(guestCart);
    return guestCart;
  };

  const clearLocalCart = () => {
    const empty = { products: [] };
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(empty));
    setCart(empty);
    return empty;
  };

  // =============================
  // 🟢 REQUEST HELPER
  // =============================

  const request = useCallback(async (method, url, body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance({
        method,
        url,
        data: body,
      });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Error en carrito";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================
  // 🟢 GET CART
  // =============================

  const getCart = useCallback(async () => {
    if (!user?.token) {
      const guest = getLocalCart();
      setCart(guest);
      return guest;
    }

    const data = await request("GET", "/api/carts/me");
    setCart(data);
    return data;
  }, [user, request]);

  // =============================
  // 🟢 ADD PRODUCT
  // =============================

  const addProductToCart = useCallback(
    async (productId, quantity = 1, productData = null) => {
      if (!productId) throw new Error("productId es requerido");

      // 👤 Invitado
      if (!user?.token) {
        const guestCart = getLocalCart();
        const existing = guestCart.products.find((p) => p._id === productId);

        if (existing) {
          existing.quantity += quantity;
        } else {
          guestCart.products.push({
            _id: productId,
            product: productData,
            quantity,
          });
        }

        saveLocalCart(guestCart);
        return guestCart;
      }

      // 🟢 Logeado
      const updated = await request(
        "POST",
        `/api/carts/me/products/${productId}`,
        { quantity },
      );

      setCart(updated);
      return updated;
    },
    [user, request],
  );

  // =============================
  // 🟢 REMOVE PRODUCT
  // =============================

  const removeProductFromCart = useCallback(
    async (cartId, productId) => {
      if (!productId) throw new Error("productId es requerido");

      if (!user?.token) {
        return removeFromLocalCart(productId);
      }

      const updated = await request(
        "DELETE",
        `/api/carts/me/products/${productId}`,
      );

      setCart(updated);
      return updated;
    },
    [user, request],
  );

  // =============================
  // 🟢 UPDATE QUANTITY
  // =============================

  const updateProductQuantity = useCallback(
    async (productId, quantity) => {
      if (!productId) throw new Error("productId es requerido");

      if (!user?.token) {
        return updateLocalQuantity(productId, quantity);
      }

      if (quantity === 0) {
        return removeProductFromCart(null, productId);
      }

      // 1️⃣ Actualización optimista (fluido inmediato)
      setCart((prev) => ({
        ...prev,
        products: prev.products.map((item) => {
          const id =
            typeof item.product === "string" ? item.product : item.product?._id;

          if (id === productId) {
            return { ...item, quantity };
          }

          return item;
        }),
      }));

      // 2️⃣ Sync con backend
      await request("PUT", `/api/carts/me/products/${productId}`, { quantity });
    },
    [user, request, removeProductFromCart, updateLocalQuantity],
  );

  // =============================
  // 🟢 CLEAR CART
  // =============================

  const clearCart = useCallback(
    async (cartId) => {
      if (!user?.token) {
        return clearLocalCart();
      }

      const updated = await request("DELETE", "/api/carts/me");
      setCart(updated);
      return updated;
    },
    [user, request],
  );

  // =============================
  // 🔥 MERGE GUEST → BACKEND
  // =============================

  const syncGuestCartWithBackend = useCallback(async () => {
    if (!user?.token) return;

    const guestCart = getLocalCart();
    if (!guestCart.products.length) return;

    for (const product of guestCart.products) {
      await request("POST", `/api/carts/me/products/${product._id}`, {
        quantity: product.quantity,
      });
    }

    localStorage.removeItem(LOCAL_CART_KEY);
  }, [user, request]);

  // =============================
  // 🚀 INIT
  // =============================

  useEffect(() => {
    const initialize = async () => {
      try {
        if (user?.token) {
          await syncGuestCartWithBackend();
        }
        await getCart();
      } catch (err) {
        console.error("Error inicializando carrito:", err);
      }
    };

    initialize();
  }, [user?.token]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        createCart: null,
        getCart,
        getCartById: null,
        addProductToCart,
        removeProductFromCart,
        updateProductQuantity,
        updateCart: null,
        deleteCart: null,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

