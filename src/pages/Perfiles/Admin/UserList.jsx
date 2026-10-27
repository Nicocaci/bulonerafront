import React from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Swal from 'sweetalert2';

// Los usuarios los carga AdminProfile (una sola vez) y se comparten con las estadísticas.
const UserList = ({ users = [], onUsersChange }) => {
    const { deleteUser, user: authUser } = useContext(AuthContext);
    const miId = String(authUser?.id ?? authUser?._id ?? "");

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
                });
                onUsersChange?.((prev) => prev.filter((u) => String(u._id ?? u.id) !== String(userId)));
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "No se pudo eliminar el usuario",
                    confirmButtonColor: "#d33",
                });
            }
        }
    };


    return (
        <section className="admin-section" aria-label="Usuarios">
            <div className="users-table-container">
                <table className="admin-tabla-simple">
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
                                        {String(u._id ?? u.id) === miId ? (
                                            <span className="role-badge">Vos</span>
                                        ) : (
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
        </section>
    )
};

export default UserList