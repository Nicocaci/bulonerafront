import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Dejar que axios arme el Content-Type de los FormData (boundary incluido)
axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// ─── Sesión vencida (401) ────────────────────────────────
// AuthContext registra acá qué hacer cuando el backend rechaza el token.
let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// En estas rutas un error es del formulario, no una sesión vencida.
const RUTAS_DE_AUTENTICACION = [
  '/api/user/iniciarSesion',
  '/api/user/registro',
  '/api/user/cerrarSesion',
];

const enviabaToken = (config) => {
  const headers = config?.headers;
  if (!headers) return false;
  const valor =
    typeof headers.get === 'function'
      ? headers.get('Authorization')
      : headers.Authorization;
  return Boolean(valor);
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (
      status === 401 &&
      enviabaToken(error.config) &&
      !RUTAS_DE_AUTENTICACION.some((ruta) => url.includes(ruta)) &&
      typeof onUnauthorized === 'function'
    ) {
      onUnauthorized();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
export { apiUrl };