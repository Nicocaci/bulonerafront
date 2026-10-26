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

const escaparHtml = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

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
      const error = new Error(message);
      error.status = err.response?.status; // para distinguir errores definitivos (4xx) de fallas de red
      throw error;
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
    // 👤 Invitado
    if (!user?.token) {
      const guest = getLocalCart();
      setCart(guest);
      return guest;
    }

    // 🟢 Logeado
    const data = await request("GET", `/api/cart/me`);
    setCart(data);
    return data;
  } catch (err) {
    console.error("getCartById error:", err);
    throw err;
  }
}, [user?.token, getLocalCart, request]);

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

      const cantidadEnCarrito = existing?.quantity || 0;
      const stockDisponible = productData?.stock;
      const cantidadFinal = cantidadEnCarrito + quantity;

      if (
        typeof stockDisponible === "number" &&
        cantidadFinal > stockDisponible
      ) {
        throw new Error(
          stockDisponible === 0
            ? "Este producto no tiene stock disponible"
            : `Solo hay ${stockDisponible} unidad(es) disponibles`,
        );
      }

      if (existing) {
        existing.quantity = cantidadFinal;
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
        throw err;
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

  // Al iniciar sesión (o registrarse) con productos en el carrito de invitado,
  // se pasan al carrito de la cuenta de a uno (en paralelo competían por el mismo
  // documento y se podían pisar). Antes solo se hacía al registrarse: al iniciar
  // sesión, los productos del invitado quedaban ocultos en el navegador.
  const syncGuestCartWithBackend = useCallback(async () => {
    if (!user?.token) return;

    const guestCart = getLocalCart();
    if (!guestCart.products.length) return;

    const pendientes = []; // fallas de red o del servidor: se reintentan la próxima vez
    const noAgregados = []; // rechazos definitivos (sin stock, producto borrado)

    for (const item of guestCart.products) {
      try {
        await request("POST", `/api/cart/me/products/${item._id}`, {
          quantity: item.quantity,
        });
      } catch (err) {
        // 401 = la sesión venció en el medio: se conserva para la próxima vez
        if (err.status && err.status < 500 && err.status !== 401) {
          noAgregados.push(`${item.product?.item || "Un producto"}: ${err.message}`);
        } else {
          pendientes.push(item);
        }
      }
    }

    if (pendientes.length) {
      localStorage.setItem(
        LOCAL_CART_KEY,
        JSON.stringify({ ...guestCart, products: pendientes }),
      );
    } else {
      localStorage.removeItem(LOCAL_CART_KEY);
    }

    if (noAgregados.length) {
      swal.fire({
        icon: "info",
        title: "Revisá tu carrito",
        html:
          "Pasamos tu carrito a tu cuenta, pero algunos productos no se pudieron agregar:<br>" +
          noAgregados.map((t) => `• ${escaparHtml(t)}`).join("<br>"),
        confirmButtonColor: "#3085d6",
      });
    }
  }, [user?.token, getLocalCart, request]);

  // =============================
  // 🚀 CARGA DEL CARRITO
  // =============================

  // Al montar y cada vez que cambia la sesión: si hay sesión y quedó un carrito de
  // invitado, primero se sincroniza; después se carga el carrito que corresponde.
  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      if (user?.token && getLocalCart().products.length) {
        await syncGuestCartWithBackend();
      }
      if (!cancelado) await getCart();
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [user?.token, getCart, getLocalCart, syncGuestCartWithBackend]);

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
