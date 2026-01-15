import { apiUrl } from './axiosConfig';

/**
 * Convierte una ruta de imagen del backend en una URL completa
 * @param {string} imagePath - Ruta de la imagen (puede ser relativa o absoluta)
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/vite.svg';
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

