import React from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export const MarcasLogos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [paginaActual, setPaginaActual] = useState(1);


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

  const handleVerTodos = () => {
    setPaginaActual(1);
    setSearchParams({ todos: "true" });
  };
  return (
    <div>
      <h2>Buscar por marca</h2>
      <p>Seleccione una marca para ver sus productos.</p>

      <div className="grid-logo-marcas">
        <div className="marca-container todos-card" onClick={handleVerTodos}>
          <span className="todos-icon">🛍️</span>
          <p className="todos-label">Todos los productos</p>
        </div>
        {logos.map((logo, i) => (
          <div key={i} className="marca-container todos-card">
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
  );
};
export default MarcasLogos;
