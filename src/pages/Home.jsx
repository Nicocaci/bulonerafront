import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import FilaProductos from "../components/FilaProductos.jsx";
import TarjetaProducto from "../components/TarjetaProducto.jsx";
import {
  IconoCamion,
  IconoCategoria,
  IconoFlechaDerecha,
  IconoLocal,
  IconoReloj,
  IconoTarjeta,
  IconoWhatsapp,
} from "../components/IconosTienda.jsx";
import { useFacetas, useProductos } from "../hooks/useCatalogo.js";
import { cldSrcSet, cldUrl } from "../utils/imageUtils.js";
import { MENSAJE_COTIZACION, urlWhatsapp } from "../utils/contacto.js";
import { nombreCategoria } from "../utils/categorias.js";

// Imagen promocional del banner. Se precarga desde index.html: si se cambia la imagen
// (o su ancho o "sizes"), cambiarla también allá; si no coinciden, el navegador baja las dos.
const BANNER = {
  src: "https://res.cloudinary.com/dn4lt8fhc/image/upload/v1790002161/promo-1.png",
  alt: "Combo Ronix: amoladora 115 mm 800 W y taladro 13 mm 750 W, precio final $149.000",
  href: "/productos?page=1&marca=Ronix&search=kit",
  ancho: 600,
  sizes: "(max-width: 900px) 100vw, 560px",
};

// Pestañas de "Destacados por categoría" (valor = nombre exacto de la categoría en la base)
const PESTANAS = [
  { valor: "Herramientas Electricas", corto: "Eléctricas" },
  { valor: "Herramientas Manuales", corto: "Manuales" },
  { valor: "Soldadura", corto: "Soldadura" },
];

// Logos de "Marcas que trabajamos" (archivos de public/marcas). El nombre es el que se
// usa para filtrar el catálogo.
const MARCAS = [
  { nombre: "Ronix", logo: "/marcas/ronixlogo.png", ancho: 809, alto: 364 },
  { nombre: "Bahco", logo: "/marcas/logo-bahco.svg", ancho: 137, alto: 82 },
  { nombre: "Bosch", logo: "/marcas/logo-bosch.svg", ancho: 433, alto: 97 },
  { nombre: "Skil", logo: "/marcas/logo-skil.webp", ancho: 300, alto: 129 },
  { nombre: "Fischer", logo: "/marcas/logo-fischer.webp", ancho: 387, alto: 60 },
  { nombre: "Bremen", logo: "/marcas/logo-bremen.svg", ancho: 92, alto: 27 },
  { nombre: "Crossmaster", logo: "/marcas/logo-crossmaster.png", ancho: 350, alto: 40 },
  { nombre: "Venturo", logo: "/marcas/logo-venturo.webp", ancho: 300, alto: 97 },
];

const linkCategoria = (valor) => `/productos?categoria=${encodeURIComponent(valor)}`;
const linkMarca = (marca) => `/productos?marca=${encodeURIComponent(marca)}`;

const Beneficio = ({ icono, titulo, detalle, className = "" }) => (
  <li className={`home-beneficio ${className}`}>
    <span className="home-beneficio__icono">{icono}</span>
    <span className="home-beneficio__texto">
      <strong>{titulo}</strong>
      <span>{detalle}</span>
    </span>
  </li>
);

// Pestañas accesibles: con las flechas del teclado se pasa de una a otra
function PestanasCategorias({ activa, onCambiar }) {
  const refs = useRef([]);
  const alTeclado = (e, i) => {
    let siguiente = null;
    if (e.key === "ArrowRight") siguiente = (i + 1) % PESTANAS.length;
    if (e.key === "ArrowLeft") siguiente = (i - 1 + PESTANAS.length) % PESTANAS.length;
    if (e.key === "Home") siguiente = 0;
    if (e.key === "End") siguiente = PESTANAS.length - 1;
    if (siguiente === null) return;
    e.preventDefault();
    onCambiar(PESTANAS[siguiente].valor);
    refs.current[siguiente]?.focus();
  };

  return (
    <div className="home-pestanas" role="tablist" aria-label="Categorías">
      {PESTANAS.map((p, i) => {
        const seleccionada = p.valor === activa;
        return (
          <button
            key={p.valor}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="tab"
            id={`pestana-${i}`}
            aria-selected={seleccionada}
            aria-controls="fila-destacados"
            tabIndex={seleccionada ? 0 : -1}
            className="home-pestana"
            onClick={() => onCambiar(p.valor)}
            onKeyDown={(e) => alTeclado(e, i)}
          >
            <span className="home-solo-desktop">{nombreCategoria(p.valor)}</span>
            <span className="home-solo-mobile">{p.corto}</span>
          </button>
        );
      })}
    </div>
  );
}

const Home = () => {
  const [pestana, setPestana] = useState(PESTANAS[0].valor);

  // Categorías con su cantidad (misma consulta que el menú del navbar: queda en caché)
  const facetas = useFacetas();
  const categorias = [...(facetas.data?.categorias ?? [])]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 8);

  const ofertas = useProductos({ soloOfertas: "true", sort: "descuento_desc", limit: 12 });
  const ronix = useProductos({ marca: "Ronix", limit: 3 });
  const destacados = useProductos({ category: pestana, limit: 12 });

  const listaOfertas = ofertas.data?.products ?? [];
  const hayOfertas = ofertas.isLoading || listaOfertas.length > 0;

  return (
    <div className="home-fondo">
      <div className="home">
        {/* Título principal de la página (para Google y lectores de pantalla) */}
        <h1 className="solo-lectores">
          Bulonera El Triángulo: bulones, herramientas y seguridad industrial en Gutiérrez
        </h1>
        {/* 1. Banner: imagen promocional + cotización y envíos */}
        <section className="home-destacado" aria-label="Destacado">
          <Link to={BANNER.href} className="home-destacado__imagen">
            <img
              src={cldUrl(BANNER.src, BANNER.ancho)}
              srcSet={cldSrcSet(BANNER.src, BANNER.ancho)}
              sizes={BANNER.sizes}
              alt={BANNER.alt}
              width={429}
              height={402}
              fetchpriority="high"
            />
          </Link>
          <div className="home-destacado__bloques">
            <div className="home-bloque home-bloque--oscuro">
              <p className="home-bloque__etiqueta">COTIZACIONES</p>
              <h2 className="home-bloque__titulo">Cotizá en el acto</h2>
              <p className="home-bloque__texto">
                Enviá tu lista de materiales y recibí tu presupuesto en minutos.
              </p>
              <a
                href={urlWhatsapp(MENSAJE_COTIZACION)}
                target="_blank"
                rel="noopener noreferrer"
                className="home-boton"
              >
                <IconoWhatsapp />
                <span className="home-solo-desktop">Pedir cotización por WhatsApp</span>
                <span className="home-solo-mobile">Pedir cotización</span>
              </a>
            </div>
            <div className="home-bloque home-bloque--claro">
              <div className="home-bloque__contenido">
                <p className="home-bloque__etiqueta home-bloque__etiqueta--marca">ENVÍOS</p>
                <h2 className="home-bloque__titulo">Llegamos a todo el país</h2>
                <p className="home-bloque__texto">
                  El costo se calcula en el checkout con tu código postal. También podés retirar sin
                  cargo en el local.
                </p>
                <Link to="/faq" className="home-link">
                  Cómo comprar
                  <IconoFlechaDerecha />
                </Link>
              </div>
              <span className="home-bloque__ilustracion" aria-hidden="true">
                <IconoCamion tam={52} grosor={1.4} />
              </span>
            </div>
          </div>
        </section>

        {/* 2. Beneficios (en mobile cambia el primero: envíos en lugar de atención) */}
        <ul className="home-beneficios" aria-label="Beneficios">
          <Beneficio
            className="home-solo-mobile-flex"
            icono={<IconoCamion />}
            titulo="Envíos a todo el país"
            detalle="Costo según tu código postal"
          />
          <Beneficio
            icono={<IconoTarjeta />}
            titulo="Pagá con Mercado Pago"
            detalle="Crédito, débito o dinero en cuenta"
          />
          <Beneficio
            icono={<IconoLocal />}
            titulo="Retiro sin cargo"
            detalle={
              <>
                <span className="home-solo-desktop">Camino Gral. Belgrano 6444, Gutiérrez</span>
                <span className="home-solo-mobile">En el local de Gutiérrez</span>
              </>
            }
          />
          <Beneficio
            className="home-solo-desktop-flex"
            icono={<IconoReloj />}
            titulo="Atención en el local"
            detalle="Lun a vie 8 a 18 h · Sáb 8 a 13 h"
          />
        </ul>

        {/* 3. Categorías */}
        {(facetas.isLoading || categorias.length > 0) && (
          <section className="home-seccion" aria-labelledby="titulo-categorias">
            <div className="home-seccion__encabezado">
              <h2 id="titulo-categorias" className="home-seccion__titulo">
                <span className="home-solo-desktop">Comprá por categoría</span>
                <span className="home-solo-mobile">Categorías</span>
              </h2>
              <Link to="/productos?todos=true" className="home-link">
                <span className="home-solo-desktop">Ver todos los productos</span>
                <span className="home-solo-mobile">Ver todas</span>
                <IconoFlechaDerecha />
              </Link>
            </div>
            <ul className="home-categorias" aria-busy={facetas.isLoading || undefined}>
              {facetas.isLoading
                ? Array.from({ length: 8 }, (_, i) => (
                    <li key={i}>
                      <div className="home-categoria home-categoria--vacia" />
                    </li>
                  ))
                : categorias.map((c) => (
                    <li key={c.valor}>
                      <Link to={linkCategoria(c.valor)} className="home-categoria">
                        <span className="home-categoria__icono" aria-hidden="true">
                          <IconoCategoria nombre={c.valor} />
                        </span>
                        <span className="home-categoria__texto">
                          <span className="home-categoria__nombre">{nombreCategoria(c.valor)}</span>
                          <span className="home-categoria__cantidad">
                            {c.cantidad} {c.cantidad === 1 ? "producto" : "productos"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
            </ul>
          </section>
        )}

        {/* 4. Ofertas (si no hay ninguna vigente, la sección no aparece) */}
        {hayOfertas && (
          <FilaProductos
            id="ofertas"
            titulo="Ofertas"
            subtitulo="Precios rebajados por tiempo limitado."
            linkVerTodos="/productos?ofertas=true"
            textoVerTodos="Ver todas las ofertas"
            textoVerTodosCorto="Ver todas"
            productos={listaOfertas}
            cargando={ofertas.isLoading}
            error={ofertas.isError}
          />
        )}

        {/* 5. Ronix */}
        <section className="home-ronix" aria-labelledby="titulo-ronix">
          <div className="home-ronix__texto">
            <img
              src="/marcas/ronixlogo.png"
              alt="Ronix"
              width={809}
              height={364}
              className="home-ronix__logo"
              loading="lazy"
            />
            <h2 id="titulo-ronix" className="home-ronix__titulo">
              Toda la línea Ronix en un solo lugar
            </h2>
            <p className="home-ronix__bajada">Distribuidores oficiales.</p>
            <Link to={linkMarca("Ronix")} className="home-boton home-ronix__boton">
              Ver productos Ronix
              <IconoFlechaDerecha />
            </Link>
          </div>
          <ul
            className="home-ronix__productos"
            aria-label="Productos Ronix"
            aria-busy={ronix.isLoading || undefined}
          >
            {ronix.isLoading
              ? Array.from({ length: 3 }, (_, i) => (
                  <li key={i}>
                    <div className="fila-productos__vacia" />
                  </li>
                ))
              : (ronix.data?.products ?? []).map((producto) => (
                  <li key={producto._id}>
                    <TarjetaProducto producto={producto} />
                  </li>
                ))}
          </ul>
        </section>

        {/* 6. Destacados por categoría, con pestañas */}
        <FilaProductos
          id="destacados"
          titulo="Destacados por categoría"
          linkVerTodos={linkCategoria(pestana)}
          textoVerTodos={`Ver todo en ${nombreCategoria(pestana)}`}
          textoVerTodosCorto="Ver todo"
          productos={destacados.data?.products ?? []}
          cargando={destacados.isLoading}
          error={destacados.isError}
        >
          <PestanasCategorias activa={pestana} onCambiar={setPestana} />
        </FilaProductos>

        {/* 7. Marcas */}
        <section className="home-seccion" aria-labelledby="titulo-marcas">
          <div className="home-seccion__encabezado">
            <h2 id="titulo-marcas" className="home-seccion__titulo">
              <span className="home-solo-desktop">Marcas que trabajamos</span>
              <span className="home-solo-mobile">Marcas</span>
            </h2>
          </div>
          <ul className="home-marcas">
            {MARCAS.map((m) => (
              <li key={m.nombre}>
                <Link
                  to={linkMarca(m.nombre)}
                  className="home-marca"
                  aria-label={`Ver productos ${m.nombre}`}
                >
                  <img src={m.logo} alt="" width={m.ancho} height={m.alto} loading="lazy" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Home;
