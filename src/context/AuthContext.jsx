import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import axiosInstance from "../utils/axiosConfig";

const TOKEN_KEY = "access_token";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildUserFromToken = (token) => {
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      const expMs = (decoded?.exp ?? 0) * 1000;

      if (!decoded?.exp || expMs <= Date.now()) {
        console.warn("Token expirado, limpiando sesión");
        return null;
      }

      return {
        id: decoded.id || decoded._id,
        role: decoded.role,
        cart: decoded.cart ?? [],
        token,
      };
    } catch (error) {
      console.error("Token inválido:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = Cookies.get(TOKEN_KEY);
    const sessionUser = buildUserFromToken(token);

    if (sessionUser) {
      setUser(sessionUser);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else if (token) {
      Cookies.remove(TOKEN_KEY);
      delete axiosInstance.defaults.headers.common.Authorization;
    }

    setLoading(false);
  }, []);

  // Función helper para construir headers con el token
  const buildHeaders = () => {
    const token = user?.token || Cookies.get(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const register = async (userData) => {
    try {
      // 1️⃣ Crear usuario
      const { data } = await axiosInstance.post("/api/user/registro", userData);

      const token = data?.token;
      if (!token) throw new Error("No token recibido");

      // 2️⃣ Logear automáticamente
      await login(data);

      // 3️⃣ 🔥 Traer carrito guest
      const guestCart = JSON.parse(localStorage.getItem("guest_cart"));

      if (guestCart?.products?.length) {
        // 4️⃣ 🔥 Enviarlo al backend
        const { data: updatedCart } = await axiosInstance.post(
          "/api/cart/me/assign-guest",
          {
            products: guestCart.products,
          },
        );

        localStorage.removeItem("guest_cart");

        // 🔥 ACTUALIZAR STATE
        setUser((prev) => ({
          ...prev,
          cart: updatedCart.products,
        }));
      }

      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };
  // 🔹 LOGIN (limpia sesión anterior sí o sí)
  const login = async (userData) => {
    const token = userData?.token;
    if (!token) return;

    // 🧹 limpiar todo antes
    Cookies.remove(TOKEN_KEY);
    delete axiosInstance.defaults.headers.common.Authorization;
    setUser(null);

    try {
      const decoded = jwtDecode(token);
      const expMs = (decoded?.exp ?? 0) * 1000;

      if (!decoded?.exp || expMs < Date.now()) {
        return;
      }

      const newUser = {
        id: decoded.id || decoded._id,
        role: decoded.role,
        cart: decoded.cart || [],
        token,
      };

      Cookies.set(TOKEN_KEY, token, { expires: 7 });
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(newUser);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // 🔹 LOGOUT (limpia TODO)
  const logOut = async () => {
    try {
      await axiosInstance.post(
        "/api/user/cerrarSesion",
        {},
        { headers: buildHeaders() },
      );
    } catch (error) {
      console.warn("Logout backend error:", error);
    } finally {
      Cookies.remove(TOKEN_KEY);
      delete axiosInstance.defaults.headers.common.Authorization;
      setUser(null);

      Swal.fire({
        icon: "success",
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        window.location.href = "/";
      });
    }
  };

  // Obtener perfil completo del usuario desde el backend
  // 🔹 PERFIL
  const getProfile = async () => {
    const { data } = await axiosInstance.get("/api/user/me", {
      headers: buildHeaders(),
    });
    return data;
  };

  const updateProfile = async (userId, updateData) => {
    const id = userId || user?.id;
    if (!id) throw new Error("No user ID");

    const { data } = await axiosInstance.put(`/api/user/${id}`, updateData, {
      headers: buildHeaders(),
    });

    if (id === user?.id) {
      setUser((prev) => ({ ...prev, ...data }));
    }

    return data;
  };

  const refreshUser = async () => {
    if (!user?.id) return;

    const profileData = await getProfile(user.id);
    setUser((prev) => ({ ...prev, ...profileData }));
    return profileData;
  };

  const getUsers = async () => {
    if (user?.role !== "admin") throw new Error("No autorizado");

    const { data } = await axiosInstance.get("/api/user/", {
      headers: buildHeaders(),
    });

    return data;
  };

  const deleteUser = async (userId) => {
    if (user?.role !== "admin") throw new Error("No autorizado");

    const { data } = await axiosInstance.delete(`/api/user/${userId}`, {
      headers: buildHeaders(),
    });

    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        loading,
        logOut,
        getProfile,
        updateProfile,
        refreshUser,
        getUsers,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
