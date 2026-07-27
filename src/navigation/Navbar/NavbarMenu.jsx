import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/NavbarMenu.css";
import axiosInstance from "../../utils/axiosConfig.js";

const NavbarMenu = ({ onClose, isOpen, onSelectCategory }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoriaAbierta, setCategoriaAbierta] = useState(null);
  const [subcategoriasMap, setSubcategoriasMap] = useState({});
  const [loadingSub, setLoadingSub] = useState(null);

  const menuRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get("/api/products/categorias");
        const data =
          response?.data?.categorias ??
          response?.data?.data ??
          response?.data ??
          [];
        setCategorias(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching categorias:", error);
        setError("No se pudieron cargar las categorías");
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  // 👇 esta era la función que faltaba
  const fetchSubcategorias = async (categoria) => {
    if (subcategoriasMap[categoria]) return; // ya cacheada, no vuelvo a pedir

    try {
      setLoadingSub(categoria);
      const response = await axiosInstance.get(
        `/api/products/subcategorias/${encodeURIComponent(categoria)}`,
      );
      const data = response?.data?.subcategorias ?? response?.data ?? [];

      setSubcategoriasMap((prev) => ({
        ...prev,
        [categoria]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      console.error("Error fetching subcategorias:", error);
      setSubcategoriasMap((prev) => ({
        ...prev,
        [categoria]: [],
      }));
    } finally {
      setLoadingSub(null);
    }
  };

  const handleMouseEnter = (categoria) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setCategoriaAbierta(categoria);
    fetchSubcategorias(categoria);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setCategoriaAbierta(null);
    }, 150);
  };

  const handleCategorySelect = () => {
    onSelectCategory?.();
  };

  return (
    <>
      <div
        className={`menu-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />
      <div ref={menuRef} className={`navbarmenu ${isOpen ? "open" : "closed"}`}>
        <div className="header-menu">
          <img className="logo-menu" src="/soloLogo.png" alt="logo" />
          <p className="back-menu" onClick={onClose}>
            ⬅
          </p>
        </div>
        <ul>
          {loading && <li>Cargando categorías...</li>}
          {!loading && error && <li>{error}</li>}
          {!loading && !error && categorias.length === 0 && (
            <li>No hay categorías disponibles</li>
          )}
          {!loading &&
            !error &&
            categorias.map((categoria, index) => {
              const estaAbierta = categoriaAbierta === categoria;
              const subcats = subcategoriasMap[categoria] ?? [];

              return (
                <div
                  className="menu-categorias-container"
                  key={index}
                  onMouseEnter={() => handleMouseEnter(categoria)}
                  onMouseLeave={handleMouseLeave}
                >
                  <li className="menu-categorias">
                    <div className="d-flex-between">
                      <Link
                        className="menu-categorias-link"
                        to={`/productos?categoria=${encodeURIComponent(categoria)}`}
                        onClick={handleCategorySelect}
                      >
                        {categoria}
                      </Link>
                      <span className={`arrow ${estaAbierta ? "open" : ""}`}>
                        ➡
                      </span>
                    </div>
                  </li>

                  {estaAbierta && (
                    <ul className="submenu-categorias">
                      <li
                        className="submenu-back"
                        onClick={() => setCategoriaAbierta(null)}
                      >
                        {categoria}
                      </li>

                      {loadingSub === categoria && (
                        <li>Cargando subcategorías...</li>
                      )}

                      {loadingSub !== categoria && subcats.length === 0 && (
                        <li>No hay subcategorías</li>
                      )}

                      {loadingSub !== categoria &&
                        subcats.map((sub, subIndex) => (
                          <li key={subIndex} className="submenu-item">
                            <Link
                              to={`/productos?categoria=${encodeURIComponent(
                                categoria,
                              )}&subcategoria=${encodeURIComponent(sub)}`}
                              onClick={handleCategorySelect}
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              );
            })}
        </ul>
      </div>
    </>
  );
};

export default NavbarMenu;
