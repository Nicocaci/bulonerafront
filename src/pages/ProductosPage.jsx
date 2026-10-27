import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MarcasLogos } from "../components/MarcasLogos";
import TarjetaProducto from "../components/TarjetaProducto.jsx";
import Pagination from "../components/Pagination.jsx";
import { useFacetas, useProductos } from "../hooks/useCatalogo.js";
import "../css/ProductosPage.css";

// Cuántas opciones se ven por grupo antes de "Ver todas"
const VISIBLES = 6;

const IconoCerrar = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

// Grupo de opciones de una sola elección (categoría, subcategoría o marca) con cantidades
const GrupoFiltro = ({ titulo, nombre, opciones, valor, onElegir, totalTodas }) => {
  const [verTodas, setVerTodas] = useState(false);
  if (opciones.length === 0) return null;

  // La opción elegida siempre queda visible aunque esté más abajo en la lista
  const ordenadas = [...opciones].sort((a, b) => b.cantidad - a.cantidad);
  const visibles = verTodas
    ? ordenadas
    : ordenadas.filter((o, i) => i < VISIBLES || o.valor === valor);

  return (
    <fieldset className="filtro-grupo">
      <legend className="filtro-grupo__titulo">{titulo}</legend>
      <label className="filtro-opcion">
        <input type="radio" name={nombre} checked={!valor} onChange={() => onElegir("")} />
        <span className="filtro-opcion__texto">Todas</span>
        {totalTodas != null && <span className="filtro-opcion__cantidad">{totalTodas}</span>}
      </label>
      {visibles.map((o) => (
        <label className="filtro-opcion" key={o.valor}>
          <input
            type="radio"
            name={nombre}
            checked={valor === o.valor}
            onChange={() => onElegir(o.valor)}
          />
          <span className="filtro-opcion__texto">{o.valor}</span>
          <span className="filtro-opcion__cantidad">{o.cantidad}</span>
        </label>
      ))}
      {ordenadas.length > VISIBLES && (
        <button type="button" className="filtro-ver-todas" onClick={() => setVerTodas((v) => !v)}>
          {verTodas ? "Ver menos" : `Ver las ${ordenadas.length}`}
        </button>
      )}
    </fieldset>
  );
};

const ProductosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [panelAbierto, setPanelAbierto] = useState(false);

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

  const {
    data: resultado,
    isLoading: loading,
    isError,
    isPlaceholderData: actualizando,
  } = useProductos(filters);
  const productos = resultado?.products ?? [];
  const pagination = resultado?.pagination ?? { page: 1, totalPages: 1 };

  const { data: facetas } = useFacetas(filters);
  // Las categorías se cuentan sin la subcategoría elegida: la subcategoría depende de la
  // categoría, y si no, con "Bulones › Allen" la lista solo mostraría Bulones y no se
  // podría cambiar de categoría. Sin subcategoría es la misma consulta (misma caché).
  const { data: facetasSinSubcategoria } = useFacetas({ ...filters, subcategory: "" });
  const categoriasFiltro = (filters.subcategory ? facetasSinSubcategoria : facetas)?.categorias ?? [];

  // Con el panel de filtros abierto en mobile, la página de atrás no se desplaza
  useEffect(() => {
    if (!panelAbierto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alEscape = (e) => e.key === "Escape" && setPanelAbierto(false);
    document.addEventListener("keydown", alEscape);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", alEscape);
    };
  }, [panelAbierto]);

  // Cambia uno o más parámetros de la URL y vuelve a la página 1
  const cambiar = (cambios, resetPage = true) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      Object.entries(cambios).forEach(([clave, valor]) => {
        if (valor) p.set(clave, valor);
        else p.delete(clave);
      });
      if (resetPage) p.set("page", 1);
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

  if (!tieneFiltros) {
    return (
      <div className="catalogo">
        <div className="marcas-inicial">
          <MarcasLogos />
        </div>
      </div>
    );
  }

  const chips = [
    filters.search && { clave: "search", texto: `“${filters.search}”` },
    filters.category && { clave: "categoria", texto: filters.category, extra: { subcategoria: "" } },
    filters.subcategory && { clave: "subcategoria", texto: filters.subcategory },
    filters.marca && { clave: "marca", texto: `Marca: ${filters.marca}` },
    filters.soloOfertas && { clave: "ofertas", texto: "Solo ofertas" },
  ].filter(Boolean);

  const titulo = filters.search
    ? `Resultados para “${filters.search}”`
    : filters.subcategory || filters.category || (filters.soloOfertas ? "Ofertas" : "Todos los productos");

  const total = pagination.total ?? facetas?.total;

  const limpiarTodo = () => setSearchParams({ todos: "true", page: "1" });

  const selectorOrden = (id) => (
    <div className="catalogo__orden">
      <label htmlFor={id}>Ordenar por</label>
      <select id={id} value={filters.sort} onChange={(e) => cambiar({ sort: e.target.value })}>
        <option value="">{filters.search ? "Más relevantes" : "Predeterminado"}</option>
        <option value="price_asc">Precio: menor a mayor</option>
        <option value="price_desc">Precio: mayor a menor</option>
      </select>
    </div>
  );

  // Se dibuja dos veces (columna de desktop y panel de mobile): el prefijo evita que
  // los botones de opción de los dos lugares queden en el mismo grupo del navegador
  const panelFiltros = (prefijo) => (
    <>
      <GrupoFiltro
        titulo="Categoría"
        nombre={`${prefijo}-categoria`}
        opciones={categoriasFiltro}
        valor={filters.category}
        onElegir={(v) => cambiar({ categoria: v, subcategoria: "" })}
      />
      {filters.category && (
        <GrupoFiltro
          titulo="Subcategoría"
          nombre={`${prefijo}-subcategoria`}
          opciones={facetas?.subcategorias ?? []}
          valor={filters.subcategory}
          onElegir={(v) => cambiar({ subcategoria: v })}
        />
      )}
      <GrupoFiltro
        titulo="Marca"
        nombre={`${prefijo}-marca`}
        opciones={facetas?.marcas ?? []}
        valor={filters.marca}
        onElegir={(v) => cambiar({ marca: v })}
      />
      <div className="filtro-grupo">
        <label className="filtro-interruptor">
          <span>
            Solo ofertas{" "}
            <span className="filtro-opcion__cantidad">({facetas?.enOferta ?? 0})</span>
          </span>
          <input
            type="checkbox"
            checked={filters.soloOfertas}
            onChange={(e) => cambiar({ ofertas: e.target.checked ? "true" : "" })}
          />
        </label>
      </div>
    </>
  );

  return (
    <div className="catalogo">
      <div className="catalogo__contenedor">
        <nav aria-label="Ruta" className="catalogo__ruta">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link to="/productos?todos=true">Productos</Link>
          {filters.category && (
            <>
              <span aria-hidden="true">/</span>
              <span>{filters.category}</span>
            </>
          )}
        </nav>

        <div className="catalogo__encabezado">
          <h1>{titulo}</h1>
          {total != null && (
            <span className="catalogo__total">
              {total} {total === 1 ? "producto" : "productos"}
            </span>
          )}
        </div>

        {/* Mobile: botones de filtro y orden */}
        <div className="catalogo__barra-mobile">
          <button type="button" className="catalogo__btn-filtrar" onClick={() => setPanelAbierto(true)}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filtrar
            {chips.length > 0 && <span className="catalogo__contador">{chips.length}</span>}
          </button>
          {selectorOrden("orden-mobile")}
        </div>

        <div className="catalogo__layout">
          <aside className="catalogo__filtros" aria-label="Filtros">
            <div className="catalogo__filtros-cabecera">
              <h2>Filtros</h2>
              {chips.length > 0 && (
                <button type="button" className="filtro-limpiar" onClick={limpiarTodo}>
                  Limpiar
                </button>
              )}
            </div>
            {panelFiltros("lateral")}
          </aside>

          <section className="catalogo__resultados" aria-label="Resultados">
            <div className="catalogo__activos">
              {chips.length > 0 && <span className="catalogo__activos-titulo">Filtros activos:</span>}
              {chips.map((c) => (
                <button
                  type="button"
                  key={c.clave}
                  className="chip-filtro"
                  onClick={() => cambiar({ [c.clave]: "", ...(c.extra || {}) })}
                  aria-label={`Quitar filtro ${c.texto}`}
                >
                  {c.texto}
                  <IconoCerrar />
                </button>
              ))}
              {chips.length > 1 && (
                <button type="button" className="filtro-limpiar" onClick={limpiarTodo}>
                  Limpiar todo
                </button>
              )}
              <span className="catalogo__espacio" />
              <div className="catalogo__orden-desktop">{selectorOrden("orden-desktop")}</div>
            </div>

            {loading && (
              <div className="spinner-container">
                <p>Cargando productos…</p>
              </div>
            )}

            {!loading && isError && (
              <p role="alert" className="catalogo__mensaje">
                No pudimos cargar los productos. Probá de nuevo en unos segundos.
              </p>
            )}

            {!loading && !isError && productos.length === 0 && (
              <div className="catalogo__mensaje">
                <p>No encontramos productos con estos filtros.</p>
                <button type="button" className="filtro-limpiar" onClick={limpiarTodo}>
                  Ver todos los productos
                </button>
              </div>
            )}

            {!loading && !isError && productos.length > 0 && (
              <div
                className={`catalogo__grilla ${actualizando ? "is-updating" : ""}`}
                aria-busy={actualizando}
              >
                {productos.map((p) => (
                  <TarjetaProducto key={p._id} producto={p} />
                ))}
              </div>
            )}

            {pagination?.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => cambiar({ page }, false)}
              />
            )}
          </section>
        </div>
      </div>

      {/* Mobile: panel de filtros que sube desde abajo */}
      {panelAbierto && (
        <div className="panel-filtros__fondo" onClick={() => setPanelAbierto(false)}>
          <div
            className="panel-filtros"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-filtros__cabecera">
              <h2>Filtros</h2>
              <div>
                {chips.length > 0 && (
                  <button type="button" className="filtro-limpiar" onClick={limpiarTodo}>
                    Limpiar
                  </button>
                )}
                <button
                  type="button"
                  className="panel-filtros__cerrar"
                  aria-label="Cerrar filtros"
                  onClick={() => setPanelAbierto(false)}
                  autoFocus
                >
                  <IconoCerrar />
                </button>
              </div>
            </div>
            <div className="panel-filtros__cuerpo">{panelFiltros("panel")}</div>
            <div className="panel-filtros__pie">
              <button type="button" className="boton-oscuro" onClick={() => setPanelAbierto(false)}>
                Ver {facetas?.total ?? total ?? ""} productos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosPage;
