import { apiUrl } from './axiosConfig';

// Imagen que se muestra cuando un producto no tiene foto o la foto no carga
export const PLACEHOLDER_PRODUCTO = '/placeholder-producto.svg';

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
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return PLACEHOLDER_PRODUCTO;
  }
  
  // Limpiar espacios en blanco al inicio y final
  imagePath = String(imagePath).trim();
  
  // Si ya es una URL completa (http/https), devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
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
