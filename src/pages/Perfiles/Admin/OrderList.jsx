import React from 'react';
import { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosConfig.js';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/orders');
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        }
        fetchOrders();
    }, [])

    return (
        <div className='admin-section'>
            <div>
                <p className='titulo-admin-section'>Lista de órdenes</p>
            </div>
            <div>
                {loading && <p>Cargando órdenes...</p>}
                {error && <p>Error al cargar las órdenes: {error.message}</p>}
                {!loading && !error && (
                    <table className="users-table">
                        <thead className="">
                            <tr>
                                <th className="">
                                    Orden ID
                                </th>
                                <th className="">
                                    Cliente
                                </th>
                                <th className="">
                                    Fecha
                                </th>
                                <th>
                                    Estado
                                </th>
                                <th>
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="">
                                    <td className="">
                                        {order._id}
                                    </td>

                                    <td className="">
                                        {order.user}
                                    </td>

                                    <td>
                                        {order.status}
                                    </td>

                                    <td className="">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>

                                    <td>
                                        $ {order.total}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                )}
            </div>
        </div>
    );
}

export default OrderList;