import axiosInstance from './axiosConfig.js';

export const getShippingOptions = ({ provincia, codigo_postal, localidad, peso, paquetes }) =>
    axiosInstance
        .get('/api/shipping/options', {
            params: { provincia, codigo_postal, localidad, peso, paquetes },
        })
        .then((r) => r.data);