import React, { useEffect, useState, useRef } from 'react';
import AccountMenuBar from '../../components/AccountMenuBar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Loader from '../../components/loader/Loader';
import { ChevronLeft, ArrowRight, XCircle, AlertTriangle, Printer, Package } from 'lucide-react';
import { BASE_URL } from '../../api/baseUrl';

function OrderaPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Data States
    const [orders, setOrders] = useState([]); 
    const [flattenedProducts, setFlattenedProducts] = useState([]);
    
    // View States
    const [loading, setLoading] = useState(true); // Only for initial load
    const [selectedItem, setSelectedItem] = useState(null);
    const [cancelModal, setCancelModal] = useState({ show: false, orderId: null });

    // --- HELPER: SAFE IMAGE URL ---
    const getSafeImageUrl = (prod) => {
        if (!prod) return "https://via.placeholder.com/150?text=No+Image";
        try {
            const img = (prod.images && prod.images.length > 0) ? prod.images[0] : prod.imageUrl;
            if (typeof img === 'object') return (img.url || img.secure_url || "").replace("http://", "https://");
            if (typeof img === 'string') return img.replace("http://", "https://");
            return "https://via.placeholder.com/150?text=No+Image";
        } catch (err) {
            return "https://via.placeholder.com/150?text=Error";
        }
    };

    // --- 1. FETCH & POLLING EFFECT (Runs Once) ---
    useEffect(() => {
        if (!user) return navigate('/');

        const fetchOrdersData = async (isBackground = false) => {
            try {
                if (!isBackground) setLoading(true);
                const res = await axios.get(`${BASE_URL}/api/order/my-orders`, { withCredentials: true });
                if (res.data.success) {
                    setOrders(res.data.orders); // Update Raw Orders
                }
            } catch (error) { 
                console.log("Error fetching orders:", error); 
            } finally { 
                if (!isBackground) setLoading(false); 
            }
        };

        // Initial Load
        fetchOrdersData(false);

        // Background Polling (Every 4 seconds)
        const intervalId = setInterval(() => {
            fetchOrdersData(true); 
        }, 4000);

        return () => clearInterval(intervalId);
    }, [user]); // Removed 'selectedItem' to prevent re-triggering loader

    // --- 2. DATA PROCESSING EFFECT (Runs when 'orders' update) ---
    useEffect(() => {
        if (!orders) return;

        // Flatten Orders
        let items = [];
        orders.forEach(order => {
            if(order.items && Array.isArray(order.items)) {
                order.items.forEach(productItem => {
                    if (productItem.productId) {
                        items.push({
                            ...productItem,
                            _id: productItem._id, // Ensure unique ID is tracked
                            parentOrderId: order._id,
                            orderDate: order.createdAt,
                            orderStatus: order.orderStatus,
                            address: order.addressId,
                            totalOrderAmount: order.totalAmount
                        });
                    }
                });
            }
        });

        // Update List View
        setFlattenedProducts(items);

        // Update Selected Item View (Live Status Update)
        setSelectedItem((prevSelected) => {
            if (!prevSelected) return null;

            // Find the updated version of the currently selected item
            const updatedItem = items.find(i => 
                i._id === prevSelected._id && 
                i.parentOrderId === prevSelected.parentOrderId
            );

            // Update only if status changed
            if (updatedItem && updatedItem.orderStatus !== prevSelected.orderStatus) {
                return updatedItem;
            }
            return prevSelected; // Keep existing if no change
        });

    }, [orders]); 

    // --- HANDLER: CANCEL ORDER ---
    const handleCancelOrder = async () => {
        try {
            await axios.post(`${BASE_URL}/api/order/cancel/Odder`, { orderId: cancelModal.orderId }, { withCredentials: true });
            
            // Manually refresh data
            const res = await axios.get(`${BASE_URL}/api/order/my-orders`, { withCredentials: true });
            if (res.data.success) setOrders(res.data.orders);
            
            setCancelModal({ show: false, orderId: null });
        } catch (error) { alert(error.response?.data?.message || "Failed to cancel"); }
    };

    // --- INVOICE PRINT ---
    const handlePrintInvoice = () => {
        const item = selectedItem;
        const invoiceHTML = `
            <html>
            <head><title>Invoice #${item.parentOrderId.slice(-6)}</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="border:1px solid #ccc; padding:20px; max-width:600px; margin:auto;">
                    <h2 style="text-align:center;">TAX INVOICE</h2>
                    <p><strong>Order ID:</strong> ${item.parentOrderId}</p>
                    <p><strong>Date:</strong> ${new Date(item.orderDate).toDateString()}</p>
                    <hr/>
                    <p><strong>Bill To:</strong><br/>${item.address.fullName}<br/>${item.address.houseNo}, ${item.address.area}<br/>${item.address.city} - ${item.address.pincode}<br/>Phone: ${item.address.phone}</p>
                    <hr/>
                    <table style="width:100%; border-collapse:collapse;">
                        <tr style="background:#eee;"><th style="border:1px solid #ddd; padding:8px;">Item</th><th style="border:1px solid #ddd; padding:8px;">Qty</th><th style="border:1px solid #ddd; padding:8px;">Price</th></tr>
                        <tr>
                            <td style="border:1px solid #ddd; padding:8px;">${item.productId.name} (${item.size || "N/A"})</td>
                            <td style="border:1px solid #ddd; padding:8px;">${item.quantity}</td>
                            <td style="border:1px solid #ddd; padding:8px;">₹${item.price}</td>
                        </tr>
                    </table>
                    <h3 style="text-align:right;">Total: ₹${item.price * item.quantity}</h3>
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `;
        const win = window.open("", "_blank");
        win.document.write(invoiceHTML);
        win.document.close();
    };

    if (loading) return <div className="h-screen flex justify-center items-center"><Loader /></div>;

    // --- VIEW 1: ORDER LIST ---
    if (!selectedItem) {
        return (
            <div className="w-full min-h-screen bg-gray-100 flex flex-col md:flex-row">
                <AccountMenuBar />
                <div className='w-full md:w-[75%] p-2 md:p-6'>
                    <h1 className='text-2xl font-bold mb-6 px-2 text-gray-800'>My Orders</h1>
                    <div className="flex flex-col gap-4">
                        {flattenedProducts.length === 0 ? (
                            <div className="bg-white p-10 text-center rounded-xl shadow-sm">
                                <Package size={48} className="mx-auto text-gray-300 mb-2"/>
                                <p className="text-gray-500 font-medium">No orders found.</p>
                            </div>
                        ) : (
                            flattenedProducts.map((item) => (
                                <div key={`${item.parentOrderId}-${item._id}`} onClick={() => setSelectedItem(item)} className="bg-white p-5 rounded-xl shadow-sm flex gap-5 cursor-pointer hover:shadow-lg transition-all border border-transparent hover:border-indigo-100 group">
                                    <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg p-1">
                                        <img src={getSafeImageUrl(item.productId)} className="w-full h-full object-contain mix-blend-multiply" alt="product" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.productId.name}</h3>
                                            <ArrowRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1"/>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">{item.productId.subCategory?.name || "Apparel"}</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${item.orderStatus === 'delivered' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : item.orderStatus === 'cancelled' ? 'bg-red-500' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`}></div>
                                            <span className={`text-xs font-bold uppercase ${item.orderStatus === 'delivered' ? 'text-green-600' : item.orderStatus === 'cancelled' ? 'text-red-600' : 'text-blue-600'}`}>
                                                {item.orderStatus === 'delivered' ? `Delivered` : item.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: TRACKING DETAILS ---
    const steps = ["pending", "confirmed", "shipped", "delivered"];
    const currentStepIndex = steps.indexOf(selectedItem.orderStatus);
    const isCancelled = selectedItem.orderStatus === "cancelled";
    const isDelivered = selectedItem.orderStatus === "delivered";

    const activeBg = isDelivered ? "bg-green-600" : "bg-blue-600";
    const activeRing = isDelivered ? "ring-green-100" : "ring-blue-100";
    const activeText = isDelivered ? "text-green-700" : "text-blue-700";

    return (
        <div className="w-full min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <AccountMenuBar />
            <div className="w-full md:w-[75%] p-2 md:p-6">
                <button onClick={() => setSelectedItem(null)} className="flex items-center gap-2 font-bold mb-4 bg-white p-4 w-full shadow-sm rounded-xl text-gray-600 hover:text-black transition-colors">
                    <ChevronLeft size={20} /> Back to My Orders
                </button>

                <div className="bg-white p-6 rounded-2xl shadow-sm mb-4 flex flex-col md:flex-row gap-6 justify-between items-start animate-fade-in">
                    <div className="flex gap-5 w-full">
                        <div className="w-24 h-28 bg-gray-50 rounded-xl p-2 flex-shrink-0 border border-gray-100">
                            <img src={getSafeImageUrl(selectedItem.productId)} className="w-full h-full object-contain mix-blend-multiply" alt="product" />
                        </div>
                        <div className="flex flex-col justify-between py-1">
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">{selectedItem.productId.name}</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">Size: {selectedItem.size || "N/A"} <span className="mx-2">•</span> Color: {selectedItem.color || "N/A"}</p>
                            </div>
                            <p className="font-bold text-xl mt-2">₹{selectedItem.price} <span className="text-sm font-normal text-gray-500">x {selectedItem.quantity}</span></p>
                        </div>
                    </div>
                    
                    {isDelivered && (
                        <button onClick={handlePrintInvoice} className="w-full md:w-auto bg-gray-900 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200">
                            <Printer size={16}/> Download Invoice
                        </button>
                    )}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm">
                    <h3 className="font-bold uppercase text-gray-400 text-xs tracking-wider mb-8 border-b pb-4">Order Status</h3>
                    
                    <div className="relative pl-2">
                        {isCancelled ? (
                            <div className="flex gap-4 items-center z-10 relative bg-red-50 p-4 rounded-xl border border-red-100">
                                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
                                    <XCircle size={24}/>
                                </div>
                                <div>
                                    <p className="font-bold text-red-700 text-lg">Order Cancelled</p>
                                    <p className="text-xs text-red-500 font-medium mt-0.5">This order has been cancelled.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {steps.map((step, index) => {
                                    const isActive = index <= currentStepIndex;
                                    const isCompleted = index < currentStepIndex;
                                    const isLast = index === steps.length - 1;

                                    return (
                                        <div key={step} className="flex gap-5 relative pb-10 last:pb-0">
                                            {!isLast && (
                                                <div className={`absolute left-[11px] top-8 w-[2px] h-[calc(100%-10px)] transition-all duration-700 ease-in-out ${isCompleted ? activeBg : 'bg-gray-200'}`}></div>
                                            )}
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${isActive ? `${activeBg} ring-4 ${activeRing} shadow-md scale-110` : "bg-white border-2 border-gray-300"}`}>
                                                {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                                            </div>
                                            <div className={`-mt-1 transition-all duration-500 ${isActive ? 'translate-x-1' : 'opacity-60'}`}>
                                                <p className={`font-bold capitalize text-sm ${isActive ? "text-gray-900" : "text-gray-400"}`}>{step}</p>
                                                <p className={`text-[11px] font-medium mt-0.5 ${isActive ? activeText : "text-gray-400"}`}>{isActive ? (step === 'delivered' ? 'Package Delivered' : 'Completed') : 'Pending'}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {!isCancelled && selectedItem.orderStatus === 'pending' && (
                        <div className="mt-10 border-t pt-6">
                            <p className="text-xs text-gray-500 mb-3">Changed your mind?</p>
                            <button onClick={() => setCancelModal({show: true, orderId: selectedItem.parentOrderId})} className="w-full md:w-auto px-6 border border-red-200 text-red-600 py-3 font-bold text-xs uppercase hover:bg-red-50 rounded-xl transition-colors">
                                Cancel Order
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CANCEL MODAL */}
            {cancelModal.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                            <AlertTriangle size={24}/>
                        </div>
                        <h2 className="font-bold text-lg mb-2 text-center text-gray-800">Cancel Order?</h2>
                        <p className="text-sm text-gray-500 mb-6 text-center leading-relaxed">Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setCancelModal({show:false})} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">No, Keep It</button>
                            <button onClick={handleCancelOrder} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-colors">Yes, Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderaPage;