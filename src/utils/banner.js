// Imagen promocional del banner de la Home (Fase 7).
// Lo usan los dos lados, así la imagen que se precarga es siempre la misma que se muestra:
// - Home.jsx arma el <img> con src, srcset y sizes.
// - server.js escribe en el HTML de "/" un <link rel="preload"> con los mismos valores,
//   para que el navegador la empiece a bajar apenas llega el HTML.
// Sin dependencias del navegador ni de Vite: tiene que poder correr en Node.
// Para cambiar el banner alcanza con cambiar este archivo.
//
// Promo actual: Set destornillador con criquet Ronix RH-2715 ($22.000).
// Las imágenes están en public/banner/ en WebP, una por ancho: <nombre>-<ancho>.webp.
// Para una promo nueva: subir los archivos con otro nombre (así ningún navegador muestra
// la vieja guardada en caché) y cambiar "nombre", "alt" y "href".

export const BANNER = {
  nombre: "promo-set-criquet-v3",
  alt: "Set destornillador con criquet Ronix RH-2715 de 24 piezas, precio oferta $22.000, envío a todo el país",
  href: "/producto/6aea346caacd50db3d66d795",
  // Proporción de la imagen (para width/height del <img> y evitar saltos de layout)
  ancho: 1120,
  alto: 1050,
  // Anchos que se le ofrecen al navegador: elige el más chico que alcance para la pantalla
  // (la columna de desktop toma 600 u 1200 según la pantalla; un celular, 800 o 1200)
  anchos: [400, 600, 800, 1200, 1680],
  anchoPorDefecto: 600,
  sizes: "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 560px",
};

const urlBanner = (ancho) => `/banner/${BANNER.nombre}-${ancho}.webp`;

export const bannerSrc = urlBanner(BANNER.anchoPorDefecto);
export const bannerSrcSet = BANNER.anchos.map((a) => `${urlBanner(a)} ${a}w`).join(", ");
