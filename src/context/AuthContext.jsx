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
        } else if (token) {
            Cookies.remove(TOKEN_KEY);
        }

        setLoading(false);
    }, []);

    const login = (userData) => {
        const token = userData?.token;

        console.log('AuthContext.login - Datos recibidos:', userData);
        console.log('AuthContext.login - Token recibido:', token ? 'Sí' : 'No');

        if (token) {
            Cookies.set(TOKEN_KEY, token, { expires: 7 }); // Expira en 7 días
            console.log('AuthContext.login - Token guardado en cookie');
            
            // Decodificar el token para extraer la información del usuario
            try {
                const decoded = jwtDecode(token);
                const user = {
                    id: decoded.id || decoded._id || userData.id || userData._id,
                    role: decoded.role || userData.role,
                    cart: decoded.cart ?? userData.cart ?? [],
                    token,
                };
                
                setUser(user);
                console.log('AuthContext.login - Usuario establecido desde token:', user);
            } catch (error) {
                console.error('Error al decodificar token:', error);
                // Fallback: usar los datos recibidos si el token no se puede decodificar
                const user = {
                    id: userData.id || userData._id,
                    role: userData.role,
                    cart: userData.cart ?? [],
                    token,
                };
                setUser(user);
                console.log('AuthContext.login - Usuario establecido desde userData:', user);
            }
        } else {
            console.warn('AuthContext.login - No se recibió token en la respuesta');
            // Si el backend envía el token en una cookie HTTP-only, 
            // no estará disponible aquí, pero axios lo manejará automáticamente
        }
    };

    // Función helper para construir headers con el token
    const buildHeaders = () => {
        const headers = {};
        const token = user?.token || Cookies.get(TOKEN_KEY);
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        return headers;
    };

    const logOut = async () => {
        try {
            // Intentar cerrar sesión en el backend
            await axiosInstance.post('/api/user/cerrarSesion', {}, {
                headers: buildHeaders(),
            });
        } catch (error) {
            // Si falla la petición, igualmente limpiar el estado local
            console.warn('Error al cerrar sesión en el backend:', error);
        } finally {
            // Siempre limpiar el estado local y las cookies
            Cookies.remove(TOKEN_KEY);
            setUser(null);
            
            Swal.fire({
                icon: 'success',
                title: 'Sesión cerrada',
                text: 'Has cerrado sesión correctamente.',
                confirmButtonColor: '#3085d6',
            }).then(() => {
                window.location.href = '/';
            });
        }
    };

    // Obtener perfil completo del usuario desde el backend
    const getProfile = async (userId = null) => {
        const id = userId || user?.id;
        if (!id) {
            throw new Error('ID de usuario requerido');
        }

        try {
            const { data } = await axiosInstance.get(`/api/user/${id}`, {
                headers: buildHeaders(),
            });
            return data;
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al obtener el perfil';
            throw new Error(errorMessage);
        }
    };

    // Actualizar perfil del usuario
    const updateProfile = async (userId, updateData) => {
        const id = userId || user?.id;
        if (!id) {
            throw new Error('ID de usuario requerido');
        }

        try {
            const { data } = await axiosInstance.put(`/api/user/${id}`, updateData, {
                headers: buildHeaders(),
            });
            
            // Si se actualizó el usuario actual, actualizar el estado
            if (id === user?.id && data) {
                // Si el backend devuelve un nuevo token, actualizarlo
                if (data.token) {
                    Cookies.set(TOKEN_KEY, data.token, { expires: 7 });
                    const decoded = jwtDecode(data.token);
                    setUser({
                        id: decoded.id || decoded._id,
                        role: decoded.role,
                        cart: decoded.cart ?? user.cart ?? [],
                        token: data.token,
                    });
                } else {
                    // Actualizar solo los datos del usuario sin cambiar el token
                    setUser(prev => ({
                        ...prev,
                        ...data,
                    }));
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el perfil';
            throw new Error(errorMessage);
        }
    };

    // Refrescar datos del usuario actual desde el backend
    const refreshUser = async () => {
        if (!user?.id) {
            console.warn('No hay usuario para refrescar');
            return;
        }

        try {
            const profileData = await getProfile(user.id);
            // Mantener el token actual pero actualizar otros datos
            setUser(prev => ({
                ...prev,
                ...profileData,
            }));
            return profileData;
        } catch (error) {
            console.error('Error al refrescar usuario:', error);
            throw error;
        }
    };

    // Obtener lista de usuarios (solo para admin)
    const getUsers = async () => {
        if (user?.role !== 'admin') {
            throw new Error('No tienes permisos para ver usuarios');
        }

        try {
            const { data } = await axiosInstance.get('/api/user/', {
                headers: buildHeaders(),
            });
            return data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al obtener usuarios';
            throw new Error(errorMessage);
        }
    };

    // Eliminar usuario (solo para admin)
    const deleteUser = async (userId) => {
        if (user?.role !== 'admin') {
            throw new Error('No tienes permisos para eliminar usuarios');
        }

        if (!userId) {
            throw new Error('ID de usuario requerido');
        }

        try {
            const { data } = await axiosInstance.delete(`/api/user/${userId}`, {
                headers: buildHeaders(),
            });
            return data;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar usuario';
            throw new Error(errorMessage);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                login,
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