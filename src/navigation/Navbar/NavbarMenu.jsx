import React from "react";
import { Link } from "react-router-dom";
import "../../css/NavbarMenu.css";

// Panel "Todos los productos" del navbar de desktop: las categorías con la cantidad de
// productos de cada una (vienen de /api/products/facetas) y un acceso a las ofertas.
const NavbarMenu = ({ id, categorias, cargando, onElegir }) => (
  <div id={id} className="menu-categorias" role="region" aria-label="Categorías">
    <div className="menu-categorias__lista">
      <p className="menu-categorias__titulo">Categorías</p>
      {cargando && <p className="menu-categorias__estado">Cargando categorías…</p>}
      {!cargando && categorias.length === 0 && (
        <p className="menu-categorias__estado">No hay categorías disponibles.</p>
      )}
      <ul>
        {categorias.map((c) => (
          <li key={c.valor}>
            <Link to={`/productos?categoria=${encodeURIComponent(c.valor)}`} onClick={onElegir}>
              <span>{c.valor}</span>
              <span className="menu-categorias__cantidad">{c.cantidad}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
    <div className="menu-categorias__destacado">
      <p className="menu-categorias__eyebrow">Ofertas</p>
      <p className="menu-categorias__frase">Productos con descuento</p>
      <p className="menu-categorias__texto">Precios rebajados por tiempo limitado.</p>
      <Link to="/productos?ofertas=true" className="menu-categorias__boton" onClick={onElegir}>
        Ver ofertas
      </Link>
      <Link to="/productos?todos=true" className="menu-categorias__boton menu-categorias__boton--borde" onClick={onElegir}>
        Ver todos los productos
      </Link>
    </div>
  </div>
);

export default NavbarMenu;
