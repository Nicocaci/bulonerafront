// Cargador de la marca: el triángulo del logo en gris que se llena de rojo mientras carga.
// Es SVG + CSS (sin librerías); los estilos están en css/Cargador.css.
//
// Tamaños:
//   "pantalla" (72 px): página completa o bloque grande (detalle, carrito, checkout, rutas).
//   "bloque"   (32 px): bloques del panel admin y de Mi cuenta.
//   "chico"    (24 px): menús desplegables.
//
// Aparece recién a los 300 ms (`demora`): si los datos llegan antes, no se ve nunca.
// Para lectores de pantalla anuncia `texto` (role="status"). Si ya está dentro de otra
// región que anuncia (por ejemplo la tarjeta de /gracias), pasar `anunciar={false}`.
// `className` suma clases al contenedor (sirve para reservar el alto de la pantalla).

// Trazos tomados de public/logo-fondo-blanco.svg (mismo dibujo que el logo).
const TRIANGULO =
  "M409.91,243.3l-241.03,454.9h482l-240.97-454.9ZM472.77,633.41c-1.38,2.29-3.39,4.2-5.93,5.53-2.54,1.34-5.4,2.1-8.25,2.1h-97.57c-2.96,0-5.82-.76-8.36-2.1-2.43-1.34-4.55-3.24-5.93-5.53l-49.1-80.92c-1.38-2.19-2.12-4.68-2.12-7.06s.74-4.96,2.12-7.16l49.1-80.92c1.38-2.29,3.39-4.2,5.93-5.53,2.54-1.34,5.4-2.1,8.36-2.1h97.57c2.86,0,5.72.76,8.25,2.1s4.55,3.24,5.93,5.53l49.21,80.92c1.27,2.19,2.01,4.68,2.01,7.16s-.74,4.87-2.01,7.06l-49.21,80.92Z";
const TRIANGULO_INTERIOR = "M410.39,489.93l-46.05,93.18h92.08s-46.03-93.18-46.03-93.18Z";
const BARRA = "654.24 719.91 165.51 719.91 145.75 754.15 674.01 754.15 654.24 719.91";
const VIEWBOX = "140 238 540 522";

const Cargador = ({
  tamano = "pantalla",
  texto = "Cargando…",
  anunciar = true,
  demora = 300,
  className = "",
}) => {
  const clases = ["cargador", `cargador--${tamano}`, className].filter(Boolean).join(" ");
  const estilo = demora === 300 ? undefined : { "--cargador-demora": `${demora}ms` };

  return (
    <div
      className={clases}
      style={estilo}
      role={anunciar ? "status" : undefined}
      aria-live={anunciar ? "polite" : undefined}
    >
      <span className="cargador__icono" aria-hidden="true">
        <svg viewBox={VIEWBOX} focusable="false">
          <path className="cargador__base" d={TRIANGULO} />
          <path className="cargador__tinta" d={TRIANGULO_INTERIOR} />
          <polygon className="cargador__tinta" points={BARRA} />
        </svg>
        <span className="cargador__relleno">
          <svg viewBox={VIEWBOX} focusable="false">
            <path className="cargador__rojo" d={TRIANGULO} />
          </svg>
        </span>
      </span>
      {anunciar && <span className="solo-lectores">{texto}</span>}
    </div>
  );
};

export default Cargador;
