import React, { useEffect,useRef, useState } from "react";
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

        const cats = [...new Set(products.map(p => p.categoria).filter(Boolean))];

        const grouped = {};
        products.forEach(p => {
          if (!p.categoria) return;
          if (!grouped[p.categoria]) grouped[p.categoria] = new Set();
          if (p.subcategoria) grouped[p.categoria].add(p.subcategoria);
        });

        const formatted = {};
        Object.keys(grouped).forEach(cat => {
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

  return (
    <li
      className="navbar-item-with-dropdown"
      onClick={() => setOpen(true)}
      ref={dropdownRef}
    >
      <Link>Productos</Link>

      {open && (
        <div className="products-dropdown">
          {categories.map(cat => (
            <div key={cat}>
              <Link
                to={`/productos?categoria=${cat}`}
                onClick={closeMenu}
              >
                {cat}
              </Link>

              {subcategories[cat]?.map(sub => (
                <Link
                  key={sub}
                  to={`/productos?categoria=${cat}&subcategoria=${sub}`}
                  onClick={closeMenu}
                >
                  - {sub}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </li>
  );
};

export default ProductsDropdown;