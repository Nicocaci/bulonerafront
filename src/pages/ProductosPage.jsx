import React, { useEffect, useState, useMemo } from "react";
import { MarcasLogos } from "../components/MarcasLogos";
import "../css/ProductosPage.css";
import { useSearchParams } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils.js";
import axiosInstance from "../utils/axiosConfig.js";
import { IoFilter } from "react-icons/io5";
import { Link } from "react-router-dom";
import { MdVerified } from "react-icons/md";

const ProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });
  const filters = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      category: searchParams.get("categoria") || "",
      subcategory: searchParams.get("subcategoria") || "",
      marca: searchParams.get("marca") || "",
      todos: searchParams.get("todos") === "true",
      page: Number(searchParams.get("page")) || 1,
      sort: searchParams.get("sort") || "",
      soloOfertas: searchParams.get("ofertas") === "true",
    };
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosInstance
      .get("/api/products", { params: filters })
      .then((response) => {
        setProductos(response.data.products);
        setPagination(response.data.pagination);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    axiosInstance.get("/api/products/categorias").then((response) => {
      setCategories(response.data);
    });
  }, []);
  useEffect(() => {
    if (!filters.category) {
      setSubcategories([]);
      return;
    }

    axiosInstance
      .get(`/api/products/subcategorias/${filters.category}`)
      .then((res) => setSubcategories(res.data));
  }, [filters.category]);

  const updateParams = (key, value, resetPage = true) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);

      if (value) p.set(key, value);
      else p.delete(key);

      if (resetPage) {
        p.set("page", 1);
      } else if (!p.get("page")) {
        p.set("page", 1);
      }

      return p;
    });
  };

  const tieneFiltros =
    filters.search ||
    filters.category ||
    filters.subcategory ||
    filters.marca ||
    filters.soloOfertas ||
    filters.todos;

  return (
    <div className="product-section">
      {!tieneFiltros? (
        <div className="marcas-inicial">
          <MarcasLogos />
        </div>
      ) : (
        <div className="products-layout">
          <div className="btn-container-mobile">
            {/* Botón filtros mobile */}
            <button
              className="mobile-filter-btn"
              onClick={() => setFiltersOpen(true)}
            >
              <IoFilter />
              Filtrar
            </button>
          </div>

          {/* Overlay */}
          {filtersOpen && (
            <div
              className="filter-overlay"
              onClick={() => setFiltersOpen(false)}
            />
          )}

          {/* SIDEBAR */}
          <aside className={`filter-sidebar ${filtersOpen ? "open" : ""}`}>
            <button
              className="close-filters"
              onClick={() => setFiltersOpen(false)}
            >
              ✕
            </button>

            <label className="filter-label">Buscar</label>
            <input
              type="search"
              placeholder="Buscar productos..."
              value={filters.search}
              onChange={(e) => updateParams("search", e.target.value)}
              className="product-search-input"
            />

            <hr style={{ margin: "12px 0" }} />

            <label className="filter-label">Categoría</label>
            <select
              value={filters.categoria}
              onChange={(e) => {
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  const value = e.target.value;

                  if (value) p.set("categoria", value);
                  else p.delete("categoria");

                  p.delete("subcategoria"); // Limpiar subcategoría al cambiar categoría
                  p.set("page", 1);

                  return p;
                });
              }}
              className="product-search-input"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="filter-label" style={{ marginTop: 8 }}>
              Subcategoría
            </label>
            <select
              value={filters.subcategoria}
              onChange={(e) => updateParams("subcategoria", e.target.value)}
              className="product-search-input"
            >
              <option value="">Todas</option>
              {subcategories.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label className="filter-label" style={{ marginTop: 8 }}>
              Ordenar por
            </label>
            <select
              value={filters.sort}
              onChange={(e) => updateParams("sort", e.target.value)}
              className="product-search-input"
            >
              <option value="">Sin orden</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
          </aside>

          {/* MAIN */}
          <main className="products-main">
            {loading && (
              <div className="spinner-container">
                <div className="spinner"></div>
                <p>Cargando Productos</p>
              </div>
            )}

            {!loading && productos?.length === 0 && (
              <p>No hay productos disponibles.</p>
            )}
            {!loading && (
              <div className="cards-container">
                {productos?.map((p) => (
                  <Link
                    className="link-none"
                    to={`/producto/${p._id}`}
                    key={p._id}
                  >
                    <div className="product-card">
                      <div className="card-img-productos">
                        <img
                          src={getImageUrl(
                            Array.isArray(p.imagen) ? p.imagen[0] : p.imagen,
                          )}
                          alt={p.name}
                          className="product-card-imagen"
                          onError={(e) => (e.target.src = "/vite.svg")}
                        />
                      </div>
                      <div className="product-card-description">
                        <p className="product-card-text">{p.item}</p>
                        <div className="product-marca-container">
                          <p className="product-marca">{p.marca}</p>
                          <MdVerified className="verified-icon" />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            gap: 4,
                          }}
                        >
                          <p className="product-price">${p.precioConIva}</p>
                          <p className="product-iva">IVA inc.</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {pagination?.totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${
                      pagination.page === i + 1 ? "active-page" : ""
                    }`}
                    onClick={() => updateParams("page", i + 1, false)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default ProductosPage;
