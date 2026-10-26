import { useState, useCallback, useRef } from 'react';
import { getShippingOptions } from '../utils/shipping.js';

export function useShippingOptions() {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Si el cliente cambia el código postal mientras una cotización está en curso,
    // solo vale la respuesta del último pedido (las anteriores se descartan).
    const ultimoPedido = useRef(0);

    const fetchOptions = useCallback(async (params) => {
        const pedido = ++ultimoPedido.current;
        setLoading(true);
        setError(null);
        try {
            const data = await getShippingOptions(params);
            if (pedido !== ultimoPedido.current) return;
            setOptions(Array.isArray(data) ? data : []);
        } catch {
            if (pedido !== ultimoPedido.current) return;
            setError("No pudimos calcular las opciones de envío. Revisá el código postal.");
            setOptions([]);
        } finally {
            if (pedido === ultimoPedido.current) setLoading(false);
        }
    }, []);

    return { options, loading, error, fetchOptions };
}
