import { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext.jsx";
import axiosInstance, { getErrorMessage } from "../../utils/axiosConfig.js";
import UserList from "./Admin/UserList.jsx";
import NewProduct from "./Admin/NewProduct.jsx";
import ResumenAdmin from "./Admin/ResumenAdmin.jsx";
import OrdenesAdmin from "./Admin/ventas/OrdenesAdmin.jsx";
import { esFiltroValido } from "./Admin/ventas/ordenes.js";
import {
    IconoOrdenes,
    IconoProductos,
    IconoResumen,
    IconoUsuarios,
    IconoVolver,
} from "./Admin/IconosAdmin.jsx";
import "../../css/AdminPanel.css";

// La sección elegida va en la URL (/perfil?seccion=ordenes&estado=pagado): se puede volver
// con el botón "atrás" y los accesos del Resumen abren el listado ya filtrado.
const SECCIONES = [
    { id: "resumen", nombre: "Resumen", Icono: IconoResumen },
    { id: "ordenes", nombre: "Órdenes", Icono: IconoOrdenes },
    { id: "productos", nombre: "Productos", Icono: IconoProductos },
    { id: "usuarios", nombre: "Usuarios", Icono: IconoUsuarios },
];

const SUBTITULOS = {
    ordenes: "Cambiá el estado de cada venta e imprimí las etiquetas de envío.",
    productos: "Cargá productos nuevos o editá los que ya están en la tienda.",
    usuarios: "Clientes y administradores registrados.",
};

const AdminProfile = ({ user }) => {
    const { getUsers, getProfile } = useContext(AuthContext);
    const [users, setUsers] = useState(null); // null = cargando
    const [adminData, setAdminData] = useState(null);
    const [params, setParams] = useSearchParams();

    const seccion = SECCIONES.some((s) => s.id === params.get("seccion"))
        ? params.get("seccion")
        : "resumen";
    const filtroOrdenes = esFiltroValido(params.get("estado")) ? params.get("estado") : "";

    // Estadísticas de ventas: las usan el Resumen y el contador del menú
    const stats = useQuery({
        queryKey: ["admin", "stats"],
        queryFn: () => axiosInstance.get("/api/orders/stats").then((res) => res.data),
    });
    const paraPreparar = stats.data?.ordersByStatus?.pagado ?? 0;

    // Cargar usuarios y perfil del admin
    useEffect(() => {
        const loadUsersAndProfile = async () => {
            try {
                const [usersData, adminProfile] = await Promise.all([
                    getUsers(),
                    getProfile(),
                ]);
                setUsers(usersData);
                setAdminData(adminProfile);
            } catch (error) {
                console.error("Error al obtener usuarios o perfil:", error);
                setUsers([]);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: getErrorMessage(error, "No se pudieron cargar los datos"),
                    confirmButtonColor: "#d33",
                });
            }
        };

        loadUsersAndProfile();
    }, [getUsers, getProfile, user?.id]);

    // Al cambiar de sección se vuelve arriba (la ruta es la misma, ScrollToTop no se entera)
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [seccion]);

    const nombre = adminData?.nombre || user?.nombre;
    const actual = SECCIONES.find((s) => s.id === seccion);

    const cambiarFiltroOrdenes = (estado) => {
        setParams(estado ? { seccion: "ordenes", estado } : { seccion: "ordenes" });
    };

    let contenido;
    if (seccion === "resumen") {
        contenido = (
            <ResumenAdmin
                stats={stats.data}
                cargandoStats={stats.isLoading}
                errorStats={stats.isError ? stats.error : null}
                usuarios={users}
            />
        );
    } else if (seccion === "ordenes") {
        contenido = <OrdenesAdmin filtro={filtroOrdenes} onFiltroChange={cambiarFiltroOrdenes} />;
    } else if (seccion === "productos") {
        contenido = <NewProduct />;
    } else {
        contenido =
            users === null ? (
                <p className="admin-mensaje">Cargando usuarios...</p>
            ) : (
                <UserList users={users} onUsersChange={setUsers} />
            );
    }

    return (
        <div className="admin-panel">
            <aside className="admin-menu">
                <p className="admin-menu__titulo" id="admin-menu-titulo">
                    ADMINISTRACIÓN
                </p>
                <nav aria-labelledby="admin-menu-titulo">
                    <ul className="admin-menu__lista">
                        {SECCIONES.map((s) => {
                            const { id, nombre: nombreSeccion, Icono } = s;
                            return (
                                <li key={id}>
                                    <Link
                                        to={{ search: `?seccion=${id}` }}
                                        className="admin-menu__link"
                                        aria-current={seccion === id ? "page" : undefined}
                                    >
                                        <Icono />
                                        <span>{nombreSeccion}</span>
                                        {id === "ordenes" && paraPreparar > 0 && (
                                            <span className="admin-menu__contador">
                                                {paraPreparar}
                                                <span className="visualmente-oculto"> para preparar</span>
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <Link to="/" className="admin-menu__volver">
                    <IconoVolver />
                    Volver a la tienda
                </Link>
            </aside>

            <div className="admin-contenido">
                <div className="admin-encabezado">
                    <h1>{actual.nombre}</h1>
                    <p>
                        {seccion === "resumen"
                            ? `Hola${nombre ? `, ${nombre}` : ""}. Esto es lo que pasa en la tienda.`
                            : SUBTITULOS[seccion]}
                    </p>
                </div>
                {contenido}
            </div>
        </div>
    );
};

export default AdminProfile;
