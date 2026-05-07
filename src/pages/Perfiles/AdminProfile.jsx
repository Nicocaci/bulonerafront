import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import Swal from "sweetalert2";
import UserList from "./Admin/UserList.jsx";
import NewProduct from "./Admin/NewProduct.jsx";
import OrderList from "./Admin/OrderList.jsx";
import AdminVentas from "./Admin/ventas/AdminVentas.jsx";

const AdminProfile = ({ user }) => {
    const { getUsers, getProfile } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState(null);
    const [activeSection, setActiveSection] = useState("usuarios"); // usuarios | productos

    // Cargar usuarios y perfil del admin
    useEffect(() => {
        const loadUsersAndProfile = async () => {
            setLoading(true);
            try {
                const [usersData, adminProfile] = await Promise.all([
                    getUsers(),
                    getProfile(),
                ]);
                setUsers(usersData);
                setAdminData(adminProfile);
            } catch (error) {
                console.error("Error al obtener usuarios o perfil:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "No se pudieron cargar los datos",
                    confirmButtonColor: "#d33",
                });
            } finally {
                setLoading(false);
            }
        };

        loadUsersAndProfile();
    }, [getUsers, getProfile, user?.id]);

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">
                    <p>Cargando panel de administración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Panel de Administración</h1>
                <p>Bienvenido, {adminData?.nombre || "Administrador"}</p>
            </div>
            {/* Estadisticas de usuarios */}
            <div className="admin-stats">
                <div className="stat-card">
                    <h3>Total de Usuarios</h3>
                    <p className="stat-number">{users.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Usuarios Activos</h3>
                    <p className="stat-number">
                        {users.filter((u) => u.role === "user").length}
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Administradores</h3>
                    <p className="stat-number">
                        {users.filter((u) => u.role === "admin").length}
                    </p>
                </div>
            </div>

            {/* Navegación de secciones para evitar scroll muy largo */}
            <div className="admin-nav">
                <button
                    type="button"
                    className={`admin-nav-btn ${activeSection === "usuarios" ? "active" : ""}`}
                    onClick={() => setActiveSection("usuarios")}
                >
                    Gestión de Usuarios
                </button>
                <button
                    type="button"
                    className={`admin-nav-btn ${activeSection === "productos" ? "active" : ""}`}
                    onClick={() => setActiveSection("productos")}
                >
                    Gestión de Productos
                </button>
                <button
                    type="button"
                    className={`admin-nav-btn ${activeSection === "ordenes" ? "active" : ""}`}
                    onClick={() => setActiveSection("ordenes")}
                >
                    Gestión de Órdenes
                </button>
            </div>

            {activeSection === "usuarios" && (
                <UserList />
            )}
            {activeSection === "productos" && (
                <>
                    <NewProduct />
                </>
            )}
            {activeSection === "ordenes" && (
                <>
                    <AdminVentas />
                </>
            )}
        </div>
    );
};

export default AdminProfile;
