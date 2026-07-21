import React from "react";
import "../css/BrandSlider.css";

const logo = [
  "ronixlogo.png",
  "logo-crossmaster.png",
  "logo-bahco.svg",
  "logo-bremen.svg",
  "logo-bosch.svg",
  "logo-skil.png",
  "logo-fischer.webp",
  "logo-venturo.jpg",
];
const BrandSlider = () => {
  // Duplicar los logos suficientes veces para crear un slider infinito continuo
  // La animación se moverá exactamente la mitad del track, creando un loop perfecto
  const duplicatedLogos = [
    ...logo,
    ...logo,
    ...logo,
    ...logo,
    ...logo,
    ...logo,
    ...logo,
    ...logo,
    ...logo,
    ...logo,
    ...logo,
    ...logo,
  ];

  return (
    <div className="slider-container">
      <div className="slider">
        <div className="slide-track">
          {duplicatedLogos.map((logoName, i) => (
            <div className="slide" key={i}>
              <img
                src={`marcas/${logoName}`}
                alt={`Logo ${logoName}`}
                onError={(e) => {
                  // Si .png no funciona, intentar otras extensiones
                  const extensions = [".webp", ".jpg", ".jpeg", ".svg"];
                  let currentExt = 0;
                  const tryNext = () => {
                    if (currentExt < extensions.length) {
                      e.target.src = `/${logoName}${extensions[currentExt]}`;
                      currentExt++;
                    }
                  };
                  tryNext();
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSlider;
