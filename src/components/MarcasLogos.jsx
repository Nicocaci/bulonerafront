import { useSearchParams } from "react-router-dom";

// Logos de public/marcas. El nombre es el que se usa para filtrar el catálogo
// (el mismo que antes se sacaba del nombre del archivo).
const MARCAS = [
  { nombre: "Ronix", logo: "ronixlogo.png" },
  { nombre: "Crossmaster", logo: "logo-crossmaster.png" },
  { nombre: "Bahco", logo: "logo-bahco.svg" },
  { nombre: "Bremen", logo: "logo-bremen.svg" },
  { nombre: "Bosch", logo: "logo-bosch.svg" },
  { nombre: "Skil", logo: "logo-skil.webp" },
  { nombre: "Fischer", logo: "logo-fischer.webp" },
  { nombre: "Venturo", logo: "logo-venturo.webp" },
];

// Portada de /productos sin filtros. Fase 6: cada marca es un botón (se puede usar con
// teclado) y el logo tiene el nombre real de la marca como texto alternativo.
export const MarcasLogos = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSeleccionarMarca = (marca) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("marca", marca);
    setSearchParams(nextParams);
  };

  const handleVerTodos = () => {
    setSearchParams({ todos: "true" });
  };

  return (
    <div>
      <div className="marcas-header">
        <h1>Buscar por marca</h1>
        <p>Seleccione una marca para ver sus productos.</p>
      </div>

      <div className="grid-logo-marcas">
        <button type="button" className="marca-container todos-card" onClick={handleVerTodos}>
          <span className="todos-icon" aria-hidden="true">🛍️</span>
          <span className="todos-label">Todos los productos</span>
        </button>
        {MARCAS.map((m) => (
          <button
            key={m.nombre}
            type="button"
            className="marca-container todos-card"
            onClick={() => handleSeleccionarMarca(m.nombre)}
          >
            <img src={`/marcas/${m.logo}`} alt={m.nombre} className="logo-marca" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
};
export default MarcasLogos;
