import React, { useEffect, useState } from 'react';
import AccountMenuBar from '../../components/AccountMenuBar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Loader from '../../components/loader/Loader';
import { Package, XCircle, AlertTriangle } from 'lucide-react';

function OrderaPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Cancellation Modal State
    const [cancelModal, setCancelModal] = useState({ show: false, orderId: null });

    useEffect(() => {
        if (user === null) return navigate('/');
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/order/my-orders`, { withCredentials: true });
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.log("Error fetching orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/order/cancel/Odder`, { orderId: cancelModal.orderId }, { withCredentials: true });
            if (res.data.success) {
                fetchOrders(); // Refresh Data
                setCancelModal({ show: false, orderId: null });
            }
        } catch (error) {
            alert(error.response?.data?.message || "Cancellation failed");
        }
    };

    // Helper for Status Tracking Color
    const getStatusColor = (status, step) => {
        const flow = ["pending", "confirmed", "shipped", "delivered"];
        const currentIndex = flow.indexOf(status);
        const stepIndex = flow.indexOf(step);

        if (status === "cancelled") return "bg-red-500 border-red-500 text-white"; // Cancelled State
        
        if (currentIndex >= stepIndex) {
            // Active Colors
            if (step === "delivered") return "bg-green-600 border-green-600 text-white";
            if (step === "shipped") return "bg-purple-600 border-purple-600 text-white";
            return "bg-black border-black text-white"; 
        }
        return "bg-white border-gray-300 text-gray-400"; // Inactive
    };

    if (loading) return <div className="h-screen flex justify-center items-center"><Loader /></div>;

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <AccountMenuBar />
            
            <div className='w-full md:w-[75%] min-h-[100vh] p-5 md:p-10'>
                <h1 className='text-3xl md:text-4xl font-extrabold mb-8 uppercase tracking-tight'>My Purchases</h1>

                <div className="flex flex-col gap-6">
                    {orders.length === 0 && <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>}

                    {orders.map((order) => (
                        <div key={order._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-100 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Order ID</p>
                                    <p className="font-mono text-sm">{order._id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Date</p>
                                    <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Total Amount</p>
                                    <p className="text-lg font-bold">₹{order.totalAmount}</p>
                                </div>
                                <div className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border"
                                     style={{ 
                                         borderColor: order.orderStatus === 'cancelled' ? 'red' : order.orderStatus === 'delivered' ? 'green' : 'gray',
                                         color: order.orderStatus === 'cancelled' ? 'red' : order.orderStatus === 'delivered' ? 'green' : 'black' 
                                     }}
                                >
                                    {order.orderStatus}
                                </div>
                            </div>

                            {/* Tracking Bar (Only if not cancelled) */}
                            {order.orderStatus !== "cancelled" && (
                                <div className="px-4 py-6 md:px-10 border-b">
                                    <div className="relative flex justify-between items-center w-full">
                                        {/* Connecting Line */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>
                                        
                                        {["pending", "confirmed", "shipped", "delivered"].map((step, idx) => (
                                            <div key={idx} className="flex flex-col items-center gap-2 z-10 bg-white px-2">
                                                <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${getStatusColor(order.orderStatus, step)}`}>
                                                </div>
                                                <p className={`text-[10px] md:text-xs font-bold uppercase ${order.orderStatus === step ? "text-black scale-110" : "text-gray-400"}`}>
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order Items & Address */}
                            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
                                {/* Items */}
                                <div className="flex-1 flex flex-col gap-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                            <img src={item.productId?.imageUrl?.replace("http://","https://") || "https://via.placeholder.com/100"} className="w-20 h-24 object-cover rounded bg-gray-100" />
                                            <div>
                                                <h3 className="font-bold text-sm uppercase">{item.productId?.name || "Product"}</h3>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                <p className="text-sm font-medium mt-1">₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Address & Actions */}
                                <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-xs text-gray-400 uppercase mb-2">Delivery Address</h4>
                                        <p className="font-bold text-sm">{order.addressId?.fullName}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {order.addressId?.houseNo}, {order.addressId?.area}, <br/>
                                            {order.addressId?.city} - {order.addressId?.pincode}
                                        </p>
                                        <p className="text-xs font-bold mt-2">Ph: {order.addressId?.phone}</p>
                                    </div>

                                    {/* Cancel Button (Logic: Not Shipped/Delivered/Cancelled) */}
                                    {order.orderStatus !== "shipped" && order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && (
                                        <button 
                                            onClick={() => setCancelModal({ show: true, orderId: order._id })}
                                            className="mt-6 w-full border border-red-500 text-red-500 py-2 text-xs font-bold uppercase hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={14} /> Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- RED CANCEL CONFIRMATION POPUP --- */}
            {cancelModal.show && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg w-[90%] md:w-[400px] shadow-2xl border-t-4 border-red-600 animate-scale-up">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="bg-red-100 p-3 rounded-full">
                                <AlertTriangle className="text-red-600" size={32} />
                            </div>
                            <h2 className="text-xl font-bold uppercase text-gray-800">Cancel Order?</h2>
                            <p className="text-sm text-gray-600">
                                Are you sure you want to cancel this order? This action cannot be undone.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button 
                                onClick={() => setCancelModal({ show: false, orderId: null })}
                                className="py-3 font-bold uppercase bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                            >
                                No, Keep It
                            </button>
                            <button 
                                onClick={handleCancelOrder}
                                className="py-3 font-bold uppercase bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                                Yes, Cancel It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderaPage;