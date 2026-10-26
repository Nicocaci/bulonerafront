import { apiUrl } from './axiosConfig';

// Imagen que se muestra cuando un producto no tiene foto o la foto no carga
export const PLACEHOLDER_PRODUCTO = '/placeholder-producto.svg';

// Imágenes de Cloudinary: se pide el ancho que se va a mostrar, en el formato más liviano
// que acepte el navegador (WebP/AVIF) y con calidad automática. Solo cambia la URL con la
// que se muestra; la URL guardada en la base no se toca.
// "c_limit" evita agrandar fotos más chicas que el ancho pedido.
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
const YA_TRANSFORMADA = /^[a-z]{1,3}_[^/]*\//; // ej.: "w_300/..." o "f_auto,q_auto/..."

export const cldUrl = (url, ancho) => {
  const m = typeof url === 'string' && ancho ? url.match(CLOUDINARY_UPLOAD) : null;
  if (!m || YA_TRANSFORMADA.test(m[2])) return url;
  return `${m[1]}f_auto,q_auto,c_limit,w_${Math.round(ancho)}/${m[2]}`;
};

// Tarjetas de producto (catálogo y carruseles): ~300px de ancho en desktop,
// media pantalla en mobile
export const ANCHO_TARJETA = 300;
export const SIZES_TARJETA = '(max-width: 768px) 50vw, 300px';
// Miniaturas del carrito, checkout y buscador (hasta 80px en pantalla)
export const ANCHO_MINIATURA = 160;
// Foto principal del detalle (también la usa la lupa de desktop, que amplía 2,5x)
export const ANCHO_DETALLE = 1400;

// srcset con el ancho pedido y el doble (pantallas de alta densidad).
// Devuelve undefined si la imagen no es de Cloudinary (el <img> usa solo src).
export const cldSrcSet = (url, ancho) => {
  if (cldUrl(url, ancho) === url) return undefined;
  return `${cldUrl(url, ancho)} ${ancho}w, ${cldUrl(url, ancho * 2)} ${ancho * 2}w`;
};

// Para usar en onError de un <img>: pone el placeholder una sola vez
// (si el placeholder también fallara, no entra en un bucle).
export const usarPlaceholder = (event) => {
  const img = event.currentTarget;
  if (img.dataset.placeholder) return;
  img.dataset.placeholder = '1';
  img.src = PLACEHOLDER_PRODUCTO;
};

/**
 * Convierte una ruta de imagen del backend en una URL completa
 * @param {string} imagePath - Ruta de la imagen (puede ser relativa o absoluta)
 * @param {number} [ancho] - Ancho en px con que se muestra (solo afecta a imágenes de Cloudinary)
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imagePath, ancho) => {
  if (!imagePath) {
    return PLACEHOLDER_PRODUCTO;
  }
  
  // Limpiar espacios en blanco al inicio y final
  imagePath = String(imagePath).trim();
  
  // Si ya es una URL completa (http/https), devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return cldUrl(imagePath, ancho);
  }
  
  let finalUrl;
  
  // Si empieza con /uploads/, es una ruta absoluta correcta
  if (imagePath.startsWith('/uploads/')) {
    finalUrl = `${apiUrl}${imagePath}`;
    return finalUrl;
  }
  
  // Si empieza con / pero no es /uploads/, puede ser otra ruta del servidor
  if (imagePath.startsWith('/')) {
    finalUrl = `${apiUrl}${imagePath}`;
    return finalUrl;
  }
  
  // Si empieza con "uploads/" (sin / inicial), agregar el / al inicio
  if (imagePath.startsWith('uploads/')) {
    finalUrl = `${apiUrl}/${imagePath}`;
    return finalUrl;
  }
  
  // Si no tiene prefijo, asumimos que es solo el nombre del archivo
  // Multer guarda archivos con nombres únicos como "timestamp-random.ext"
  // Los colocamos en /uploads/
  finalUrl = `${apiUrl}/uploads/${imagePath}`
  return finalUrl;
};
