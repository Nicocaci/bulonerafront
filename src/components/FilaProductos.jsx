import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TarjetaProducto from "./TarjetaProducto.jsx";
import { IconoAnterior, IconoFlechaDerecha, IconoSiguiente } from "./IconosTienda.jsx";

/**
 * Sección de la Home con título, link "Ver todos" y una fila de productos que se desliza
 * de costado (CSS scroll-snap, sin librerías: reemplaza a los carruseles con Swiper).
 * En pantallas táctiles se desliza con el dedo; en desktop, con las flechas, que avanzan
 * lo que se ve en pantalla. Mientras carga reserva el alto con tarjetas vacías.
 * `children` va entre el título y la fila (por ejemplo, las pestañas de categorías).
 */
function FilaProductos({
  id,
  titulo,
  subtitulo,
  linkVerTodos,
  textoVerTodos,
  textoVerTodosCorto,
  productos = [],
  cargando,
  error,
  children,
}) {
  const filaRef = useRef(null);
  const [puedeAnterior, setPuedeAnterior] = useState(false);
  const [puedeSiguiente, setPuedeSiguiente] = useState(false);

  const actualizarFlechas = useCallback(() => {
    const fila = filaRef.current;
    if (!fila) return;
    setPuedeAnterior(fila.scrollLeft > 4);
    setPuedeSiguiente(fila.scrollLeft + fila.clientWidth < fila.scrollWidth - 4);
  }, []);

  useEffect(() => {
    // Productos nuevos (por ejemplo, otra pestaña): la fila vuelve al principio
    if (filaRef.current) filaRef.current.scrollLeft = 0;
    actualizarFlechas();
    window.addEventListener("resize", actualizarFlechas);
    return () => window.removeEventListener("resize", actualizarFlechas);
  }, [actualizarFlechas, productos]);

  const mover = (direccion) => {
    const fila = filaRef.current;
    if (!fila) return;
    fila.scrollBy({ left: direccion * fila.clientWidth, behavior: "smooth" });
  };

  const hayFlechas = puedeAnterior || puedeSiguiente;

  return (
    <section className="home-seccion" aria-labelledby={`titulo-${id}`}>
      <div className="home-seccion__encabezado">
        <div>
          <h2 id={`titulo-${id}`} className="home-seccion__titulo">
            {titulo}
          </h2>
          {subtitulo && <p className="home-seccion__subtitulo">{subtitulo}</p>}
        </div>
        <div className="home-seccion__acciones">
          {linkVerTodos && (
            <Link to={linkVerTodos} className="home-link">
              {textoVerTodosCorto ? (
                <>
                  <span className="home-solo-desktop">{textoVerTodos}</span>
                  <span className="home-solo-mobile">{textoVerTodosCorto}</span>
                </>
              ) : (
                textoVerTodos
              )}
              <IconoFlechaDerecha />
            </Link>
          )}
          {hayFlechas && (
            <div className="fila-productos__flechas">
              <button
                type="button"
                className="fila-productos__flecha"
                aria-label={`Anteriores de ${titulo}`}
                aria-controls={`fila-${id}`}
                onClick={() => mover(-1)}
                disabled={!puedeAnterior}
              >
                <IconoAnterior />
              </button>
              <button
                type="button"
                className="fila-productos__flecha"
                aria-label={`Siguientes de ${titulo}`}
                aria-controls={`fila-${id}`}
                onClick={() => mover(1)}
                disabled={!puedeSiguiente}
              >
                <IconoSiguiente />
              </button>
            </div>
          )}
        </div>
      </div>

      {children}

      {error ? (
        <p className="home-seccion__mensaje">No se pudieron cargar los productos.</p>
      ) : (
        <ul
          id={`fila-${id}`}
          ref={filaRef}
          className="fila-productos"
          aria-busy={cargando || undefined}
          onScroll={actualizarFlechas}
        >
          {cargando
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="fila-productos__item">
                  <div className="fila-productos__vacia" />
                </li>
              ))
            : productos.map((producto) => (
                <li key={producto._id} className="fila-productos__item">
                  <TarjetaProducto producto={producto} />
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}

export default FilaProductos;
