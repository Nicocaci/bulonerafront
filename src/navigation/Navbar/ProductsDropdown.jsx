import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../utils/axiosConfig.js";
import { Link } from "react-router-dom";

const ProductsDropdown = ({ closeMenu }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/api/products", {
          params: { limit: 1000 },
        });

        const products = res.data?.products || [];

        // Normalizá antes de agrupar
        const normalize = (str) => str?.trim().toLowerCase();

        const grouped = {};
        const catLabels = {}; // para guardar el label original (con formato)

        products.forEach((p) => {
          if (!p.categoria) return;

          const catKey = normalize(p.categoria);
          if (!catKey) return;

          if (!grouped[catKey]) {
            grouped[catKey] = new Set();
            catLabels[catKey] = p.categoria.trim(); // guardás el primer label que aparece
          }

          if (p.subcategoria) {
            grouped[catKey].add(p.subcategoria.trim());
          }
        });

        const cats = Object.keys(grouped).map((key) => catLabels[key]);

        const formatted = {};
        Object.keys(grouped).forEach((key) => {
          formatted[catLabels[key]] = Array.from(grouped[key]);
        });

        setCategories(cats);
        setSubcategories(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLinkClick = (e) => {
    e.stopPropagation(); // evita que el click llegue al <li>
    setOpen(false);
    closeMenu?.(); // el ?. protege si closeMenu no se pasa como prop
  };

  return (
    <li
      className="navbar-item-with-dropdown"
      onClick={() => setOpen((prev) => !prev)} // toggle
      ref={dropdownRef}
    >
      <Link>PRODUCTOS</Link>

      {open && (
        <div className="products-dropdown">
          {categories.map((cat) => (
            <div className="li-products-dropdown" key={cat}>
              <Link
                to={`/productos?categoria=${cat}`}
                onClick={handleLinkClick}
              >
                {cat}
              </Link>

              {subcategories[cat]?.map((sub) => (
                <Link
                  key={sub}
                  to={`/productos?categoria=${cat}&subcategoria=${sub}`}
                  onClick={handleLinkClick}
                >
                  - {sub}
                </Link>
              ))}
            </div>
          ))}
          <div className="li-products-dropdown">
            <Link to="/productos" onClick={handleLinkClick}>
              Ver todas las Marcas
            </Link>
          </div>
        </div>
      )}
    </li>
  );
};

export default ProductsDropdown;
