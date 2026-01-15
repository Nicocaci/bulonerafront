import axiosInstance from './axiosConfig';

/**
 * Servicio de webhook para notificar eventos importantes
 * Configura la URL del webhook mediante la variable de entorno VITE_WEBHOOK_URL
 */

/**
 * Envía un webhook con los datos de una orden completada
 * @param {Object} orderData - Datos de la orden
 * @param {string} orderData.orderId - ID de la orden
 * @param {string} orderData.userId - ID del usuario
 * @param {Array} orderData.products - Array de productos
 * @param {number} orderData.total - Total de la orden
 * @param {string} orderData.status - Estado de la orden
 * @param {Object} orderData.customerInfo - Información del cliente
 * @param {Object} orderData.shippingInfo - Información de envío
 * @param {string} orderData.paymentMethod - Método de pago
 * @returns {Promise<Object>} Respuesta del webhook
 */
export const sendOrderWebhook = async (orderData) => {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    
    // Si no hay URL configurada, no hacer nada (modo silencioso)
    if (!webhookUrl) {
        console.log('Webhook URL no configurada. Omitiendo envío de webhook.');
        return null;
    }

    try {
        const payload = {
            event: 'order.completed',
            timestamp: new Date().toISOString(),
            data: {
                orderId: orderData.orderId,
                userId: orderData.userId,
                products: orderData.products,
                total: orderData.total,
                status: orderData.status,
                customer: {
                    name: orderData.customerInfo?.nombre || orderData.customerInfo?.name,
                    lastName: orderData.customerInfo?.apellido || orderData.customerInfo?.lastName,
                    email: orderData.customerInfo?.email,
                    phone: orderData.customerInfo?.telefono || orderData.customerInfo?.phone,
                },
                shipping: {
                    address: orderData.shippingInfo?.direccion || orderData.shippingInfo?.address,
                    city: orderData.shippingInfo?.ciudad || orderData.shippingInfo?.city,
                    postalCode: orderData.shippingInfo?.codigoPostal || orderData.shippingInfo?.postalCode,
                },
                payment: {
                    method: orderData.paymentMethod,
                },
                notes: orderData.notes || '',
            }
        };

        // Intentar enviar el webhook
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Opcional: agregar un header de autenticación si es necesario
                ...(import.meta.env.VITE_WEBHOOK_SECRET && {
                    'X-Webhook-Secret': import.meta.env.VITE_WEBHOOK_SECRET
                })
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Webhook falló con status: ${response.status}`);
        }

        const result = await response.json().catch(() => ({}));
        console.log('Webhook enviado exitosamente:', result);
        return result;

    } catch (error) {
        // No lanzar el error para no interrumpir el flujo de compra
        console.error('Error al enviar webhook:', error);
        return null;
    }
};

/**
 * Envía un webhook genérico con datos personalizados
 * @param {string} event - Nombre del evento
 * @param {Object} data - Datos a enviar
 * @param {string} customUrl - URL personalizada (opcional, usa VITE_WEBHOOK_URL por defecto)
 * @returns {Promise<Object>} Respuesta del webhook
 */
export const sendCustomWebhook = async (event, data, customUrl = null) => {
    const webhookUrl = customUrl || import.meta.env.VITE_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.log('Webhook URL no configurada. Omitiendo envío de webhook.');
        return null;
    }

    try {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(import.meta.env.VITE_WEBHOOK_SECRET && {
                    'X-Webhook-Secret': import.meta.env.VITE_WEBHOOK_SECRET
                })
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Webhook falló con status: ${response.status}`);
        }

        const result = await response.json().catch(() => ({}));
        console.log('Webhook enviado exitosamente:', result);
        return result;

    } catch (error) {
        console.error('Error al enviar webhook:', error);
        return null;
    }
};

