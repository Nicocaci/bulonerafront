import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axiosInstance from "../utils/axiosConfig";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";

const API_PATH = "/api/cart";

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

    const buildHeaders = useCallback(() => {
        const headers = {};

        // Usar primero el token del contexto y, como fallback, el de la cookie
        const token = user?.token || Cookies.get(TOKEN_KEY);

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }, [user]);

    const request = useCallback(
        async (path, { method = "GET", body } = {}) => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.request({
                    method,
                    url: `${API_PATH}${path}`,
                    data: body,
                    headers: buildHeaders(),
                });

                return response.data;
            } catch (err) {
                console.error("Cart API error:", err);
                const errorMessage = err.response?.data?.message || err.message || `Error ${err.response?.status || "desconocido"}`;
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [buildHeaders]
    );

    const createCart = useCallback(
        async (payload = {}) => {
            const data = await request("/", { method: "POST", body: payload });
            setCart(data);
            return data;
        },
        [request]
    );

    const getCart = useCallback(async () => {
        const data = await request("/");

        // Si el backend devuelve un array de carritos, buscamos el del usuario actual
        if (Array.isArray(data)) {
            console.log("getCart - Se recibió un array de carritos:", data);
            console.log("getCart - ID del usuario actual:", user?.id);

            // Si tenemos el ID del usuario, buscamos su carrito
            if (user?.id) {
                // Convertir ambos IDs a string para comparar correctamente
                const userIdStr = String(user.id);
                const userCart = data.find(cart => {
                    const cartUserId = cart.user?._id || cart.user?.id || cart.user;
                    const cartUserIdStr = String(cartUserId);
                    return cartUserIdStr === userIdStr;
                });

                if (userCart) {
                    console.log("getCart - Carrito del usuario encontrado:", userCart);
                    setCart(userCart);
                    return userCart;
                } else {
                    console.warn("getCart - No se encontró carrito para el usuario:", userIdStr);
                }
            }

            // Si no encontramos el carrito del usuario, intentamos usar el primer carrito con productos
            const cartWithProducts = data.find(cart => cart.products && cart.products.length > 0);
            if (cartWithProducts) {
                console.log("getCart - Usando carrito con productos (fallback):", cartWithProducts);
                setCart(cartWithProducts);
                return cartWithProducts;
            }

            // Si no hay carritos con productos, devolvemos null
            console.warn("getCart - No se encontró un carrito válido");
            setCart(null);
            return null;
        }

        // Si es un objeto único, lo usamos directamente
        console.log("getCart - Se recibió un objeto de carrito:", data);
        setCart(data);
        return data;
    }, [request, user]);

    const getCartById = useCallback(
        async (cartId) => {
            if (!cartId) throw new Error("cartId es requerido");
            const data = await request(`/${cartId}`);
            setCart(data);
            return data;
        },
        [request]
    );

    useEffect(() => {
        // Cuando el usuario está autenticado, intentamos cargar su carrito
        if (user?.token) {
            let cartId = null;

            // 1. Intentar obtener cartId de user.cart (string)
            if (user.cart && typeof user.cart === "string") {
                cartId = user.cart;
            }
            // 2. Intentar obtener cartId de user.cart (objeto con _id)
            else if (user.cart && typeof user.cart === "object" && !Array.isArray(user.cart) && user.cart._id) {
                // Si es un objeto completo, lo establecemos directamente
                console.log("Carrito obtenido de user.cart (objeto):", user.cart);
                setCart(user.cart);
                return; // Ya tenemos el carrito, no necesitamos hacer más
            }
            // 3. Intentar obtener cartId del token decodificado
            else if (user?.token) {
                try {
                    const decoded = jwtDecode(user.token);
                    if (decoded?.cart) {
                        if (typeof decoded.cart === "string") {
                            cartId = decoded.cart;
                        } else if (decoded.cart?._id || decoded.cart?.id) {
                            cartId = decoded.cart._id || decoded.cart.id;
                        }
                    }
                } catch (tokenErr) {
                    console.error("Error al decodificar token:", tokenErr);
                }
            }

            // Si tenemos cartId, usar getCartById (más eficiente)
            if (cartId) {
                console.log("Obteniendo carrito por ID:", cartId);
                getCartById(cartId)
                    .then((cartData) => {
                        console.log("Carrito obtenido por ID:", cartData);
                    })
                    .catch((err) => {
                        console.error("Error al obtener carrito por ID:", err);
                        // Si falla, intentar con getCart() como fallback
                        getCart()
                            .then((cartData) => {
                                console.log("Carrito obtenido con getCart() (fallback):", cartData);
                            })
                            .catch((err2) => {
                                console.error("Error al obtener carrito:", err2);
                            });
                    });
            } else {
                // Si no tenemos cartId, usar getCart() como último recurso
                console.log("No se encontró cartId, intentando obtener carrito con getCart()");
                getCart()
                    .then((cartData) => {
                        console.log("Carrito obtenido del backend:", cartData);
                    })
                    .catch((err) => {
                        console.log("Usuario no tiene carrito asignado aún:", err.message);
                    });
            }
        } else {
            // Si no hay usuario, limpiamos el carrito
            setCart(null);
        }
    }, [user, getCartById, getCart]);

    const addProductToCart = useCallback(
        async (productId, quantity = 1) => {
            if (!productId) {
                throw new Error("productId es requerido");
            }

            console.log("addProductToCart - Estado actual:", {
                cart: cart,
                userCart: user?.cart,
                userId: user?.id,
            });

            // Primero intentamos obtener el cartId del estado local
            let cartId = cart?._id || cart?.id;
            console.log("addProductToCart - cartId del estado local:", cartId);

            // Si no tenemos cartId del estado, intentamos obtenerlo del user.cart
            if (!cartId && user?.cart) {
                if (typeof user.cart === "string") {
                    cartId = user.cart;
                    console.log("addProductToCart - cartId obtenido de user.cart (string):", cartId);
                } else if (user.cart?._id || user.cart?.id) {
                    cartId = user.cart._id || user.cart.id;
                    console.log("addProductToCart - cartId obtenido de user.cart (objeto):", cartId);
                } else if (Array.isArray(user.cart) && user.cart.length > 0) {
                    // Si user.cart es un array, puede que el primer elemento sea el ID
                    cartId = user.cart[0];
                    console.log("addProductToCart - cartId obtenido de user.cart (array):", cartId);
                }
            }

            // Si aún no tenemos cartId, intentamos obtenerlo del token decodificado
            if (!cartId && user?.token) {
                try {
                    const decoded = jwtDecode(user.token);
                    console.log("addProductToCart - Token decodificado:", decoded);
                    if (decoded?.cart) {
                        if (typeof decoded.cart === "string") {
                            cartId = decoded.cart;
                            console.log("addProductToCart - cartId obtenido del token (string):", cartId);
                        } else if (decoded.cart?._id || decoded.cart?.id) {
                            cartId = decoded.cart._id || decoded.cart.id;
                            console.log("addProductToCart - cartId obtenido del token (objeto):", cartId);
                        }
                    }
                } catch (tokenErr) {
                    console.error("addProductToCart - Error al decodificar token:", tokenErr);
                }
            }

            // Si aún no tenemos cartId, intentamos obtener el carrito del usuario desde el backend
            // Primero intentamos con getCart() que debería devolver el carrito del usuario autenticado
            if (!cartId) {
                try {
                    console.log("addProductToCart - Intentando obtener carrito con getCart()");
                    const userCart = await getCart();
                    console.log("addProductToCart - Carrito obtenido con getCart():", userCart);
                    if (userCart) {
                        cartId = userCart._id || userCart.id;
                        // Actualizamos el estado con el carrito obtenido
                        setCart(userCart);
                    }
                } catch (err) {
                    console.error("addProductToCart - Error al obtener carrito con getCart():", err);
                    // Si getCart() falla y tenemos un cartId del token, intentamos obtener el carrito por ID
                    if (cartId) {
                        try {
                            console.log("addProductToCart - Obteniendo carrito por ID:", cartId);
                            const fullCart = await getCartById(cartId);
                            setCart(fullCart);
                        } catch (cartErr) {
                            console.error("addProductToCart - Error al obtener carrito por ID:", cartErr);
                            // Si falla, limpiamos el cartId para crear uno nuevo
                            cartId = null;
                        }
                    }
                }
            }

            // Solo si después de todos los intentos no tenemos cartId, creamos uno nuevo
            if (!cartId) {
                console.warn("addProductToCart - No se pudo obtener cartId, creando nuevo carrito");
                const newCart = await createCart();
                cartId = newCart?._id || newCart?.id;
                console.log("addProductToCart - Nuevo carrito creado:", cartId);
            }

            if (!cartId) {
                throw new Error("No se pudo obtener o crear un carrito");
            }

            console.log("addProductToCart - Usando cartId:", cartId);

            // Agregamos el producto al carrito
            await request(`/${cartId}/products/${productId}`, {
                method: "POST",
                body: { quantity },
            });

            const updatedCart = await getCartById(cartId);
            setCart(updatedCart);
            return updatedCart;

        },
        [request, cart, user, createCart, getCart, getCartById, buildHeaders]
    );

    const removeProductFromCart = useCallback(
        async (cartId, productId) => {
            if (!cartId || !productId) throw new Error("cartId y productId son requeridos");
            const data = await request(`/${cartId}/products/${productId}`, { method: "DELETE" });
            setCart(data);
            return data;
        },
        [request]
    );

    const updateProductQuantity = useCallback(
        async (cartId, productId, quantity) => {
            if (!cartId || !productId) throw new Error("cartId y productId son requeridos");
    
            // Si la cantidad es 0 → eliminar producto
            if (quantity === 0) {
                return removeProductFromCart(cartId, productId);
            }
    
            const data = await request(`/${cartId}/products/${productId}`, {
                method: "PUT",
                body: { quantity },
            });
    
            setCart(data);
            return data;
        },
        [request, removeProductFromCart]   // ← FALTABA ESTO
    );
    


    const updateCart = useCallback(
        async (cartId, products = []) => {
            if (!cartId) throw new Error("cartId es requerido");
            const data = await request(`/${cartId}`, {
                method: "PUT",
                body: { products },
            });
            setCart(data);
            return data;
        },
        [request]
    );

    const deleteCart = useCallback(
        async (cartId) => {
            if (!cartId) throw new Error("cartId es requerido");
            const data = await request(`/${cartId}`, { method: "DELETE" });
            setCart(null);
            return data;
        },
        [request]
    );

    const clearCart = useCallback(
        async (cartId) => {
            if (!cartId) throw new Error("cartId es requerido");
            const data = await request(`/${cartId}/products`, { method: "DELETE" });
            setCart(data);
            return data;
        },
        [request]
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                error,
                createCart,
                getCart,
                getCartById,
                addProductToCart,
                removeProductFromCart,
                updateProductQuantity,
                updateCart,
                deleteCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
