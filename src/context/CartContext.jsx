import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./AuthContext.jsx";
import axiosInstance from "../utils/axiosConfig.js";
import swal from "sweetalert2";


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

  // 🔥 nunca null → evita bugs visuales
  const [cart, setCart] = useState({ products: [] });
  const [error, setError] = useState(null);

  // =============================
  // 🟡 LOCAL CART
  // =============================

  const getLocalCart = useCallback(() => {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : { products: [] };
  }, []);

  const saveLocalCart = useCallback((cartData) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartData));
    setCart(cartData);
  }, []);

  const clearLocalCart = useCallback(() => {
    const empty = { products: [] };
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(empty));
    setCart(empty);
    return empty;
  }, []);

  // =============================
  // 🟢 REQUEST HELPER
  // =============================

  const request = useCallback(async (method, url, body) => {
    try {
      setError(null);
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
    }
  }, []);

  // =============================
  // 🟢 GET CART
  // =============================

  const getCart = useCallback(async () => {
    try {
      // 👤 Invitado
      if (!user?.token) {
        const guest = getLocalCart();
        setCart(guest);
        return guest;
      }

      // 🟢 Logeado
      const data = await request("GET", "/api/cart/me");
      setCart(data);
      return data;
    } catch (err) {
      console.error("getCart error:", err);
    }
  }, [user?.token, getLocalCart, request]);

  // =============================
  // 🟢 GET CART BY ID
  // =============================

  const getCartById = useCallback(async () => {
    try {
      const data = await request("GET", `/api/cart/me`);
      return data;
    } catch (err) {
      console.error("getCartById error:", err);
      throw err;
    }
  }, [request]);

  // =============================
  // 🟢 ADD PRODUCT
  // =============================

  const addProductToCart = useCallback(
    async (productId, quantity = 1, productData = null) => {
      if (!productId) throw new Error("productId requerido");

      // 👤 Invitado
      if (!user?.token) {
        const guestCart = getLocalCart();
        const existing = guestCart.products.find((p) => p._id === productId);

        if (existing) {
          existing.quantity += quantity;
          if (!existing.product && productData) {
            existing.product = productData;
          }
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
        `/api/cart/me/products/${productId}`,
        { quantity },
      );

      setCart(updated);
      return updated;
    },
    [user?.token, getLocalCart, saveLocalCart, request],
  );

  // =============================
  // 🟢 REMOVE PRODUCT
  // =============================

  const removeProductFromCart = useCallback(
    async (productId) => {
      if (!productId) return;

      // 👤 Invitado
      if (!user?.token) {
        const guestCart = getLocalCart();
        guestCart.products = guestCart.products.filter(
          (p) => p._id !== productId,
        );
        saveLocalCart(guestCart);
        return guestCart;
      }

      // 🟢 Logeado
      const updated = await request(
        "DELETE",
        `/api/cart/me/products/${productId}`,
      );

      setCart(updated);
      return updated;
    },
    [user?.token, getLocalCart, saveLocalCart, request],
  );

  // =============================
  // 🟢 UPDATE QUANTITY
  // =============================

  const updateProductQuantity = useCallback(
    async (productId, quantity) => {
      if (!productId) return;

      // 👤 Invitado
      if (!user?.token) {
        const guestCart = getLocalCart();

        if (quantity <= 0) {
          return removeProductFromCart(productId);
        }

        const updated = guestCart.products.map((p) =>
          p._id === productId ? { ...p, quantity } : p,
        );

        const newCart = { ...guestCart, products: updated };
        saveLocalCart(newCart);
        return newCart;
      }

      // 🟢 Logeado

      if (quantity <= 0) {
        return removeProductFromCart(productId);
      }

      const prevCart = cart;

      // ⚡ Optimistic UI
      setCart((prev) => ({
        ...prev,
        products: prev.products.map((item) => {
          const id =
            typeof item.product === "string" ? item.product : item.product?._id;

          return id === productId ? { ...item, quantity } : item;
        }),
      }));

      try {
        await request("PUT", `/api/cart/me/products/${productId}`, {
          quantity,
        });
      } catch (err) {
        setCart(prevCart); // rollback
      }
    },
    [
      user?.token,
      cart,
      getLocalCart,
      saveLocalCart,
      removeProductFromCart,
      request,
    ],
  );

  // =============================
  // 🟢 CLEAR CART
  // =============================

const clearCartSilently = useCallback(async () => {
  try {
    if (!user?.token) {
      return clearLocalCart();
    } else {
      const updated = await request("DELETE", "/api/cart/me");
      setCart(updated);
      return updated;
    }
  } catch (err) {
    console.error("clearCartSilently error:", err);
    throw err;
  }
}, [user?.token, clearLocalCart, request]);

// Tu clearCart existente, para el botón "Vaciar carrito" manual del usuario
const clearCart = useCallback(async () => {
  swal.fire({
    title: "¿Vaciar carrito?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "No, cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      return clearCartSilently();
    }
  });
}, [clearCartSilently]);

  // =============================
  // 🔥 SYNC GUEST → BACKEND
  // =============================

  const syncGuestCartWithBackend = useCallback(async () => {
    if (!user?.token) return;

    const guestCart = getLocalCart();
    if (!guestCart.products.length) return;

    try {
      await Promise.all(
        guestCart.products.map((p) =>
          request("POST", `/api/cart/me/products/${p._id}`, {
            quantity: p.quantity,
          }),
        ),
      );

      localStorage.removeItem(LOCAL_CART_KEY);
    } catch (err) {
      console.error("sync error:", err);
    }
  }, [user?.token, getLocalCart, request]);

  // =============================
  // 🚀 INIT CORRECTO
  // =============================

  // 🔹 SIEMPRE cargar carrito
  useEffect(() => {
    getCart();
  }, []);

  // 🔹 Recargar carrito cuando cambia el estado de autenticación
  useEffect(() => {
    if (localStorage.getItem("justRegistered")) {
      syncGuestCartWithBackend().then(() => {
        localStorage.removeItem("justRegistered");
        getCart();
      });
    } else {
      getCart();
    }
  }, [user?.token, getCart, syncGuestCartWithBackend]);

  // // 🔹 Cuando aparece user → sync + reload
  // useEffect(() => {
  //   if (user?.token) {
  //     syncGuestCartWithBackend().then(getCart);
  //   }
  // }, [user?.token, syncGuestCartWithBackend, getCart]);

  // =============================
  // 🧠 MEMO
  // =============================

const value = useMemo(
  () => ({
    cart,
    error,
    getCart,
    getCartById,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    clearCart,
    clearCartSilently, // 👈 nuevo
  }),
  [
    cart, error, getCart, getCartById, addProductToCart,
    removeProductFromCart, updateProductQuantity, clearCart, clearCartSilently,
  ],
);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
