import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../../css/Perfil.css";
import AdminProfile from "./AdminProfile.jsx";
import UserProfile from "./UserProfile.jsx";
const Perfil = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="profile-container">
                <div className="profile-error">
                    <p>No encontramos tu sesión. Por favor, inicia sesión nuevamente.</p>
                </div>
            </div>
        );
    }

    return user.role === "admin" ? <AdminProfile user={user} /> : <UserProfile user={user} />;
};

export default Perfil;
