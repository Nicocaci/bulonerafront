import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import Swal from "sweetalert2";



const UserProfile = ({ user }) => {
    const { getProfile, updateProfile, refreshUser } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        direccion: "",
        email: "",
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getProfile();
                setProfileData(data);
                setFormData({
                    nombre: data.nombre || "",
                    apellido: data.apellido || "",
                    dni: data.dni || "",
                    direccion: data.direccion || "",
                    email: data.email || "",
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "No se pudo cargar el perfil",
                    confirmButtonColor: "#3085d6",
                });
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [getProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(null, formData);
            await refreshUser();
            setIsEditing(false);
            Swal.fire({
                icon: "success",
                title: "Perfil actualizado",
                text: "Tus datos se han actualizado correctamente.",
                confirmButtonColor: "#28a745",
            });
            // Recargar datos
            const data = await getProfile();
            setProfileData(data);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "No se pudo actualizar el perfil",
                confirmButtonColor: "#d33",
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (profileData) {
            setFormData({
                nombre: profileData.nombre || "",
                apellido: profileData.apellido || "",
                dni: profileData.dni || "",
                direccion: profileData.direccion || "",
                email: profileData.email || "",
            });
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Mi Perfil</h1>
                <p>Gestioná tu información personal</p>
            </div>

            <div className="profile-card">
                {!isEditing ? (
                    <>
                        <div className="profile-info">
                            <div className="info-row">
                                <span className="info-label">Nombre:</span>
                                <span className="info-value">{profileData?.nombre || "N/A"}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Apellido:</span>
                                <span className="info-value">{profileData?.apellido || "N/A"}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">DNI:</span>
                                <span className="info-value">{profileData?.dni || "N/A"}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{profileData?.email || "N/A"}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Dirección:</span>
                                <span className="info-value">{profileData?.direccion || "N/A"}</span>
                            </div>
                        </div>
                        <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                            Editar Perfil
                        </button>
                    </>
                ) : (
                    <form className="profile-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dni">DNI</label>
                            <input
                                type="text"
                                id="dni"
                                name="dni"
                                value={formData.dni}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="direccion">Dirección</label>
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="profile-save-btn">
                                Guardar Cambios
                            </button>
                            <button
                                type="button"
                                className="profile-cancel-btn"
                                onClick={handleCancel}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
export default UserProfile;