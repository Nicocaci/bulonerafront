import { Link } from "react-router-dom";

// Panel "Marcas" del navbar de desktop: las marcas con la cantidad de productos de cada
// una (vienen de /api/products/facetas, la misma consulta que el panel de categorías).
const NavbarMarcas = ({ id, marcas, cargando, onElegir }) => (
  <div id={id} className="menu-categorias menu-marcas" role="region" aria-label="Marcas">
    <div className="menu-categorias__lista">
      <p className="menu-categorias__titulo">Marcas</p>
      {cargando && <p className="menu-categorias__estado">Cargando marcas…</p>}
      {!cargando && marcas.length === 0 && (
        <p className="menu-categorias__estado">No hay marcas disponibles.</p>
      )}
      <ul>
        {marcas.map((m) => (
          <li key={m.valor}>
            <Link to={`/productos?marca=${encodeURIComponent(m.valor)}`} onClick={onElegir}>
              <span>{m.valor}</span>
              <span className="menu-categorias__cantidad">{m.cantidad}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default NavbarMarcas;
