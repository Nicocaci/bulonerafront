import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Swal from 'sweetalert2';
import axiosInstance from '../../../utils/axiosConfig';
import Cookies from 'js-cookie';
import { getImageUrl } from '../../../utils/imageUtils';

const UserList = ({ user }) => {
    const { getUsers, deleteUser, getProfile, user: authUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersData, adminProfile] = await Promise.all([
                    getUsers(),
                    getProfile(),
                ]);
                setUsers(usersData);
                setAdminData(adminProfile);
            } catch (error) {
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
        loadData();
    }, [getUsers, getProfile]);

    const handleDeleteUser = async (userId, userName) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "¿Eliminar usuario?",
            text: `¿Estás seguro de que deseas eliminar a ${userName}?`,
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(userId);
                Swal.fire({
                    icon: "success",
                    title: "Usuario eliminado",
                    text: "El usuario ha sido eliminado correctamente.",
                    confirmButtonColor: "#28a745",
                }).then(() => {
                    window.location.reload();
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "No se pudo eliminar el usuario",
                    confirmButtonColor: "#d33",
                });
            }
        }
    };


    if (loading) {
        return (
            <div className="admin-section">
                <p className='titulo-admin-section'>Gestión de Usuarios</p>
                <p>Cargando usuarios...</p>
            </div>
        );
    }
    return (
        <div className="admin-section">
            <p className='titulo-admin-section'>Gestión de Usuarios</p>
            <div className="users-table-container">
                <table >
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>DNI</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-users">
                                    No hay usuarios registrados
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u._id || u.id}>
                                    <td>{u.nombre || "N/A"} {u.apellido || ""}</td>
                                    <td>{u.email || "N/A"}</td>
                                    <td>{u.dni || "N/A"}</td>
                                    <td>
                                        <span
                                            className={`role-badge ${u.role === "admin" ? "role-admin" : "role-user"
                                                }`}
                                        >
                                            {u.role === "admin" ? "Admin" : "Usuario"}
                                        </span>
                                    </td>
                                    <td>
                                        {(u._id ?? u.id) !== (user?._id ?? user?.id) && (
                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDeleteUser(
                                                        u._id || u.id,
                                                        u.nombre || "Usuario"
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default UserList