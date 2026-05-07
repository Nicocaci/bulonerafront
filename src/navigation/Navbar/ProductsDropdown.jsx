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

        const cats = [
          ...new Set(products.map((p) => p.categoria).filter(Boolean)),
        ];

        const grouped = {};
        products.forEach((p) => {
          if (!p.categoria) return;
          if (!grouped[p.categoria]) grouped[p.categoria] = new Set();
          if (p.subcategoria) grouped[p.categoria].add(p.subcategoria);
        });

        const formatted = {};
        Object.keys(grouped).forEach((cat) => {
          formatted[cat] = Array.from(grouped[cat]);
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
      <Link>Categorías</Link>

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
