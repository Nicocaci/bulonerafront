# Configuración de Webhook

Este proyecto incluye un sistema de webhooks que se ejecuta automáticamente cuando una compra se completa exitosamente.

## ¿Qué es un Webhook?

Un webhook es una forma de notificar a servicios externos cuando ocurre un evento importante en tu aplicación. En este caso, cuando un usuario completa una compra, se envía una notificación a una URL configurada.

## Configuración

### Variables de Entorno

Para habilitar los webhooks, necesitas configurar las siguientes variables de entorno en tu archivo `.env`:

```env
# URL del endpoint que recibirá las notificaciones del webhook
VITE_WEBHOOK_URL=https://tu-servicio.com/webhook

# (Opcional) Secret para autenticación del webhook
VITE_WEBHOOK_SECRET=tu-secreto-seguro-aqui
```

### Ejemplo de archivo `.env`

```env
VITE_API_URL=http://localhost:3000
VITE_WEBHOOK_URL=https://api.example.com/webhooks/orders
VITE_WEBHOOK_SECRET=mi-secreto-super-seguro-123
```

## Formato del Payload

Cuando se completa una compra, el webhook envía un payload con la siguiente estructura:

```json
{
  "event": "order.completed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "products": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "name": "Producto Ejemplo",
        "quantity": 2,
        "price": 150.00
      }
    ],
    "total": 300.00,
    "status": "pendiente",
    "customer": {
      "name": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com",
      "phone": "+54 11 1234-5678"
    },
    "shipping": {
      "address": "Av. Corrientes 1234",
      "city": "Buenos Aires",
      "postalCode": "1043"
    },
    "payment": {
      "method": "efectivo"
    },
    "notes": "Entregar por la mañana"
  }
}
```

## Servicios de Webhook Recomendados

Puedes usar varios servicios para recibir webhooks:

### 1. **Zapier**
- URL: Configura un webhook en Zapier y usa la URL proporcionada
- Ventaja: Fácil integración con múltiples servicios (email, Slack, Google Sheets, etc.)

### 2. **Make (Integromat)**
- Similar a Zapier, permite automatizar flujos de trabajo

### 3. **Webhook.site**
- Útil para testing: https://webhook.site
- Te da una URL temporal para probar webhooks

### 4. **Tu propio servidor**
- Crea un endpoint en tu backend que reciba POST requests
- Ejemplo con Express.js:
```javascript
app.post('/webhooks/orders', (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'order.completed') {
    // Procesar la orden
    console.log('Nueva orden:', data);
    // Enviar email, actualizar base de datos, etc.
  }
  
  res.status(200).json({ received: true });
});
```

## Seguridad

Si configuraste `VITE_WEBHOOK_SECRET`, el webhook incluirá un header `X-Webhook-Secret` en la petición. Asegúrate de validar este secret en tu endpoint:

```javascript
app.post('/webhooks/orders', (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  const expectedSecret = process.env.WEBHOOK_SECRET;
  
  if (secret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Procesar webhook...
});
```

## Testing

Para probar el webhook sin hacer una compra real, puedes usar la función directamente en la consola del navegador:

```javascript
import { sendOrderWebhook } from './utils/webhookService';

sendOrderWebhook({
  orderId: 'test-123',
  userId: 'user-456',
  products: [{ productId: 'prod-789', name: 'Test', quantity: 1, price: 100 }],
  total: 100,
  status: 'pendiente',
  customerInfo: { nombre: 'Test', apellido: 'User', email: 'test@test.com' },
  shippingInfo: { direccion: 'Test 123', ciudad: 'Buenos Aires', codigoPostal: '1000' },
  paymentMethod: 'efectivo'
});
```

## Desactivar Webhooks

Si no quieres usar webhooks, simplemente no configures `VITE_WEBHOOK_URL` o déjalo vacío. El sistema funcionará normalmente sin enviar webhooks.

## Solución de Problemas

### El webhook no se envía
1. Verifica que `VITE_WEBHOOK_URL` esté configurado correctamente
2. Revisa la consola del navegador para ver errores
3. Asegúrate de que la URL sea accesible públicamente (si estás en desarrollo local, usa un servicio como ngrok)

### Error CORS
Si recibes errores CORS, asegúrate de que tu servidor de webhook permita requests desde tu dominio.

### El webhook se envía pero no llega
1. Verifica que la URL sea correcta
2. Revisa los logs de tu servidor de webhook
3. Usa herramientas como webhook.site para verificar que las peticiones se están enviando

