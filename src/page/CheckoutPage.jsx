import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { MapPin, Plus, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import Loader from '../components/loader/Loader';

function CheckoutPage() {
    const { state } = useLocation(); // Data from 'Buy Now'
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart } = useShop();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [loading, setLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);

    // Form State for New Address (Matching Backend Model)
    const [formData, setFormData] = useState({
        fullName: "", phone: "", altPhone: "",
        pincode: "", state: "", city: "",
        houseNo: "", area: "", landmark: "",
        type: "Home"
    });

    // 1. Fetch Addresses
    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/address/get-all-address`, { withCredentials: true });
            if (res.data.success) {
                setAddresses(res.data.addresses);
                // Auto Select Default
                const defaultAddr = res.data.addresses.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddress(defaultAddr._id);
                else if (res.data.addresses.length > 0) setSelectedAddress(res.data.addresses[0]._id);
            }
        } catch (error) {
            console.log("Fetch address error", error);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // 2. Handle Add Address
    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/address/add-address`, formData, { withCredentials: true });
            if (res.data.success) {
                await fetchAddresses(); // Refresh list
                setIsAddingNew(false); // Close form
                setFormData({ fullName: "", phone: "", altPhone: "", pincode: "", state: "", city: "", houseNo: "", area: "", landmark: "", type: "Home" });
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add address");
        } finally {
            setLoading(false);
        }
    };

    // 3. Calculate Invoice Logic
    const isBuyNow = state && state.buyNowId;
    let invoiceItems = [];
    let subTotal = 0;

    if (isBuyNow) {
        // Buy Now Logic
        const product = state.productDetails || {}; 
        subTotal = (product.price || 0) * (state.singleQuantity || 1);
        invoiceItems = [{ ...product, quantity: state.singleQuantity || 1 }];
    } else {
        // Cart Logic
        invoiceItems = cart.map(item => ({
            ...item.productId,
            quantity: 1 // Assuming cart item structure
        }));
        subTotal = cart.reduce((acc, item) => acc + (item.productId?.price || 0), 0);
    }
    
    const shipping = subTotal > 1999 ? 0 : 99; // Example Logic
    const grandTotal = subTotal + shipping;

    // 4. Place Order
    const handlePlaceOrder = async () => {
        if (!selectedAddress) return alert("Please select a delivery address.");
        setOrderLoading(true);

        const payload = {
            addressId: selectedAddress,
            paymentMethod: paymentMethod,
            // If Buy Now, send specific ID, else backend handles Cart
            productId: isBuyNow ? state.buyNowId : null,
            singleQuantity: isBuyNow ? state.singleQuantity : null
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/order/place-order`, payload, { withCredentials: true });
            if (res.data.success) {
                // Success! Go to Orders page
                navigate('/user/orders'); 
            }
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Order Failed");
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 p-4 md:p-10 flex flex-col md:flex-row gap-8">
            
            {/* LEFT COLUMN: Address & Payment */}
            <div className="w-full md:w-[65%] flex flex-col gap-6">
                
                {/* 1. Address Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold uppercase flex items-center gap-2"><MapPin size={20}/> Delivery Address</h2>
                        <button onClick={() => setIsAddingNew(!isAddingNew)} className="text-sm font-bold underline text-blue-600 flex items-center gap-1">
                            <Plus size={14}/> {isAddingNew ? "Cancel" : "Add New"}
                        </button>
                    </div>

                    {/* Address List */}
                    {!isAddingNew && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div 
                                    key={addr._id}
                                    onClick={() => setSelectedAddress(addr._id)}
                                    className={`p-4 border rounded-lg cursor-pointer relative transition-all
                                        ${selectedAddress === addr._id ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200 hover:border-gray-400"}
                                    `}
                                >
                                    {selectedAddress === addr._id && <div className="absolute top-2 right-2 text-black"><CheckCircle size={18} fill="black" text="white"/></div>}
                                    <h3 className="font-bold uppercase">{addr.fullName} <span className="text-xs bg-gray-200 px-2 py-0.5 rounded ml-2">{addr.type}</span></h3>
                                    <p className="text-sm text-gray-600 mt-1">{addr.houseNo}, {addr.area}</p>
                                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                                    <p className="text-sm font-bold mt-2">Ph: {addr.phone}</p>
                                </div>
                            ))}
                            {addresses.length === 0 && <p className="text-gray-500 text-sm">No saved addresses found.</p>}
                        </div>
                    )}

                    {/* Add New Address Form */}
                    {isAddingNew && (
                        <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
                            <input required placeholder="Full Name" className="border p-3 rounded" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                            <input required placeholder="Phone Number" className="border p-3 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            <input placeholder="Pincode" required className="border p-3 rounded" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                            <input placeholder="City" required className="border p-3 rounded" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                            <input placeholder="State" required className="border p-3 rounded" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                            <input placeholder="House No / Flat" required className="border p-3 rounded" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
                            <input placeholder="Area / Colony" required className="border p-3 rounded" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                            <div className="flex gap-4 md:col-span-2">
                                <label className="flex items-center gap-2"><input type="radio" name="type" checked={formData.type === "Home"} onChange={() => setFormData({...formData, type: "Home"})} /> Home</label>
                                <label className="flex items-center gap-2"><input type="radio" name="type" checked={formData.type === "Work"} onChange={() => setFormData({...formData, type: "Work"})} /> Work</label>
                            </div>
                            <button disabled={loading} className="md:col-span-2 bg-black text-white py-3 font-bold uppercase rounded hover:bg-gray-800">
                                {loading ? "Saving..." : "Save & Use Address"}
                            </button>
                        </form>
                    )}
                </div>

                {/* 2. Payment Method */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2"><CreditCard size={20}/> Payment Method</h2>
                    <div className="flex flex-col gap-3">
                        <label className={`flex items-center gap-3 p-4 border rounded cursor-pointer ${paymentMethod === "COD" ? "border-black bg-gray-50" : ""}`}>
                            <input type="radio" name="pay" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="accent-black w-5 h-5"/>
                            <div className="flex items-center gap-2">
                                <Banknote />
                                <span className="font-bold">Cash On Delivery (COD)</span>
                            </div>
                        </label>
                        
                        <label className={`flex items-center gap-3 p-4 border rounded cursor-pointer opacity-60 ${paymentMethod === "ONLINE" ? "border-black" : ""}`}>
                            <input type="radio" name="pay" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} className="accent-black w-5 h-5"/>
                            <div className="flex items-center gap-2">
                                <CreditCard />
                                <span className="font-bold">Online Payment (Coming Soon)</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Invoice Summary */}
            <div className="w-full md:w-[35%]">
                <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-10">
                    <h2 className="text-xl font-bold uppercase mb-6 border-b pb-2">Order Summary</h2>
                    
                    {/* Items List */}
                    <div className="flex flex-col gap-4 max-h-60 overflow-y-auto mb-4 custom-scrollbar">
                        {invoiceItems.map((item, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                     <img src={item.imageUrl?.replace("http://","https://") || "https://via.placeholder.com/100"} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold uppercase line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                    <p className="text-sm font-medium">₹{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 border-t pt-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{subTotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>₹{grandTotal}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePlaceOrder} 
                        disabled={orderLoading}
                        className="w-full bg-black text-white py-4 mt-6 font-bold uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-400 transition-all"
                    >
                        {orderLoading ? "Processing..." : `Place Order • ₹${grandTotal}`}
                    </button>
                    
                    <p className="text-xs text-center text-gray-400 mt-4">Safe & Secure Payment</p>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;