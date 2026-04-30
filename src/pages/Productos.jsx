import React, { useState, useEffect } from "react";
import "../css/ProductosPage.css";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import { getImageUrl } from "../utils/imageUtils";

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);

  const [searchInput, setSearchInput] = useState("");

  const productosPorPagina = 12;

  const logos = [
    "ronixlogo.png",
    "logo-crossmaster.png",
    "logo-bahco.svg",
    "logo-bremen.svg",
    "logo-bosch.svg",
    "logo-skil.png",
    "logo-fischer.webp",
    "logo-venturo.jpg",
  ];

  // 🔥 Detectar si hay filtros (SIN STATE)
  const tieneFiltros =
    searchParams.get("marca") ||
    searchParams.get("categoria") ||
    searchParams.get("subcategoria") ||
    searchParams.get("search");

  const search = searchParams.get("search");
  const categoria = searchParams.get("categoria");
  const subcategoria = searchParams.get("subcategoria");
  const marca = searchParams.get("marca");

  // 🔥 Sync input con URL (al entrar directo con ?search=...)
  useEffect(() => {
    setSearchInput(search || "");
  }, [search]);

  // 🔥 FETCH (SIEMPRE se ejecuta cuando cambian params)
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
  }, [paginaActual, search, categoria, subcategoria, marca]);

  // 🔥 DEBOUNCE BUSCADOR
  useEffect(() => {
    const delay = setTimeout(() => {
      setPaginaActual(1);
      const nextParams = new URLSearchParams(searchParams.toString());
      const trimmedSearch = searchInput.trim();

      if (trimmedSearch) {
        nextParams.set("search", trimmedSearch);
      } else {
        nextParams.delete("search");
      }

      setSearchParams(nextParams);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput, search, categoria, subcategoria, marca, searchParams, setSearchParams]);

  const limpiarFiltros = () => {
    setSearchInput("");
    setPaginaActual(1);
    setSearchParams({});
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getBrandDisplayNameFromFilename = (filename) => {
    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/^logo[-_]?/i, "")
      .replace(/[-_]/g, " ")
      .replace(/logo$/i, "")
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const handleSeleccionarMarca = (logoName) => {
    const marca = getBrandDisplayNameFromFilename(logoName);
    const nextParams = new URLSearchParams(searchParams);

    setPaginaActual(1);
    nextParams.set("marca", marca);
    setSearchParams(nextParams);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-productos">
      {!tieneFiltros ? (
        <div className="marcas-inicial">
          <h2>Buscar por marca</h2>
          <p>Seleccione una marca para ver sus productos.</p>

          <div className="grid-logo-marcas">
            {logos.map((logo, i) => (
              <div key={i} className="marca-container">
                <img
                  src={`marcas/${logo}`}
                  alt={logo}
                  className="logo-marca"
                  onClick={() => handleSeleccionarMarca(logo)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <button className="btn-limpiar" onClick={limpiarFiltros}>
            Volver
          </button>

          <div className="productos-layout">
            {/* 🔹 FILTROS */}
            <div className="filtros-container">
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
                  value={categoria || ""}
                  onChange={(e) => {
                    const nextParams = new URLSearchParams(searchParams);
                    const nextCategory = e.target.value;

                    if (nextCategory) {
                      nextParams.set("categoria", nextCategory);
                    } else {
                      nextParams.delete("categoria");
                    }

                    setPaginaActual(1);
                    setSearchParams(nextParams);
                  }}
                >
                  <option value="">Todas</option>
                  <option value="Herramientas Manuales">Herramientas manuales</option>
                  <option value="Herramientas Electricas">Herramientas Eléctricas</option>
                </select>
              </div>

              <button className="btn-limpiar" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>

            {/* 🔹 PRODUCTOS */}
            <div className="productos-grid">
              {productos.length === 0 ? (
                <p className="sin-productos">No hay productos</p>
              ) : (
                productos.map((p) => (
                  <Link className="link-none" to={`/producto/${p._id}`} key={p._id}>
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
                          <span className="producto-precio">${p.precioConIva}</span>
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
        </>
      )}
    </div>
  );
};

export default Productos;
