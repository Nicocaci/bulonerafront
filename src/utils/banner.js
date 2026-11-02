// Imagen promocional del banner de la Home (Fase 7).
// Lo usan los dos lados, así la imagen que se precarga es siempre la misma que se muestra:
// - Home.jsx arma el <img> con src, srcset y sizes.
// - server.js escribe en el HTML de "/" un <link rel="preload"> con los mismos valores,
//   para que el navegador la empiece a bajar apenas llega el HTML.
// Sin dependencias del navegador ni de Vite: tiene que poder correr en Node.
// Para cambiar el banner alcanza con cambiar este archivo.

const CLOUDINARY = "https://res.cloudinary.com/dn4lt8fhc/image/upload";

export const BANNER = {
  archivo: "v1790002161/promo-1.png",
  alt: "Combo Ronix: amoladora 115 mm 800 W y taladro 13 mm 750 W, precio final $149.000",
  href: "/productos?page=1&marca=Ronix&search=kit",
  // Tamaño original de la imagen (para width/height del <img> y evitar saltos de layout)
  ancho: 429,
  alto: 402,
  // Anchos que se le ofrecen al navegador: elige el más chico que alcance para la pantalla
  // (un celular común toma 800 en lugar de 1200; la columna de desktop, 600)
  anchos: [400, 600, 800, 1200],
  anchoPorDefecto: 600,
  sizes: "(max-width: 900px) 100vw, 560px",
};

// Formato más liviano que acepte el navegador, calidad automática y sin agrandar
const urlBanner = (ancho) => `${CLOUDINARY}/f_auto,q_auto,c_limit,w_${ancho}/${BANNER.archivo}`;

export const bannerSrc = urlBanner(BANNER.anchoPorDefecto);
export const bannerSrcSet = BANNER.anchos.map((a) => `${urlBanner(a)} ${a}w`).join(", ");
