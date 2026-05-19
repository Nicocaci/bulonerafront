import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import axiosInstance from '../utils/axiosConfig';
import '../css/Checkout.css';
import Datos from './checkout/Datos';
import Pago from './checkout/Pago';
import Envio from './checkout/Envio';
import Confirmar from './checkout/Confirmar';

const Checkout = () => {
    const { cartId } = useParams();
    const navigate = useNavigate();
    const { getCartById, clearCart } = useCart();
    const { user } = useContext(AuthContext);
    
    const buildHeaders = () => {
        const headers = {};
        if (user?.token) {
            headers.Authorization = `Bearer ${user.token}`;
        }
        return headers;
    };
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    
    // Datos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        codigoPostal: '',
        metodoPago: 'efectivo', // efectivo, transferencia, tarjeta
        notas: '',
    });

    const [errors, setErrors] = useState({});
    const [confirmAccepted, setConfirmAccepted] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                const data = await getCartById(cartId);
                setCart(data);
                
                // Pre-llenar datos del usuario si está autenticado
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        email: user.email || prev.email,
                        nombre: user.nombre || user.name || prev.nombre,
                        apellido: user.apellido || prev.apellido,
                    }));
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar el carrito',
                });
                navigate(`/carrito/${cartId}`);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [cartId, getCartById, navigate, user]);

    const validateStep = (step) => {
        const newErrors = {};

        // Paso 1: Datos personales
        if (step === 1) {
            if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
            if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
            if (!formData.email.trim()) {
                newErrors.email = 'El email es requerido';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'El email no es válido';
            }
            if (!formData.telefono.trim()) {
                newErrors.telefono = 'El teléfono es requerido';
            } else if (!/^[0-9+\-\s()]+$/.test(formData.telefono)) {
                newErrors.telefono = 'El teléfono no es válido';
            }
        }

        // Paso 2: Pago
        if (step === 2) {
            if (!formData.metodoPago) newErrors.metodoPago = 'El método de pago es requerido';

            if (formData.metodoPago === 'tarjeta') {
                if (!formData.cardNumber.trim() || !/^[0-9\s]{13,19}$/.test(formData.cardNumber)) {
                    newErrors.cardNumber = 'Número de tarjeta inválido';
                }
                if (!formData.cardExpiry.trim() || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.cardExpiry)) {
                    newErrors.cardExpiry = 'Fecha inválida (MM/AA)';
                }
                if (!formData.cardCvc.trim() || !/^[0-9]{3,4}$/.test(formData.cardCvc)) {
                    newErrors.cardCvc = 'CVC inválido';
                }
            }
        }

        // Paso 3: Envío
        if (step === 3) {
            if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
            if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
            if (!formData.codigoPostal.trim()) {
                newErrors.codigoPostal = 'El código postal es requerido';
            } else if (!/^[0-9]+$/.test(formData.codigoPostal)) {
                newErrors.codigoPostal = 'El código postal debe contener solo números';
            }
        }

        // Paso 4: Confirmación
        if (step === 4) {
            if (!confirmAccepted) newErrors.confirm = 'Debes confirmar para continuar';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }; 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Si se toca algo, forzamos que vuelva a confirmar antes de enviar
        if (confirmAccepted) setConfirmAccepted(false);
    }; 

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const calculateTotal = () => {
        if (!cart || !cart.products) return 0;
        return cart.products.reduce((acc, item) => {
            const price = item.product?.precioConIva || item.product?.price || item.precioConIva || item.price || 0;
            const quantity = item.quantity || item.cantidad || 1;
            return acc + price * quantity;
        }, 0);
    };

    const handleSubmit = async () => {
        // Validar todos los pasos antes de enviar. Si falla uno, ir a ese paso.
        if (!validateStep(1)) { setCurrentStep(1); return; }
        if (!validateStep(2)) { setCurrentStep(2); return; }
        if (!validateStep(3)) { setCurrentStep(3); return; }
        if (!validateStep(4)) { setCurrentStep(4); return; }

        if (!user?.id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debes estar autenticado para realizar una compra.',
                confirmButtonColor: '#d33',
            });
            return;
        }

        setProcessing(true);

        try {
            // Preparar los productos en el formato que espera el backend
            const products = cart.products.map(item => {
                const productId = item.product?._id || item.product?.id || item.product;
                const quantity = item.quantity || item.cantidad || 1;
                
                if (!productId) {
                    throw new Error('Producto sin ID válido');
                }
                
                return {
                    product: productId,
                    quantity: quantity
                };
            });

            const orderData = {
                user: user.id,
                products: products,
                total: calculateTotal(),
                status: 'pendiente' // El backend lo establece por defecto, pero lo enviamos explícitamente
            };

            const response = await axiosInstance.post('/api/orders', orderData, {
                headers: buildHeaders(),
            });

            // Vaciar el carrito después de una compra exitosa
            try {
                await clearCart();
            } catch (clearError) {
                console.error('Error al vaciar el carrito:', clearError);
                // No bloqueamos el flujo si falla el clearCart, solo lo registramos
            }

            await Swal.fire({
                icon: 'success',
                title: '¡Compra realizada!',
                text: 'Tu pedido ha sido procesado correctamente.',
                confirmButtonColor: '#108202',
            });

            // Redirigir a la página de agradecimiento
            navigate('/gracias');
        } catch (error) {
            console.error('Error al procesar el pedido:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo procesar el pedido. Por favor, intenta nuevamente.',
                confirmButtonColor: '#d33',
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="checkout-loading">
                <div className="checkout-spinner"></div>
                <p>Cargando información del carrito...</p>
            </div>
        );
    }

    if (!cart || !cart.products || cart.products.length === 0) {
        return (
            <div className="checkout-empty">
                <h2>Tu carrito está vacío</h2>
                <button onClick={() => navigate('/productos')} className="checkout-btn-primary">
                    Ver productos
                </button>
            </div>
        );
    }

    const total = calculateTotal();

    return (
        <div className="checkout-container">
            <h1 className="checkout-title">Finalizar Compra</h1>
            
            {/* Indicador de pasos */}
            <div className="checkout-steps">
                <div className={`checkout-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <div className="checkout-step-number">1</div>
                    <div className="checkout-step-label">Datos</div>
                </div>
                <div className={`checkout-step-line ${currentStep > 1 ? 'completed' : ''}`}></div>

                <div className={`checkout-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <div className="checkout-step-number">2</div>
                    <div className="checkout-step-label">Pago</div>
                </div>
                <div className={`checkout-step-line ${currentStep > 2 ? 'completed' : ''}`}></div>

                <div className={`checkout-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                    <div className="checkout-step-number">3</div>
                    <div className="checkout-step-label">Envío</div>
                </div>
                <div className={`checkout-step-line ${currentStep > 3 ? 'completed' : ''}`}></div>

                <div className={`checkout-step ${currentStep >= 4 ? 'active' : ''}`}>
                    <div className="checkout-step-number">4</div>
                    <div className="checkout-step-label">Confirmar</div>
                </div>
            </div>

            {/* Contenido del formulario */}
            <div className="checkout-content">
                {currentStep === 1 && (
                    <Datos formData={formData} errors={errors} onChange={handleInputChange} />
                )}

                {currentStep === 2 && (
                    <Pago formData={formData} errors={errors} onChange={handleInputChange} />
                )}

                {currentStep === 3 && (
                    <Envio formData={formData} errors={errors} onChange={handleInputChange} />
                )}

                {currentStep === 4 && (
                    <Confirmar
                        formData={formData}
                        cart={cart}
                        total={total}
                        confirmAccepted={confirmAccepted}
                        onToggleConfirm={() => setConfirmAccepted(prev => !prev)}
                        errors={errors}
                    />
                )}

                {/* Botones de navegación */}
                <div className="checkout-actions">
                    {currentStep > 1 && (
                        <button 
                            type="button" 
                            onClick={() => { setConfirmAccepted(false); handleBack(); }} 
                            className="checkout-btn-secondary"
                            disabled={processing}
                        >
                            Atrás
                        </button>
                    )}
                    {currentStep < 4 ? (
                        <button 
                            type="button" 
                            onClick={handleNext} 
                            className="checkout-btn-primary"
                        >
                            Continuar
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            className="checkout-btn-primary checkout-btn-submit"
                            disabled={processing || !confirmAccepted}
                        >
                            {processing ? 'Procesando...' : 'Confirmar Pedido'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;

