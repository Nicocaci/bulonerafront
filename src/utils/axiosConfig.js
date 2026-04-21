import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// 👇 CLAVE: dejar que axios maneje headers automáticamente
axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default axiosInstance;
export { apiUrl };