import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Confirmar = ({
    formData,
    cart,
    total,
    confirmAccepted,
    onToggleConfirm,
    errors
}) => {

    const [preferenceId, setPreferenceId] = useState(null);
    const [loading, setLoading] = useState(false);

    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

    // Inicializar Mercado Pago
    useEffect(() => {
        if (!publicKey) {
            console.error('Falta la public key de Mercado Pago');
            return;
        }

        initMercadoPago(publicKey, { locale: 'es-AR' });
    }, [publicKey]);

    // Crear preference en el backend
    const createPreferenceIdFromApi = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/mp/create_order`,
                {
                    cart,
                    payer: {
                        name: formData.nombre,
                        surname: formData.apellido,
                        email: formData.email
                    }
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            // 👇 USAMOS SANDBOX
            const sandboxInitPoint = response.data.sandbox_init_point;

            window.location.href = sandboxInitPoint;
        } catch (error) {
            console.error('Error creando la preference de MP', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-step-content">
            <h2>Confirmación</h2>

            {/* RESUMEN */}
            <div className="checkout-summary">

                {/* DATOS CLIENTE */}
                <div className="checkout-summary-section">
                    <h3>Datos del Cliente</h3>
                    <p><strong>Nombre:</strong> {formData.nombre} {formData.apellido}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Teléfono:</strong> {formData.telefono}</p>
                </div>

                {/* DIRECCIÓN */}
                <div className="checkout-summary-section">
                    <h3>Dirección de Envío</h3>
                    <p>{formData.direccion}</p>
                    <p>{formData.ciudad}, CP {formData.codigoPostal}</p>
                </div>

                {/* MÉTODO DE PAGO */}
                <div className="checkout-summary-section">
                    <h3>Método de Pago</h3>
                    <p>
                        {formData.metodoPago === 'efectivo'
                            ? 'Efectivo'
                            : formData.metodoPago === 'transferencia'
                                ? 'Transferencia Bancaria'
                                : 'Mercado Pago'}
                    </p>
                </div>

                {/* PRODUCTOS */}
                <div className="checkout-summary-section">
                    <h3>Productos</h3>
                    <div className="checkout-products-list">
                        {cart.products.map((item) => {
                            const price = item.product?.precioConIva || item.product?.price || item.precio || item.price || 0;
                            const quantity = item.quantity || item.cantidad || 1;

                            return (
                                <div key={item._id} className="checkout-product-item">
                                    <div className="checkout-product-info">
                                        <span className="checkout-product-name">{item.product?.item}</span>
                                        <span className="checkout-product-quantity">x{quantity}</span>
                                    </div>
                                    <span className="checkout-product-price">
                                        ${(price * quantity).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TOTAL */}
                <div className="checkout-summary-total">
                    <h3>Total: ${total.toFixed(2)}</h3>
                </div>

                {/* CONFIRMACIÓN */}
                <div className="checkout-confirm-accept">
                    <label>
                        <input
                            type="checkbox"
                            checked={confirmAccepted}
                            onChange={onToggleConfirm}
                        />{' '}
                        Confirmo que los datos son correctos y deseo realizar la compra
                    </label>

                    {errors?.confirm && (
                        <div className="checkout-error" style={{ marginTop: '8px' }}>
                            {errors.confirm}
                        </div>
                    )}
                </div>

                {/* BOTÓN MERCADO PAGO */}
                {formData.metodoPago === 'MercadoPago' && confirmAccepted && (
                    <div style={{ marginTop: '20px' }}>
                        {!preferenceId && (
                            <button
                                onClick={createPreferenceIdFromApi}
                                disabled={loading}
                                className="btn-mp"
                            >
                                {loading ? 'Generando pago...' : 'Pagar con Mercado Pago'}
                            </button>
                        )}

                        {preferenceId && (
                            <Wallet
                                initialization={{ preferenceId }}
                                customization={{
                                    texts: { valueProp: 'smart_option' }
                                }}
                            />
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Confirmar;
