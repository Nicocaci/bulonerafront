import React, { useState, useEffect, useRef } from "react";
import "../css/ProductosPage.css";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import { getImageUrl } from "../utils/imageUtils";
import { MarcasLogos } from "../components/MarcasLogos.jsx";

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);

  const [searchInput, setSearchInput] = useState("");

  // 🔥 Estado del drawer mobile
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const productosPorPagina = 12;

  const tieneFiltros =
    searchParams.get("marca") ||
    searchParams.get("categoria") ||
    searchParams.get("subcategoria") ||
    searchParams.get("search") ||
    searchParams.get("todos") ||
    searchParams.get("ofertas");

  const search = searchParams.get("search");
  const categoria = searchParams.get("categoria");
  const subcategoria = searchParams.get("subcategoria");
  const marca = searchParams.get("marca");
  const ofertas = searchParams.get("ofertas");

  // 🔥 Cuenta filtros activos para el badge
  const filtrosActivos = [categoria, marca, ofertas].filter(Boolean).length;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = searchInput.trim();

      if (trimmed === (search || "")) return; // 🔥 evita loops

      setDebouncedSearch(trimmed);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  useEffect(() => {
    if (debouncedSearch === (search || "")) return; // 🔥 ESTA es la clave

    updateParams("search", debouncedSearch);
  }, [debouncedSearch, search]);

  // 🔥 Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (drawerAbierto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerAbierto]);

  const prevSearch = useRef(search);
  useEffect(() => {
    if (search !== prevSearch.current) {
      prevSearch.current = search;
      setSearchInput(search || "");
    }
  }, [search]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get("/api/products", {
          params: {
            page: paginaActual,
            limit: productosPorPagina,
            ...(search && { search }),
            ...(categoria && { category: categoria }),
            ...(subcategoria && { subcategory: subcategoria }),
            ...(marca && { marca: marca }),
            ...(ofertas && { soloOfertas: true }),
          },
        });

        const { products, pagination } = response.data;

        setProductos(products);
        setTotalPaginas(pagination.totalPages);
        setTotalProductos(pagination.total);
      } catch (err) {
        console.error(err);
        setError("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [paginaActual, search, categoria, subcategoria, marca, ofertas]);

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

  const limpiarFiltros = () => {
    setSearchInput("");
    setPaginaActual(1);
    setSearchParams({ todos: "true" });
    setDrawerAbierto(false);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // 🔥 Contenido de filtros reutilizable (lo usan tanto el sidebar desktop como el drawer mobile)
  const FiltrosContenido = () => (
    <>
      <div className="filtro-group">
        <label>Buscar</label>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="filtro-input"
        />
      </div>

      <div className="filtro-group">
        <label>Categoría</label>
        <select
          className="filtro-select"
          value={ofertas ? "oferta" : categoria || ""}
          onChange={(e) => {
            const nextParams = new URLSearchParams(searchParams);
            const nextCategory = e.target.value;

            nextParams.delete("categoria");
            nextParams.delete("ofertas");

            if (nextCategory === "oferta") {
              nextParams.set("ofertas", "true");
            } else if (nextCategory) {
              nextParams.set("categoria", nextCategory);
            }

            setPaginaActual(1);
            setSearchParams(nextParams);
          }}
        >
          <option value="">Todas</option>
          <option value="Buloneria">Bulonería</option>
          <option value="Herramientas">Herramientas</option>
          <option value="Construccion">Construcción</option>
          <option value="Automotor">Automotor</option>
          <option value="Seguridad">Seguridad Industrial</option>
          <option value="Kits">Kits</option>
          <option value="oferta">Ofertas</option>
        </select>
      </div>
    </>
  );

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-productos">
      {!tieneFiltros ? (
        <div className="marcas-inicial">
          <MarcasLogos />
        </div>
      ) : (
        <>
          {/* 🔹 TOPBAR con botón volver + botón filtros (mobile) */}
          <div className="btn-container-productos">
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              ⬅ Volver
            </button>

            {/* Solo visible en mobile */}
            <button
              className="btn-filtros-mobile"
              onClick={() => setDrawerAbierto(true)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 4h12M4 8h8M6 12h4" />
              </svg>
              Filtros
              {filtrosActivos > 0 && (
                <span className="filtros-badge">{filtrosActivos}</span>
              )}
            </button>
          </div>

          <div className="productos-layout">
            {/* 🔹 SIDEBAR FILTROS — solo visible en desktop */}
            <div className="filtros-container">
              <FiltrosContenido />
              <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>

            {/* 🔹 PRODUCTOS */}
            <div className="productos-grid">
              {productos.length === 0 ? (
                <p className="sin-productos">No hay productos</p>
              ) : (
                productos.map((p) => (
                  <Link
                    className="link-none"
                    to={`/producto/${p._id}`}
                    key={p._id}
                  >
                    <div className="producto-card">
                      <div className="producto-imagen-container">
                        <img
                          src={getImageUrl(p.imagen?.[0])}
                          alt={p.item}
                          className="producto-imagen"
                        />
                      </div>
                      <div className="producto-info">
                        <h3 className="producto-nombre">{p.item}</h3>
                        <div className="producto-precio-container">
                          <span className="producto-precio">
                            ${p.precioConIva}
                          </span>
                          <span className="producto-iva">IVA incl.</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* 🔹 PAGINACIÓN */}
          <div className="paginacion-container">
            <div className="paginacion-controls">
              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              <span>{paginaActual}</span>
              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
            <div className="paginacion-info">
              <p>
                Mostrando {productos.length} de {totalProductos}
              </p>
            </div>
          </div>

          {/* =============================================
              🔥 DRAWER MOBILE
          ============================================= */}

          {/* Overlay oscuro */}
          <div
            className={`drawer-overlay ${drawerAbierto ? "drawer-overlay--visible" : ""}`}
            onClick={() => setDrawerAbierto(false)}
          />

          {/* Drawer */}
          <aside
            className={`filtros-drawer ${drawerAbierto ? "filtros-drawer--open" : ""}`}
          >
            {/* Handle visual */}
            <div className="drawer-handle" />

            <div className="drawer-header">
              <span>Filtros</span>
              <button
                className="drawer-close"
                onClick={() => setDrawerAbierto(false)}
                aria-label="Cerrar filtros"
              >
                ✕
              </button>
            </div>

            <div className="drawer-body">
              <FiltrosContenido />
            </div>

            <div className="drawer-footer">
              <button className="btn-drawer-limpiar" onClick={limpiarFiltros}>
                Limpiar
              </button>
              <button
                className="btn-drawer-aplicar"
                onClick={() => setDrawerAbierto(false)}
              >
                Ver resultados
                {totalProductos > 0 && <span> ({totalProductos})</span>}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default Productos;
