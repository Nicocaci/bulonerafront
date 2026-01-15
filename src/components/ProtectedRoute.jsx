import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    useEffect(() => {
        // Mostrar mensaje solo cuando no está autenticado y ya terminó de cargar
        if (!loading && !isAuthenticated) {
            Swal.fire({
                icon: 'warning',
                title: 'Acceso restringido',
                text: 'Debes iniciar sesión para acceder a esta página.',
                confirmButtonColor: '#3085d6',
            });
        }
    }, [isAuthenticated, loading]);

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh' 
            }}>
                <p>Cargando...</p>
            </div>
        );
    }

    // Si no está autenticado, redirigir al home
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Si está autenticado, renderizar el componente protegido
    return children;
};

export default ProtectedRoute;

