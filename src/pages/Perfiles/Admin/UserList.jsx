import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Pagination from '../../../components/Pagination.jsx';
import Swal from 'sweetalert2';

// De a cuántos usuarios se muestra la tabla
const POR_PAGINA = 20;

// Texto sin mayúsculas ni tildes, para buscar "garcia" y encontrar "García"
const normalizar = (texto = "") =>
    String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const coincide = (u, busqueda) =>
    [u.nombre, u.apellido, `${u.nombre || ""} ${u.apellido || ""}`, u.email, u.dni]
        .some((campo) => normalizar(campo).includes(busqueda));

// Los usuarios los carga AdminProfile (una sola vez) y se comparten con las estadísticas.
// La búsqueda y la paginación se hacen acá, sobre esa lista: la API no cambia.
const UserList = ({ users = [], onUsersChange }) => {
    const { deleteUser, user: authUser } = useContext(AuthContext);
    const miId = String(authUser?.id ?? authUser?._id ?? "");
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(1);

    const filtrados = useMemo(() => {
        const texto = normalizar(busqueda);
        return texto ? users.filter((u) => coincide(u, texto)) : users;
    }, [users, busqueda]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    // Si se borra el último usuario de la última página, se muestra la anterior
    const paginaActual = Math.min(pagina, totalPaginas);
    const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

    const cambiarBusqueda = (e) => {
        setBusqueda(e.target.value);
        setPagina(1);
    };

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

    let mensajeVacio = null;
    if (users.length === 0) mensajeVacio = "No hay usuarios registrados";
    else if (filtrados.length === 0) mensajeVacio = "Ningún usuario coincide con la búsqueda";

    return (
        <section className="admin-section admin-usuarios" aria-label="Usuarios">
            <div className="admin-usuarios__barra">
                <input
                    className="search-input"
                    type="search"
                    aria-label="Buscar usuarios"
                    placeholder="Buscar por nombre, email o DNI..."
                    value={busqueda}
                    onChange={cambiarBusqueda}
                />
                <p className="admin-usuarios__total" aria-live="polite">
                    {busqueda
                        ? `${filtrados.length} de ${users.length} usuarios`
                        : `${users.length} ${users.length === 1 ? "usuario" : "usuarios"}`}
                </p>
            </div>

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
                        {mensajeVacio ? (
                            <tr>
                                <td colSpan="5" className="no-users">
                                    {mensajeVacio}
                                </td>
                            </tr>
                        ) : (
                            visibles.map((u) => (
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

            <Pagination
                currentPage={paginaActual}
                totalPages={totalPaginas}
                onPageChange={setPagina}
            />
        </section>
    )
};

export default UserList
