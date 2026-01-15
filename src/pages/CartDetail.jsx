import React from 'react';
import '../css/CartDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const CartDetail = () => {
    const { cartId } = useParams();
    const navigate = useNavigate();
    const { getCartById, updateProductQuantity, error: cartError } = useCart();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingQuantities, setUpdatingQuantities] = useState({});

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getCartById(cartId); // 👈 USO CORRECTO
                console.log(data);
                setCart(data);
            } catch (error) {
                // El CartContext ya formatea el mensaje de error del backend
                setError(error.message || 'Error al cargar el carrito');
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [cartId]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error || cartError) {
        return (
            <div className='cart-detail-error'>
                Error: {error || cartError}
            </div>
        );
    }

    if (!cart || !cart.products) {
        return <div>No se encontró el carrito</div>;
    }

    const total = cart.products.reduce((acc, item) => {
        const price = item.product?.precio || item.product?.price || item.precio || item.price || 0;
        const quantity = item.quantity || item.cantidad || 1;
        return acc + price * quantity;
    }, 0);

    const handleQuantityChange = async (productId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);

        // Validar que la cantidad sea un número válido y mayor o igual a 0
        if (isNaN(quantity) || quantity < 0) {
            return;
        }

        setUpdatingQuantities(prev => ({ ...prev, [productId]: true }));

        try {
            const updatedCart = await updateProductQuantity(cartId, productId, quantity);
            setCart(updatedCart);
        } catch (error) {
            console.error('Error al actualizar la cantidad:', error);
            setError(error.message || 'Error al actualizar la cantidad');
        } finally {
            setUpdatingQuantities(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
        }
    };

    return (
        <div className='cart-detail-container'>
            <h1 className='cart-detail-title'>Mi Carrito</h1>
            <div className='cart-detail-products-list'>
                {cart.products.map((item) => (
                    <div key={item._id} className='cart-detail-products-list-item'>

                        <img
                            src={getImageUrl(
                                // Usar siempre la primera imagen disponible
                                Array.isArray(item.product.imagen)
                                    ? item.product.imagen[0]
                                    : (Array.isArray(item.product.imagenes)
                                        ? item.product.imagenes[0]
                                        : item.product.imagen)
                            )}
                            alt={item.product.item || 'Producto'}
                            className='cart-dropdown-image'
                            onError={(e) => {
                                const attemptedUrl = e.target.src;
                                console.error('❌ Error cargando imagen del producto:', {
                                    producto: item.product.item,
                                    rutaOriginal: item.product.imagen,
                                    urlIntentada: attemptedUrl,
                                    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000'
                                });
                                e.target.src = '/vite.svg'
                            }}
                        />

                        <h3 className='cart-detail-products-list-title'>
                            {item.product?.item}
                        </h3>

                        <p className="cart-detail-price">
                            Precio: ${item.product?.precio}
                        </p>

                        <div className="cart-detail-quantity">
                            <label htmlFor={`quantity-${item.product?._id || item._id}`}>
                                Cantidad:
                            </label>
                            <input
                                type="number"
                                id={`quantity-${item.product?._id || item._id}`}
                                min="0"
                                value={item.quantity || item.cantidad || 1}
                                onChange={(e) => handleQuantityChange(
                                    item.product?._id || item.product?.id || item._id,
                                    e.target.value
                                )}
                                disabled={updatingQuantities[item.product?._id || item.product?.id || item._id]}
                                className="cart-detail-quantity-input"
                            />
                        </div>

                    </div>
                ))}
            </div>
            <div className='cart-detail-total'>
                <button
                    className='cart-detail-checkout'
                    onClick={() => navigate(`/checkout/${cartId}`)}
                >
                    Finalizar compra
                </button>
                <span className='cart-detail-total-text'>Total: ${total.toFixed(2)}</span>
            </div>
        </div>
    )
}

export default CartDetail;