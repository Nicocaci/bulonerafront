import { useState, useCallback } from 'react';
import { getShippingOptions } from '../utils/shipping.js';


export function useShippingOptions() {
    const [options, setOptions ] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ error, setError ] = useState(null);

    const fetchOptions = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getShippingOptions(params);
            setOptions(data);
        } catch (err) {
            setError("No pudimos calcular las opciones de envío. Revisa el código postal");
            setOptions([]);
        } finally {
            setLoading(false);
        }
        },[] );

    return { options, loading, error, fetchOptions };
}
