import axiosInstance from '../utils/axiosConfig.js';

export const getShippingOptions = ({ provincia, codigo_postal, localidad, peso, paquetes }) =>
    axiosInstance.get(`api/shipping/options`, {
        params: { provincia, codigo_postal, localidad, peso, paquetes },
        withCredentials: true,
    })
    .then((r) => r.data);