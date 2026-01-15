import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Configurar axios para enviar y recibir cookies
const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Esto permite enviar y recibir cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
axiosInstance.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default axiosInstance;
export { apiUrl };

