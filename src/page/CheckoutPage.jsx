import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { 
    MapPin, Plus, Minus, Banknote, ShieldCheck, ChevronDown, ChevronUp, 
    Smartphone, CreditCard, Trash2, Loader2, AlertTriangle, 
    XCircle, CheckCircle, Info, X 
} from 'lucide-react';
import { BASE_URL } from '../api/baseUrl';
import { refreshExpriedToken } from '../api/refreshExpiredToken';

// --- CUSTOM TOAST COMPONENT ---
const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => onClose(), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show, onClose]);

    if (!toast.show) return null;

    return (
        <div className={`fixed top-5 right-5 z-[100] flex items-start gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-right fade-in duration-300 max-w-sm ${
            toast.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-800' : 
            toast.type === 'success' ? 'bg-green-50/95 border-green-200 text-green-800' : 'bg-white/95 border-gray-200 text-gray-800'
        }`}>
            <div className="mt-0.5">
                {toast.type === 'error' && <XCircle size={20} className="text-red-500" />}
                {toast.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
                {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm mb-0.5">{toast.type === 'error' ? 'Attention' : toast.type === 'success' ? 'Success' : 'Note'}</h4>
                <p className="text-xs font-medium opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={onClose} className="hover:bg-black/5 p-1 rounded-full transition-colors"><X size={16} /></button>
        </div>
    );
};

function CheckoutPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart } = useShop();
    
    // --- STATE ---
    const [avlabelPincode, setAvlabelPincode] = useState([]); 
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [orderLoading, setOrderLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    // Order Items (Stores processed items with variant logic)
    const [orderItems, setOrderItems] = useState([]);
    const [showMobilePriceDetails, setShowMobilePriceDetails] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        fullName: "", phone: "", altPhone: "",
        pincode: "", state: "", city: "",
        houseNo: "", area: "", landmark: "",
        type: "Home"
    });

    // Helpers
    const showToast = (message, type = 'error') => setToast({ show: true, message, type });

    const getSafeImageUrl = (imgData) => {
        if (!imgData) return "https://via.placeholder.com/100?text=No+Img";
        if (typeof imgData === 'object') return (imgData.url || imgData.secure_url || "").replace("http://", "https://");
        if (typeof imgData === 'string') return imgData.replace("http://", "https://");
        return "https://via.placeholder.com/100?text=No+Img";
    };

    useEffect(() => {
        if (!user) navigate('/');
        fetchDeliveryAvlabel();
        fetchAddresses();
        initializeOrderItems();
    }, [user, state, cart]);

    // --- 1. FETCH PINCODES ---
    const fetchDeliveryAvlabel = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/dashboard/admin/all-pincodes`, { withCredentials: true });
            if(res.data.success && res.data.areas) setAvlabelPincode(res.data.areas);
        } catch (error) {
            if (error?.response?.data?.message === "jwt expired") {
                const myrefreshToken = await refreshExpriedToken();
                if (myrefreshToken) return fetchDeliveryAvlabel();
                return navigate('/');
            }
        }
    }

    // --- 2. INITIALIZE ITEMS WITH VARIANT & STOCK LOGIC ---
    const initializeOrderItems = () => {
        let itemsToProcess = [];

        // Determine Source: Buy Now (State) or Cart (Context)
        if (state?.buyNowId) {
            const product = state.productDetails;
            itemsToProcess = [{
                uniqueKey: `buynow-${product._id}`,
                productId: product._id,
                name: product.name,
                price: product.price,
                image: (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl,
                variants: product.variants || [],
                selectedSize: state.size,
                selectedColor: state.color,
                quantity: state.singleQuantity || 1,
                cartItemId: null
            }];
        } else {
            itemsToProcess = cart.map((item, idx) => ({
                uniqueKey: `cart-${item._id || idx}`,
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                image: (item.productId.images && item.productId.images.length > 0) ? item.productId.images[0] : item.productId.imageUrl,
                variants: item.productId.variants || [],
                selectedSize: item.size,
                selectedColor: item.color,
                quantity: item.quantity,
                cartItemId: item._id
            }));
        }

        // Process Variants for each item
        const processedItems = itemsToProcess.map(item => {
            const variants = item.variants;
            let availableColors = [];
            let availableSizes = [];
            let maxStock = 0;

            if (variants.length > 0) {
                // 1. Get Unique Colors
                availableColors = [...new Set(variants.map(v => v.color))].filter(Boolean);
                
                // 2. Determine Selected Color (Default to first if invalid)
                if (!item.selectedColor || !availableColors.includes(item.selectedColor)) {
                    item.selectedColor = availableColors[0];
                }

                // 3. Get Sizes for Selected Color
                availableSizes = variants
                    .filter(v => v.color === item.selectedColor)
                    .map(v => v.size)
                    .filter(Boolean);

                // 4. Determine Selected Size
                if (!item.selectedSize || !availableSizes.includes(item.selectedSize)) {
                    item.selectedSize = availableSizes[0];
                }

                // 5. Get Stock for Combination
                const variant = variants.find(v => v.color === item.selectedColor && v.size === item.selectedSize);
                maxStock = variant ? variant.stock : 0;
            } else {
                // No variants structure? Assume global stock if available (or infinity/0)
                maxStock = item.stock || 100; // Fallback
            }

            // 6. Validate Quantity against Stock
            if (item.quantity > maxStock) item.quantity = maxStock;
            if (item.quantity < 1 && maxStock > 0) item.quantity = 1;

            return {
                ...item,
                availableColors,
                availableSizes,
                maxStock
            };
        });

        setOrderItems(processedItems);
    };

    // --- 3. HANDLE VARIANT CHANGE (Dropdowns) ---
    const handleVariantChange = (index, field, value) => {
        const newItems = [...orderItems];
        const item = newItems[index];

        if (field === 'color') {
            item.selectedColor = value;
            // Update Sizes based on new color
            item.availableSizes = item.variants
                .filter(v => v.color === value)
                .map(v => v.size)
                .filter(Boolean);
            // Reset Size to first available
            item.selectedSize = item.availableSizes[0];
        } else if (field === 'size') {
            item.selectedSize = value;
        }

        // Recalculate Stock
        const variant = item.variants.find(v => v.color === item.selectedColor && v.size === item.selectedSize);
        item.maxStock = variant ? variant.stock : 0;

        // Reset Quantity if excceds new stock
        if (item.quantity > item.maxStock) {
            item.quantity = item.maxStock;
            showToast(`Quantity adjusted to ${item.maxStock} based on available stock`, 'info');
        }

        setOrderItems(newItems);
    };

    // --- 4. HANDLE QUANTITY CHANGE ---
    const handleQuantityChange = (index, change) => {
        const newItems = [...orderItems];
        const item = newItems[index];
        const newQty = item.quantity + change;

        if (newQty < 1) return;
        if (newQty > item.maxStock) {
            showToast(`Only ${item.maxStock} items left in this size/color`, 'error');
            return;
        }

        item.quantity = newQty;
        setOrderItems(newItems);
    };

    const handleRemoveItem = (index) => {
        const newItems = orderItems.filter((_, i) => i !== index);
        setOrderItems(newItems);
        if (newItems.length === 0) {
            showToast("Cart is empty", "info");
            setTimeout(() => navigate('/'), 1000);
        }
    };

    // --- 5. PINCODE CHECK ---
    const checkPincodeServiceability = (pincodeToCheck) => {
        if(!pincodeToCheck) return false;
        const serviceArea = avlabelPincode.find(area => area.pincode === String(pincodeToCheck).trim());
        return serviceArea && serviceArea.DeliveryAvlabelStatus === true;
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/address/get-all-address`, { withCredentials: true });
            if (res.data.success) {
                setAddresses(res.data.addresses);
                const def = res.data.addresses.find(a => a.isDefault);
                if (def) setSelectedAddress(def._id);
                else if (res.data.addresses.length > 0) setSelectedAddress(res.data.addresses[0]._id);
            }
        } catch (error) { console.log(error); }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!checkPincodeServiceability(formData.pincode)) {
            return showToast(`Sorry, Delivery is NOT available for Pincode: ${formData.pincode} currently.`, 'error');
        }
        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/address/add-address`, formData, { withCredentials: true });
            setIsAddingNew(false);
            setFormData({ fullName: "", phone: "", altPhone: "", pincode: "", state: "", city: "", houseNo: "", area: "", landmark: "", type: "Home" });
            fetchAddresses();
            showToast("Address added successfully!", "success");
        } catch (error) {
            showToast(error.response?.data?.message || "Error adding address", "error");
        } finally { setLoading(false); }
    };

    // --- 6. PLACE ORDER ---
    const handlePlaceOrder = async () => {
        if (!selectedAddress) return showToast("Please select a delivery address", "error");
        
        // Validate Address Pincode
        const selectedAddrObj = addresses.find(a => a._id === selectedAddress);
        if(selectedAddrObj && !checkPincodeServiceability(selectedAddrObj.pincode)) {
            return showToast(`Delivery unavailable for Pincode: ${selectedAddrObj.pincode}.`, "error");
        }

        // Validate Stock
        const outOfStockItem = orderItems.find(i => i.maxStock === 0);
        if(outOfStockItem) return showToast(`${outOfStockItem.name} is out of stock in the selected variant.`, "error");

        setOrderLoading(true);
        try {
            // Note: Sending updated variants in payload. 
            // If backend uses 'Cart.find' for bulk items, it might ignore this unless updated.
            // But this handles 'Buy Now' perfectly and sends 'customItems' if backend supports.
            
            const payload = {
                addressId: selectedAddress,
                paymentMethod: paymentMethod,
                
                // For Buy Now flow (Backend expects single fields)
                productId: orderItems.length === 1 ? orderItems[0].productId : undefined,
                singleQuantity: orderItems.length === 1 ? orderItems[0].quantity : undefined,
                size: orderItems.length === 1 ? orderItems[0].selectedSize : undefined,
                color: orderItems.length === 1 ? orderItems[0].selectedColor : undefined,

                // For Custom/Bulk flow (If backend supported)
                items: orderItems.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    size: i.selectedSize,
                    color: i.selectedColor
                }))
            };

            const res = await axios.post(`${BASE_URL}/api/order/place-order`, payload, { withCredentials: true });
            if (res.data.success) {
                showToast("Order Placed Successfully!", "success");
                setTimeout(() => navigate('/user/orders'), 1000);
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Order Failed", "error");
        } finally { setOrderLoading(false); }
    };

    const totalAmount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = totalAmount > 1999 ? 0 : 99;
    const finalAmount = totalAmount + shipping;

    const PriceDetails = () => (
        <div className="flex flex-col gap-3 py-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>Price ({orderItems.length} items)</span><span>₹{totalAmount}</span></div>
            <div className="flex justify-between"><span>Delivery Charges</span><span className="text-green-600 font-bold">{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
            <div className="flex justify-between border-t border-dashed pt-3 text-lg font-bold text-black"><span>Total Amount</span><span>₹{finalAmount}</span></div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-gray-100 pb-32 md:pb-10 pt-2 relative">
            <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 px-2 md:px-0">
                <div className="w-full md:w-[70%] flex flex-col gap-3">
                    
                    {/* Step 1: Address */}
                    <div className="bg-white p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-4 bg-blue-600 p-3 -mx-4 -mt-4">
                            <h2 className="text-white font-bold uppercase text-sm flex items-center gap-2"><span className="bg-white text-blue-600 px-2 rounded text-xs">1</span> Delivery Address</h2>
                        </div>
                        {!isAddingNew ? (
                            <div className="flex flex-col gap-2">
                                {addresses.map(addr => {
                                    const isServiceable = checkPincodeServiceability(addr.pincode);
                                    return (
                                        <div key={addr._id} onClick={() => setSelectedAddress(addr._id)} className={`p-4 border cursor-pointer flex gap-3 items-start relative transition-all ${selectedAddress === addr._id ? "bg-blue-50 border-blue-500 shadow-sm" : "hover:bg-gray-50"} ${!isServiceable ? "opacity-75 bg-red-50/50" : ""}`}>
                                            <div className={`w-4 h-4 rounded-full border border-gray-400 mt-1 flex items-center justify-center ${selectedAddress === addr._id ? "bg-blue-600 border-blue-600" : ""}`}>{selectedAddress === addr._id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}</div>
                                            <div className="w-full">
                                                <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm">{addr.fullName}</span><span className="bg-gray-100 text-[10px] px-2 py-0.5 rounded uppercase font-bold text-gray-500">{addr.type}</span><span className="text-sm font-bold ml-2">{addr.phone}</span></div>
                                                <p className="text-xs text-gray-600 mt-1">{addr.houseNo}, {addr.area}, {addr.city} - <span className="font-bold">{addr.pincode}</span></p>
                                                {!isServiceable && <div className="flex items-center gap-2 mt-2 text-red-700 font-bold text-[11px] bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 w-fit animate-in fade-in"><AlertTriangle size={14} /> Delivery Not Available here</div>}
                                                {selectedAddress === addr._id && isServiceable && <button className="bg-orange-500 text-white px-6 py-2 mt-3 uppercase text-xs font-bold shadow-sm hover:bg-orange-600 transition">Deliver Here</button>}
                                            </div>
                                        </div>
                                    )
                                })}
                                <button onClick={() => setIsAddingNew(true)} className="text-blue-600 font-bold text-sm py-3 flex items-center gap-2 hover:bg-blue-50 px-2 rounded transition"><Plus size={16} /> Add a new address</button>
                            </div>
                        ) : (
                            <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-3 bg-gray-50 p-4 border animate-fade-in rounded-lg">
                                <h3 className="col-span-2 text-blue-600 font-bold text-sm uppercase mb-2">Add New Address</h3>
                                <input placeholder="Name" className="border p-2 rounded text-sm outline-blue-500" onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                                <input placeholder="Phone" className="border p-2 rounded text-sm outline-blue-500" onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                <input placeholder="Pincode" className="border p-2 rounded text-sm outline-blue-500" onChange={e => setFormData({ ...formData, pincode: e.target.value })} required />
                                <input placeholder="City" className="border p-2 rounded text-sm outline-blue-500" onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                                <textarea placeholder="Address (Area and Street)" className="border p-2 rounded text-sm col-span-2 h-20 outline-blue-500" onChange={e => setFormData({ ...formData, area: e.target.value })} required></textarea>
                                <input placeholder="State" className="border p-2 rounded text-sm outline-blue-500" onChange={e => setFormData({ ...formData, state: e.target.value })} required />
                                <input placeholder="House No" className="border p-2 rounded text-sm col-span-2 outline-blue-500" onChange={e => setFormData({ ...formData, houseNo: e.target.value })} required />
                                <div className="col-span-2 flex gap-4 text-xs font-bold text-gray-500 my-2"><label className="flex gap-2 items-center cursor-pointer"><input type="radio" name="type" onChange={() => setFormData({ ...formData, type: "Home" })} defaultChecked /> Home</label><label className="flex gap-2 items-center cursor-pointer"><input type="radio" name="type" onChange={() => setFormData({ ...formData, type: "Work" })} /> Work</label></div>
                                <button className="bg-orange-500 text-white px-6 py-2 uppercase font-bold text-sm shadow rounded-sm flex justify-center items-center gap-2">{loading && <Loader2 className="animate-spin" size={14}/>} Save</button>
                                <button type="button" onClick={() => setIsAddingNew(false)} className="text-blue-600 font-bold text-sm uppercase">Cancel</button>
                            </form>
                        )}
                    </div>

                    {/* Step 2: Order Summary with VARIANTS */}
                    <div className="bg-white p-4 shadow-sm">
                        <div className="flex justify-between items-center bg-blue-600 p-3 -mx-4 -mt-4 mb-4">
                            <h2 className="text-white font-bold uppercase text-sm flex items-center gap-2"><span className="bg-white text-blue-600 px-2 rounded text-xs">2</span> Order Summary</h2>
                        </div>
                        <div className="flex flex-col gap-6">
                            {orderItems.map((item, i) => (
                                <div key={item.uniqueKey} className="flex gap-4 border-b pb-4 last:border-0 items-start relative">
                                    <button onClick={() => handleRemoveItem(i)} className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                                    
                                    <div className="w-24 h-24 flex-shrink-0 border p-1 rounded-sm">
                                        <img src={getSafeImageUrl(item.image)} className="w-full h-full object-contain" alt={item.name} />
                                    </div>
                                    <div className="flex-1 pr-6">
                                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                        <p className="text-sm font-bold mt-1">₹{item.price}</p>
                                        
                                        {/* --- VARIANT SELECTORS --- */}
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            {item.availableColors.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Color</label>
                                                    <div className="relative">
                                                        <select 
                                                            value={item.selectedColor} 
                                                            onChange={(e) => handleVariantChange(i, 'color', e.target.value)}
                                                            className="appearance-none border border-gray-300 rounded px-2 py-1 pr-6 text-xs font-bold bg-white focus:border-blue-500 outline-none"
                                                        >
                                                            {item.availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-1 top-1.5 text-gray-500 pointer-events-none"/>
                                                    </div>
                                                </div>
                                            )}

                                            {item.availableSizes.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Size</label>
                                                    <div className="relative">
                                                        <select 
                                                            value={item.selectedSize} 
                                                            onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                                            className="appearance-none border border-gray-300 rounded px-2 py-1 pr-6 text-xs font-bold bg-white focus:border-blue-500 outline-none"
                                                        >
                                                            {item.availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-1 top-1.5 text-gray-500 pointer-events-none"/>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stock Info */}
                                        <div className="mt-2 text-[10px] font-bold">
                                            {item.maxStock === 0 ? <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span> : 
                                             item.maxStock < 5 ? <span className="text-orange-600">Only {item.maxStock} left!</span> : 
                                             <span className="text-green-600">In Stock</span>}
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center border border-gray-300 rounded-sm">
                                                <button onClick={() => handleQuantityChange(i, -1)} disabled={item.quantity <= 1} className="px-3 py-1 bg-gray-50 hover:bg-gray-200 disabled:opacity-40 text-gray-600"><Minus size={14} /></button>
                                                <span className="px-4 py-1 text-sm font-bold w-10 text-center">{item.quantity}</span>
                                                <button onClick={() => handleQuantityChange(i, 1)} disabled={item.quantity >= item.maxStock} className="px-3 py-1 bg-gray-50 hover:bg-gray-200 disabled:opacity-40 text-gray-600"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Payment */}
                    <div className="bg-white p-4 shadow-sm">
                        <div className="flex justify-between items-center bg-blue-600 p-3 -mx-4 -mt-4 mb-4">
                            <h2 className="text-white font-bold uppercase text-sm flex items-center gap-2"><span className="bg-white text-blue-600 px-2 rounded text-xs">3</span> Payment Options</h2>
                        </div>
                        <div className="flex flex-col gap-0">
                            <div className="p-4 border-b opacity-60 cursor-not-allowed bg-gray-50"><div className="flex items-center gap-3 justify-between"><div className="flex items-center gap-3"><Smartphone size={16} /> <span className="text-sm font-medium">UPI</span></div><span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">Coming Soon</span></div></div>
                            <label className="flex items-center gap-3 p-4 bg-blue-50 cursor-pointer border border-blue-100"><input type="radio" checked onChange={() => setPaymentMethod("COD")} className="accent-blue-600 w-4 h-4" /><div className="flex flex-col"><span className="font-bold text-sm flex items-center gap-2">Cash on Delivery <Banknote size={16} /></span><span className="text-xs text-gray-500">Pay cash at time of delivery</span></div></label>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Price Details */}
                <div className="w-full md:w-[30%] hidden md:block">
                    <div className="bg-white p-4 shadow-sm sticky top-4">
                        <h2 className="text-gray-500 font-bold uppercase text-sm border-b pb-3 mb-2">Price Details</h2>
                        <PriceDetails />
                        <div className="mt-4 border-t pt-4">
                            <button onClick={handlePlaceOrder} disabled={orderLoading} className="w-full bg-orange-500 text-white py-3 uppercase font-bold text-sm shadow hover:bg-orange-600 transition-colors flex justify-center items-center gap-2">
                                {orderLoading ? <Loader2 className="animate-spin" size={16} /> : "Place Order"}
                            </button>
                        </div>
                        <div className="flex gap-2 items-center text-xs text-gray-500 mt-4 bg-gray-100 p-2 rounded"><ShieldCheck size={16} /> Safe and Secure Payments.</div>
                    </div>
                </div>
            </div>

            {/* MOBILE BOTTOM BAR */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50">
                {showMobilePriceDetails && <div className="p-4 bg-gray-50 border-b animate-slide-up"><h2 className="text-gray-500 font-bold uppercase text-xs mb-2">Price Breakdown</h2><PriceDetails /></div>}
                <div className="flex justify-between items-center p-3">
                    <div className="flex flex-col"><span className="text-lg font-bold">₹{finalAmount}</span><button onClick={() => setShowMobilePriceDetails(!showMobilePriceDetails)} className="text-xs text-blue-600 font-bold flex items-center gap-1">View Price Details {showMobilePriceDetails ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</button></div>
                    <button onClick={handlePlaceOrder} disabled={orderLoading} className="bg-red-500 text-white px-8 py-3 uppercase font-bold text-sm rounded-sm shadow-sm flex items-center gap-2">{orderLoading ? <Loader2 className="animate-spin" size={16} /> : "Place Order"}</button>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;