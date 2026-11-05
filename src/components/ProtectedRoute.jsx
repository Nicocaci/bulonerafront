import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { avisar } from "../utils/avisos.js";
import Cargador from "./Cargador.jsx";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    useEffect(() => {
        // Mostrar mensaje solo cuando no está autenticado y ya terminó de cargar
        if (!loading && !isAuthenticated) {
            avisar.advertencia('Acceso restringido', 'Debes iniciar sesión para acceder a esta página.', {
                accion: {
                    texto: 'Iniciar sesión',
                    onClick: () => window.dispatchEvent(new Event('open-login-modal')),
                },
            });
        }
    }, [isAuthenticated, loading]);

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return <Cargador className="ruta-protegida-cargando" />;
    }

    // Si no está autenticado, redirigir al home
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Si está autenticado, renderizar el componente protegido
    return children;
};

export default ProtectedRoute;
