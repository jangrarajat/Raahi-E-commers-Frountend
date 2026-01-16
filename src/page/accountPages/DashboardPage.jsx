import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios'; 
import { 
    LayoutDashboard, ShoppingBag, Package, Users, TrendingUp, 
    Home, Plus, Search, Trash2, X, ChevronUp, ChevronDown, 
    Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Settings, 
    MapPin, AlertTriangle, UploadCloud, Loader2, Menu, Check, Info, Box, Printer 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';

// --- CONSTANTS ---
const CATEGORIES = ["Men", "Women", "Kids", "Accessories"];
const SUB_CATEGORIES = [
    "T-Shirt", "Shirt", "Jeans", "Trousers", "Shorts", "Joggers", "Track Pants",
    "Kurta", "Kurti", "Saree", "Lehenga", "Salwar Suit", "Sherwani",
    "Dress", "Top", "Tunic", "Skirt", "Jumpsuit", "Gown",
    "Jacket", "Hoodie", "Sweatshirt", "Blazer", "Coat", "Sweater",
    "Activewear", "Sleepwear", "Innerwear", "Swimwear",
    "Shoes", "Sandals", "Sneakers", "Formal Shoes",
    "Watch", "Belt", "Wallet", "Bag", "Sunglasses", "Jewellery", "Perfume"
].sort();

// --- SKELETON LOADER ---
const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-300/50 rounded-lg ${className}`}></div>;
const TableRowSkeleton = ({ cols = 4 }) => (
    <tr>{[...Array(cols)].map((_, i) => <td key={i} className="p-4"><Skeleton className="h-6 w-full" /></td>)}</tr>
);

// --- HELPER: SAFE IMAGE URL ---
const getSafeImageUrl = (product) => {
    if (!product) return "https://via.placeholder.com/150?text=No+Data";
    try {
        if (typeof product === 'string') return "https://via.placeholder.com/150?text=No+Data";
        const img = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
        if (typeof img === 'object') return (img.url || img.secure_url || "").replace("http://", "https://");
        if (typeof img === 'string') return img.replace("http://", "https://");
        return "https://via.placeholder.com/150?text=No+Image";
    } catch (err) {
        return "https://via.placeholder.com/150?text=Error";
    }
};

// --- PRINT PACKING SLIP FUNCTION (UPDATED) ---
const handlePrintPackingSlip = (order) => {
    // 1. Calculate Subtotal (Sum of all item prices)
    const subtotal = order.items.reduce((acc, item) => acc + ((item.productId?.price || 0) * item.quantity), 0);
    
    // 2. Calculate Delivery Charge (Total - Subtotal)
    // Note: If data is inconsistent, ensure delivery charge isn't negative
    let deliveryCharge = order.totalAmount - subtotal;
    if (deliveryCharge < 0) deliveryCharge = 0; 

    const printWindow = window.open('', '', 'width=800,height=600');
    
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-size: 14px;">${item.productId?.name || 'Product N/A'}</td>
            <td style="padding: 10px; font-size: 14px;">${item.size || '-'}</td>
            <td style="padding: 10px; font-size: 14px;">${item.color || '-'}</td>
            <td style="padding: 10px; font-size: 14px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; font-size: 14px; text-align: right;">₹${(item.productId?.price || 0) * item.quantity}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <html>
        <head>
            <title>Packing Slip - ${order._id}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; color: #333; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #000; padding-bottom: 20px; }
                .company-name { font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px; color: #000; }
                .doc-title { font-size: 16px; color: #666; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
                
                .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px; }
                .info-box { flex: 1; }
                .info-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #999; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                .info-content { font-size: 15px; line-height: 1.6; font-weight: 500; }
                
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { text-align: left; border-bottom: 2px solid #000; padding: 12px 10px; font-size: 12px; text-transform: uppercase; font-weight: bold; }
                th:nth-child(4) { text-align: center; }
                th:last-child { text-align: right; }
                
                .summary { display: flex; justify-content: flex-end; }
                .summary-table { width: 350px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
                .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
                .summary-row.total { border-top: 2px solid #000; font-weight: 900; font-size: 20px; margin-top: 10px; padding-top: 15px; }
                
                .footer { text-align: center; font-size: 12px; color: #999; margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; }
                .barcode { font-family: 'Courier New', monospace; background: #eee; padding: 5px 10px; border-radius: 4px; font-size: 14px; display: inline-block; margin-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="company-name">VASHU TRADING COMPANY</h1>
                <p class="doc-title"> Invoice</p>
            </div>

            <div class="info-grid">
                <div class="info-box">
                    <div class="info-title">Order Details</div>
                    <div class="info-content">
                        <strong>Order ID:</strong> <span class="barcode">${order._id}</span><br>
                        <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
                        <strong>Payment:</strong> <span style="text-transform:uppercase;">${order.paymentMethod}</span><br>
                        
                    </div>
                </div>
                <div class="info-box" style="text-align: right;">
                    <div class="info-title">Ship To</div>
                    <div class="info-content">
                        <strong>${order.addressId?.fullName || order.userId?.username}</strong><br>
                        ${order.addressId?.houseNo}, ${order.addressId?.area}<br>
                        ${order.addressId?.city}, ${order.addressId?.state}<br>
                        <strong>PIN: ${order.addressId?.pincode}</strong><br>
                        Phone: ${order.addressId?.phone}
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 40%;">Item</th>
                        <th>Size</th>
                        <th>Color</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="summary">
                <div class="summary-table">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>₹${subtotal}</span>
                    </div>
                    <div class="summary-row">
                        <span>Delivery Charge:</span>
                        <span>₹${deliveryCharge}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Grand Total:</span>
                        <span>₹${order.totalAmount}</span>
                    </div>
                </div>
            </div>

            <div class="footer">
                Thank you for shopping with Vashu Trading Company!<br>
                Contact us for any support or queries.
            </div>
            
            <script>
                window.print();
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 4000); 
        return () => clearTimeout(timer);
    }, [onClose, toast]);

    if (!toast.show) return null;

    return (
        <div className={`fixed top-5 right-5 z-[70] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-right fade-in duration-300 ${
            toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' : 
            toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 'bg-white/90 border-gray-200 text-gray-800'
        }`}>
            {toast.type === 'error' && <XCircle size={24} className="text-red-500" />}
            {toast.type === 'success' && <CheckCircle size={24} className="text-green-500" />}
            {toast.type === 'info' && <Info size={24} className="text-blue-500" />}
            <div>
                <h4 className="font-bold text-sm">{toast.type === 'error' ? 'Error' : toast.type === 'success' ? 'Success' : 'Info'}</h4>
                <p className="text-xs font-medium opacity-90">{toast.message}</p>
            </div>
            <button onClick={onClose} className="ml-2 hover:bg-black/5 p-1 rounded-full"><X size={16} /></button>
        </div>
    );
};

function DashboardPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Global States
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ 
        totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0,
        breakdown: { delivered: 0, pending: 0, cancelled: 0, today: 0 }
    });
    
    // Pagination
    const [orderPage, setOrderPage] = useState(1);
    const [orderTotalPages, setOrderTotalPages] = useState(1);
    const [productPage, setProductPage] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState('week'); 
    const [productSearch, setProductSearch] = useState('');

    // --- MODAL & TOAST STATE ---
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const requestConfirm = (title, message, action) => setConfirmModal({ show: true, title, message, action });
    
    const handleConfirm = async () => { 
        setConfirmModal({ ...confirmModal, show: false });
        if (confirmModal.action) await confirmModal.action(); 
    };
    
    const showToast = (message, type = 'info') => setToast({ show: true, message, type });
    const closeToast = () => setToast({ ...toast, show: false });

    // --- DATA FETCHING ---
    const fetchData = async (isBackground = false) => {
        try {
            if(!isBackground) setLoading(true); else setRefreshing(true);

            // Stats
            const statsRes = await API.get(`/api/dashboard/admin/stats?range=${timeFilter}`);
            if(statsRes.data.success) setStats(statsRes.data.stats);

            // Orders
            const ordersRes = await API.get(`/api/dashboard/admin/orders?page=${orderPage}&limit=50`);
            if(ordersRes.data.success) { setOrders(ordersRes.data.orders); setOrderTotalPages(ordersRes.data.totalPages); }

            // Products
            if(!isBackground || activeTab === 'products') {
                const prodRes = await API.get(`/api/dashboard/getAllProduct?page=${productPage}&limit=50&search=${productSearch}`);
                if(prodRes.data.success) { setProducts(prodRes.data.products); setProductTotalPages(prodRes.data.totalPages); }
            }
            setLoading(false); setRefreshing(false);
        } catch (error) { console.error(error); setLoading(false); setRefreshing(false); }
    };

    useEffect(() => { const t = setTimeout(fetchData, 500); return () => clearTimeout(t); }, [timeFilter, orderPage, productPage, productSearch]);
    useEffect(() => { const i = setInterval(() => fetchData(true), 10000); return () => clearInterval(i); }, [timeFilter, orderPage, productPage]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardOverview stats={stats} orders={orders} timeFilter={timeFilter} setTimeFilter={setTimeFilter} loading={loading} />;
            case 'products': return (
                <ProductManager 
                    products={products} refreshData={() => fetchData(true)} 
                    page={productPage} setPage={setProductPage} totalPages={productTotalPages}
                    search={productSearch} setSearch={setProductSearch} 
                    requestConfirm={requestConfirm} showToast={showToast} loading={loading}
                />
            );
            case 'orders': return (
                <OrderManager 
                    orders={orders} refreshData={() => fetchData(true)} 
                    page={orderPage} setPage={setOrderPage} totalPages={orderTotalPages} 
                    requestConfirm={requestConfirm} showToast={showToast} loading={loading}
                />
            );
            case 'settings': return <SettingsManager requestConfirm={requestConfirm} showToast={showToast} />;
            default: return <DashboardOverview stats={stats} orders={orders} timeFilter={timeFilter} setTimeFilter={setTimeFilter} loading={loading} />;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 font-sans text-gray-800 overflow-hidden fixed w-full">
            <Toast toast={toast} onClose={closeToast} />
            {confirmModal.show && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in p-4">
                    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-white/50">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 p-3 rounded-full mb-4 text-red-500"><AlertTriangle size={32} /></div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{confirmModal.title}</h3>
                            <p className="text-gray-500 text-sm mb-6">{confirmModal.message}</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50">Cancel</button>
                                <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 to-black text-white font-bold shadow-lg hover:shadow-xl transition">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 top-28 md:top-0 bg-white/70 backdrop-blur-xl border-r border-white/50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:shadow-none`}>
                <nav className="p-4 space-y-2 mt-4 flex-1">
                    <SidebarBtn label="Overview" icon={LayoutDashboard} id="dashboard" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <SidebarBtn label="Products" icon={Package} id="products" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <SidebarBtn label="Orders" icon={ShoppingBag} id="orders" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <SidebarBtn label="Customers" icon={Users} id="customers" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    <SidebarBtn label="Settings" icon={Settings} id="settings" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                </nav>
            </aside>
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
                <header className="h-20 bg-white/60 backdrop-blur-lg border-b border-white/40 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
                    <div className='w-full h-full flex md:hidden '>
                        <SidebarBtn label="Overview" icon={LayoutDashboard} id="dashboard" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                        <SidebarBtn label="Products" icon={Package} id="products" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                        <SidebarBtn label="Orders" icon={ShoppingBag} id="orders" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                        <SidebarBtn label="Customers" icon={Users} id="customers" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                        <SidebarBtn label="Settings" icon={Settings} id="settings" activeTab={activeTab} setTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} />
                    </div>
                    <div className=" hidden md:flex items-center gap-4 ">
                        <h2 className="text-xl font-bold capitalize text-gray-800 tracking-tight">{activeTab}</h2>
                    </div>
                    <div className=" hidden md:flex items-center gap-4">
                        {refreshing && <span className="text-xs font-bold text-indigo-500 animate-pulse bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Updating...</span>}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-400 text-white flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">R</div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 scroll-smooth">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW
// ----------------------------------------------------------------------
function DashboardOverview({ stats, orders, timeFilter, setTimeFilter, loading }) {
    const [showOrderStats, setShowOrderStats] = useState(true); 
    const chartData = useMemo(() => {
        const now = new Date();
        let dataMap = {};
        let formatStr = 'EEE'; 
        let startDate = subDays(now, 7);
        if (timeFilter === 'day') { startDate = subDays(now, 1); formatStr = 'HH:mm'; }
        else if (timeFilter === 'week') { startDate = subDays(now, 7); formatStr = 'EEE'; }
        else if (timeFilter === 'month') { startDate = startOfMonth(now); formatStr = 'dd MMM'; }
        else if (timeFilter === 'year') { startDate = startOfYear(now); formatStr = 'MMM'; }
        const filteredOrders = orders.filter(o => new Date(o.createdAt) >= startDate);
        filteredOrders.forEach(order => {
            const dateKey = format(new Date(order.createdAt), formatStr);
            if (!dataMap[dateKey]) dataMap[dateKey] = { name: dateKey, sales: 0 };
            dataMap[dateKey].sales += order.totalAmount || 0;
        });
        return Object.values(dataMap);
    }, [orders, timeFilter]);

    if (loading) return <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-5">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div><Skeleton className="h-80 w-full rounded-2xl" /></div>;

    return (
        <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-end">
                <div className="bg-white/50 backdrop-blur-md p-1 rounded-xl shadow-sm border border-white/50 inline-flex">
                    {['day', 'week', 'month', 'year', 'all'].map(filter => (
                        <button key={filter} onClick={() => setTimeFilter(filter)} className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${timeFilter === filter ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>{filter}</button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} color="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-200" isDark />
                <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-white/60 backdrop-blur-md text-gray-800 border border-white/60" />
                <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="bg-white/60 backdrop-blur-md text-gray-800 border border-white/60" />
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-white/60 backdrop-blur-md text-gray-800 border border-white/60" />
            </div>
            {showOrderStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in">
                    <MiniStatCard label="Today" value={stats.breakdown?.today || 0} icon={Clock} color="text-blue-600 bg-blue-50/50" />
                    <MiniStatCard label="Delivered" value={stats.breakdown?.delivered || 0} icon={CheckCircle} color="text-green-600 bg-green-50/50" />
                    <MiniStatCard label="Pending" value={stats.breakdown?.pending || 0} icon={ShoppingBag} color="text-yellow-600 bg-yellow-50/50" />
                    <MiniStatCard label="Cancelled" value={stats.breakdown?.cancelled || 0} icon={XCircle} color="text-red-600 bg-red-50/50" />
                </div>
            )}
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Sales Analytics</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                            <Tooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                            <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 2. PRODUCT MANAGER
// ----------------------------------------------------------------------
function ProductManager({ products, refreshData, page, setPage, totalPages, search, setSearch, requestConfirm, showToast, loading }) {
    const [isAdding, setIsAdding] = useState(false);
    const [stockModal, setStockModal] = useState({ show: false, product: null });
    const [stockForm, setStockForm] = useState({ color: '', size: '', newStock: '' });
    const [stockLoading, setStockLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', mrp: '', category: '', subCategory: '', fabric: '' });
    const [variants, setVariants] = useState([{ color: '', size: '', stock: 0 }]);
    const [imageSlots, setImageSlots] = useState([null, null, null, null, null]);
    const [imagePreviews, setImagePreviews] = useState([null, null, null, null, null]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newSlots = [...imageSlots]; newSlots[index] = file; setImageSlots(newSlots);
            const newPreviews = [...imagePreviews]; newPreviews[index] = URL.createObjectURL(file); setImagePreviews(newPreviews);
        }
    };
    const removeImage = (index) => {
        const newSlots = [...imageSlots]; newSlots[index] = null; setImageSlots(newSlots);
        const newPreviews = [...imagePreviews]; newPreviews[index] = null; setImagePreviews(newPreviews);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const activeImages = imageSlots.filter(img => img !== null);
        if (activeImages.length === 0) { showToast("Please upload at least 1 image", "error"); return; }
        
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('variants', JSON.stringify(variants));
        activeImages.forEach(file => data.append('images', file));

        setIsUploading(true);
        try {
            await API.post(`/api/dashboard/addNewProduct`, data, { 
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
            });
            showToast("Product Published!", "success");
            setIsAdding(false);
            setFormData({ name: '', description: '', price: '', mrp: '', category: '', subCategory: '', fabric: '' });
            setImageSlots([null,null,null,null,null]); setImagePreviews([null,null,null,null,null]);
            refreshData();
        } catch (error) { 
            showToast(error.response?.data?.message || "Failed to add product", "error");
        } finally { setIsUploading(false); setUploadProgress(0); }
    };

    const openStockModal = (product) => {
        setStockModal({ show: true, product });
        setStockForm({ color: '', size: '', newStock: '' });
    };

    const handleUpdateStock = () => {
        if(!stockForm.color || !stockForm.size || !stockForm.newStock) return showToast("All fields required", "error");
        requestConfirm("Update Stock?", `Update ${stockForm.color}-${stockForm.size} to Qty: ${stockForm.newStock}?`, async () => {
            setStockLoading(true);
            try {
                await API.post(`/api/dashboard/admin/update-stock`, { productId: stockModal.product._id, ...stockForm });
                showToast("Stock updated successfully!", "success");
                setStockModal({ show: false, product: null });
                refreshData(); 
            } catch (e) { showToast(e.response?.data?.message || "Failed", "error"); } finally { setStockLoading(false); }
        });
    };

    const confirmDelete = (id) => {
        requestConfirm("Delete Product?", "This action cannot be undone.", async () => {
            setDeleteLoadingId(id);
            try { await API.delete(`/api/dashboard/deleteProduct/${id}`); showToast("Product deleted", "success"); refreshData(); } 
            catch (error) { showToast("Delete failed", "error"); }
            setDeleteLoadingId(null);
        });
    };

    return (
        <div className="pb-10">
             <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
                    <h3 className="font-bold text-2xl text-gray-800 tracking-tight">Products</h3>
                    <div className="relative w-full md:w-auto group">
                        <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-white/60 rounded-xl bg-white/60 backdrop-blur-md text-sm focus:ring-2 ring-indigo-300 outline-none w-full md:w-72 shadow-sm focus:shadow-md transition-all"
                        />
                    </div>
                </div>
                <button onClick={() => setIsAdding(!isAdding)} className="bg-gradient-to-r from-red-600 to-red-400 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all w-full md:w-auto justify-center font-bold">
                    {isAdding ? <X size={20}/> : <Plus size={20}/>} {isAdding ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-2xl max-w-5xl mx-auto mb-8 animate-in slide-in-from-top-4">
                     <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-8">
                        <div className="col-span-2 md:col-span-1 space-y-5">
                            <Input label="Product Name" name="name" val={formData} set={setFormData} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Price" name="price" val={formData} set={setFormData} type="number"/>
                                <Input label="MRP" name="mrp" val={formData} set={setFormData} type="number"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Category</label>
                                    <select className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none bg-white/50" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Sub Category</label>
                                    <select className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none bg-white/50" value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})}>
                                        <option value="">Select Sub-Cat</option>
                                        {SUB_CATEGORIES.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Input label="Fabric" name="fabric" val={formData} set={setFormData} />
                            
                            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                <label className="block text-xs font-bold text-red-500 mb-2">Variants</label>
                                {variants.map((v, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input placeholder="Color" className="border-0 bg-white shadow-sm p-2 rounded-lg w-1/3 text-sm" value={v.color} onChange={e => {const n=[...variants];n[i].color=e.target.value;setVariants(n)}} />
                                        <input placeholder="Size" className="border-0 bg-white shadow-sm p-2 rounded-lg w-1/3 text-sm" value={v.size} onChange={e => {const n=[...variants];n[i].size=e.target.value;setVariants(n)}} />
                                        <input placeholder="Stock" type="number" className="border-0 bg-white shadow-sm p-2 rounded-lg w-1/3 text-sm" value={v.stock} onChange={e => {const n=[...variants];n[i].stock=e.target.value;setVariants(n)}} />
                                    </div>
                                ))}
                                <button type="button" onClick={() => setVariants([...variants, {color:'',size:'',stock:0}])} className="text-xs text-red-500 font-bold mt-1">+ Add Variant</button>
                            </div>
                        </div>

                        <div className="col-span-2 md:col-span-1 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Description</label>
                                <textarea className="w-full p-4 border border-gray-200 rounded-xl h-32 text-sm focus:ring-2 ring-indigo-200 outline-none bg-white/50 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">Images</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-3 h-48 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 flex flex-col justify-center items-center relative overflow-hidden group hover:bg-indigo-50/60 transition">
                                        {imagePreviews[0] ? (
                                            <>
                                                <img src={imagePreviews[0]} alt="Main" className="w-full h-full object-contain" />
                                                <button type="button" onClick={() => removeImage(0)} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full shadow-sm text-red-500"><X size={16}/></button>
                                                <div className="absolute bottom-0 w-full bg-red-500/90 backdrop-blur-sm text-white text-xs text-center py-1 font-bold">Main Display Image</div>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="text-indigo-400 mb-2" size={36} />
                                                <span className="text-xs text-indigo-500 font-bold">Upload Main Image</span>
                                                <input type="file" accept="image/*" onChange={(e) => handleImageChange(0, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </>
                                        )}
                                    </div>
                                    {[1, 2, 3, 4].map((index) => (
                                        <div key={index} className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex justify-center items-center relative overflow-hidden group hover:border-indigo-300 transition bg-white/40">
                                            {imagePreviews[index] ? (
                                                <>
                                                    <img src={imagePreviews[index]} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white/80 p-0.5 rounded-full text-red-500"><X size={12}/></button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs text-gray-300 font-bold">{index + 1}</span>
                                                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isUploading && (
                            <div className="col-span-2 bg-gray-200 rounded-full h-2 overflow-hidden relative">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}

                        <button type="submit" disabled={isUploading} className="col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-xl shadow-lg disabled:opacity-50 flex justify-center items-center gap-2 transition-all">
                            {isUploading ? <Loader2 className="animate-spin" /> : "Publish Product"}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 overflow-auto shadow-xl">
                <table className="w-full text-left text-sm min-w-[600px]">
                    <thead className="bg-white/50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                        <tr>
                            <th className="p-5">Product Details</th>
                            <th className="p-5">Price</th>
                            <th className="p-5">Stock Management</th>
                            <th className="p-5">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {loading ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />) : 
                        products.map((p) => {
                            const totalStock = p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                            const isSoldOut = totalStock === 0;

                            return (
                                <tr key={p._id} className="hover:bg-white/40 transition">
                                    <td className="p-5 font-medium flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm p-1 border border-gray-100 overflow-hidden relative">
                                            <img src={getSafeImageUrl(p)} className="w-full h-full object-cover rounded-lg" alt="" />
                                            {isSoldOut && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[8px] text-white font-bold uppercase">Sold Out</div>}
                                        </div>
                                        <div className="truncate max-w-[180px]">
                                            <p className="text-gray-900 font-bold">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.category}</p>
                                        </div>
                                    </td>
                                    <td className="p-5 font-semibold text-gray-700">₹{p.price}</td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                {p.variants.slice(0, 3).map((v, i) => (
                                                    <span key={i} className={`text-[10px] px-2 py-1 rounded border ${v.stock < 5 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                        {v.color}-{v.size}: <b>{v.stock}</b>
                                                    </span>
                                                ))}
                                                {p.variants.length > 3 && <span className="text-[10px] text-gray-400">+{p.variants.length - 3} more</span>}
                                            </div>
                                            <button onClick={() => openStockModal(p)} className="flex items-center gap-2 text-xs font-bold text-black border border-gray-300 rounded px-3 py-1.5 hover:bg-black hover:text-white transition w-fit">
                                                {stockLoading && stockModal.product?._id === p._id ? <Loader2 className="animate-spin" size={12}/> : <Box size={12}/>} Update Stock
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <button onClick={() => confirmDelete(p._id)} disabled={deleteLoadingId === p._id} className="text-gray-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50">
                                            {deleteLoadingId === p._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18}/>}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            <PaginationControls page={page} setPage={setPage} totalPages={totalPages} />

            {/* --- STOCK UPDATE MODAL (POPUP) --- */}
            {stockModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Update Inventory</h3>
                                <p className="text-xs text-gray-500 mt-1">Manage stock for <b>{stockModal.product.name}</b></p>
                            </div>
                            <button onClick={() => setStockModal({ show: false, product: null })} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={18}/></button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Color</label>
                                    <div className="relative">
                                        <input list={`colors-${stockModal.product._id}`} placeholder="e.g. Red" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition" value={stockForm.color} onChange={(e) => setStockForm({...stockForm, color: e.target.value})}/>
                                        <datalist id={`colors-${stockModal.product._id}`}>
                                            {[...new Set(stockModal.product.variants.map(v => v.color))].map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Size</label>
                                    <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition" value={stockForm.size} onChange={(e) => setStockForm({...stockForm, size: e.target.value})}>
                                        <option value="">Select</option>{["S", "M", "L", "XL", "XXL", "Free Size"].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">New Stock Quantity</label>
                                <input type="number" placeholder="Enter quantity" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition font-bold" value={stockForm.newStock} onChange={(e) => setStockForm({...stockForm, newStock: e.target.value})}/>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 items-start">
                                <Info size={16} className="text-blue-500 mt-0.5 shrink-0"/><p className="text-xs text-blue-600">If this variant exists, stock will be updated. If not, a new variant will be created.</p>
                            </div>
                            <button onClick={handleUpdateStock} className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 shadow-lg shadow-gray-300 transition-all flex justify-center items-center gap-2 mt-4">Update Stock</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. ORDER MANAGER (UPDATED WITH PRINT PACKING SLIP)
// ----------------------------------------------------------------------
function OrderManager({ orders, refreshData, page, setPage, totalPages, requestConfirm, showToast, loading }) {
    const [filterStatus, setFilterStatus] = useState('All'); 
    const [loadingId, setLoadingId] = useState(null); 
    
    const handleStatusUpdate = (orderId, newStatus) => {
        requestConfirm("Update Status?", `Mark Order #${orderId.slice(-6)} as ${newStatus.toUpperCase()}?`, async () => {
            setLoadingId(orderId); 
            try { 
                await API.post(`/api/dashboard/admin/update-order-status`, { orderId, status: newStatus }); 
                showToast(`Order status changed to ${newStatus}`, "success");
                refreshData(); 
            } 
            catch (error) { showToast("Failed to update status", "error"); }
            setLoadingId(null); 
        });
    };

    const filteredOrders = orders.filter(order => filterStatus === 'All' ? true : order.orderStatus === filterStatus.toLowerCase());

    return (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden pb-4">
             <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filterStatus === s ? 'bg-gray-900 text-white shadow-lg' : 'bg-white/50 hover:bg-white text-gray-600'}`}>{s}</button>
                    ))}
                </div>
                <span className="text-xs text-gray-400 font-bold bg-white/50 px-3 py-1 rounded-full">Page {page} / {totalPages}</span>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm min-w-[900px]">
                    <thead className="bg-white/50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="p-5">Order ID / Date</th>
                            <th className="p-5">Packing Details (Items)</th>
                            <th className="p-5">Customer</th>
                            <th className="p-5">Amount</th>
                            <th className="p-5">Status / Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {loading ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5}/>) : 
                        filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-white/40 transition">
                                {/* Order ID (UPDATED: Full ID shown) */}
                                <td className="p-5 align-top">
                                    <div className="font-bold text-gray-800 text-xs font-mono bg-gray-50 p-1 rounded inline-block select-all">{order._id}</div>
                                    <div className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                                        <Clock size={10}/> {format(new Date(order.createdAt), 'dd MMM, hh:mm a')}
                                    </div>
                                    <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {order.paymentMethod}
                                    </span>
                                </td>

                                {/* Packing Details (UPDATED: Product ID Removed) */}
                                <td className="p-5 align-top">
                                    <div className="flex flex-col gap-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 items-center bg-white/60 p-2 rounded-lg border border-gray-100 shadow-sm">
                                                <img src={getSafeImageUrl(item.productId)} className="w-10 h-10 rounded object-cover" alt="img" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-xs text-gray-800 line-clamp-1">{item.productId?.name || "Product Name N/A"}</p>
                                                    <div className="flex gap-2 text-[11px] text-gray-600 mt-0.5">
                                                        <span className="bg-gray-100 px-1.5 rounded border border-gray-200">Size: <b>{item.size}</b></span>
                                                        <span className="bg-gray-100 px-1.5 rounded border border-gray-200">Color: <b>{item.color}</b></span>
                                                        <span className="bg-indigo-50 text-indigo-700 px-1.5 rounded border border-indigo-100">Qty: <b>{item.quantity}</b></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>

                                {/* Customer Info */}
                                <td className="p-5 align-top">
                                    <div className="font-semibold text-gray-800 text-xs">{order.userId?.username}</div>
                                    <div className="text-[11px] text-gray-500 break-words max-w-[150px]">{order.userId?.email}</div>
                                    <div className="mt-2 text-[11px] text-gray-600 bg-gray-50 p-1.5 rounded border">
                                        {order.addressId?.city}, {order.addressId?.state}<br/>
                                        <b>PIN: {order.addressId?.pincode}</b>
                                    </div>
                                </td>

                                <td className="p-5 align-top font-bold text-gray-700">₹{order.totalAmount}</td>

                                <td className="p-5 align-top">
                                    <div className="flex flex-col gap-3">
                                        {/* Status Dropdown */}
                                        <div className="relative">
                                            {loadingId === order._id && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10"><Loader2 className="animate-spin text-indigo-600" size={16}/></div>}
                                            <select 
                                                value={order.orderStatus} 
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                disabled={loadingId === order._id}
                                                className={`w-full p-2 pl-3 pr-8 rounded-xl text-xs font-bold outline-none border cursor-pointer transition disabled:opacity-50 appearance-none shadow-sm ${
                                                    order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                    order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                                                }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none"/>
                                        </div>

                                        {/* PRINT BUTTON (New) */}
                                        <button 
                                            onClick={() => handlePrintPackingSlip(order)}
                                            className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-black transition shadow-md"
                                        >
                                            <Printer size={14}/> Print Slip
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
             <PaginationControls page={page} setPage={setPage} totalPages={totalPages} />
        </div>
    );
}

// ----------------------------------------------------------------------
// 4. SETTINGS (Unchanged)
// ----------------------------------------------------------------------
function SettingsManager({ requestConfirm, showToast }) {
    const [pincodes, setPincodes] = useState([]);
    const [newPincode, setNewPincode] = useState({ pincode: '', city: '', state: '' });
    const [loadingAction, setLoadingAction] = useState(null); 
    const [loading, setLoading] = useState(true);
    
    const fetchPincodes = async () => {
        try { const res = await API.get('/api/dashboard/admin/all-pincodes'); if(res.data.success) setPincodes(res.data.areas); } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { fetchPincodes(); }, []);

    const handleAddPincode = async (e) => {
        e.preventDefault();
        requestConfirm("Add Pincode?", `Add ${newPincode.pincode}?`, async () => {
            setLoadingAction('add');
            try { 
                await API.post('/api/dashboard/admin/add-pincode', newPincode); 
                showToast("Pincode added successfully", "success");
                setNewPincode({ pincode: '', city: '', state: '' }); fetchPincodes(); 
            } 
            catch (e) { showToast(e.response?.data?.message || "Error", "error"); }
            setLoadingAction(null);
        });
    };

    const toggleStatus = (pincode, currentStatus) => {
        requestConfirm(currentStatus ? "Disable?" : "Enable?", `Toggle ${pincode}?`, async () => {
            setLoadingAction(pincode);
            try { 
                await API.post('/api/dashboard/admin/updateDeliveryAvlabelStatus', { pincode, DeliveryAvlabelStatus: !currentStatus }); 
                showToast("Status updated", "success"); fetchPincodes(); 
            } 
            catch (e) { showToast("Update failed", "error"); }
            setLoadingAction(null);
        });
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-gray-800"><MapPin size={24} className="text-indigo-500"/> Add Service Area</h3>
                <form onSubmit={handleAddPincode} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full"><Input label="Pincode" name="pincode" val={newPincode} set={setNewPincode} /></div>
                    <div className="flex-1 w-full"><Input label="City" name="city" val={newPincode} set={setNewPincode} /></div>
                    <div className="flex-1 w-full"><Input label="State" name="state" val={newPincode} set={setNewPincode} /></div>
                    <button type="submit" disabled={loadingAction === 'add'} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 transition flex items-center gap-2 w-full md:w-auto justify-center shadow-lg">
                        {loadingAction === 'add' ? <Loader2 className="animate-spin" size={20}/> : "Add"}
                    </button>
                </form>
            </div>

            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50">
                <h3 className="font-bold text-xl mb-6 text-gray-800">Serviceable Areas</h3>
                {loading ? <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><Skeleton key={i} className="h-20"/>)}</div> :
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pincodes.map((area) => (
                        <div key={area._id} className="border border-white/60 bg-white/40 p-5 rounded-2xl flex justify-between items-center hover:bg-white/80 hover:shadow-md transition">
                            <div><h4 className="font-bold text-lg text-gray-800">{area.pincode}</h4><p className="text-xs text-gray-500 font-medium">{area.city}, {area.state}</p></div>
                            <button onClick={() => toggleStatus(area.pincode, area.DeliveryAvlabelStatus)} disabled={loadingAction === area.pincode} className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition min-w-[90px] justify-center ${area.DeliveryAvlabelStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {loadingAction === area.pincode ? <Loader2 className="animate-spin" size={12}/> : (area.DeliveryAvlabelStatus ? 'Active' : 'Inactive')}
                            </button>
                        </div>
                    ))}
                </div>}
            </div>
        </div>
    );
}

// Helper Components
function PaginationControls({ page, setPage, totalPages }) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-100/50">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-full hover:bg-white hover:shadow-md disabled:opacity-30 text-gray-600 transition"><ChevronLeft size={20}/></button>
            <span className="text-sm font-bold text-gray-600 bg-white/50 px-3 py-1 rounded-lg">Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-full hover:bg-white hover:shadow-md disabled:opacity-30 text-gray-600 transition"><ChevronRight size={20}/></button>
        </div>
    );
}
function SidebarBtn({ label, icon: Icon, id, activeTab, setTab }) {
    const isActive = activeTab === id;
    return (
        <button onClick={() => setTab(id)} className={`w-full flex  justify-center md:justify-start  rounded-t-xl border-b md:border-none md:rounded-none border-black  m-3 items-center md:gap-4 md:px-6 md:py-3.5    transition-all duration-300 font-bold ${isActive ? ' bg-black border border-gray-500 text-white shadow-lg shadow-indigo-200 scale-105' : 'text-gray-500 hover:bg-white/60 hover:text-indigo-600'}`}>
            <Icon size={20} /> <span className="text-sm tracking-wide hidden md:flex">{label}</span>
        </button>
    );
}
function StatCard({ title, value, icon: Icon, color, isDark }) {
    return (
        <div className={`p-6 rounded-3xl shadow-lg flex items-center justify-between h-full transition-all hover:-translate-y-1 duration-300 ${color}`}>
            <div><p className={`text-xs font-bold uppercase mb-1 tracking-wider ${isDark ? 'opacity-80' : 'text-gray-400'}`}>{title}</p><h3 className="text-3xl font-black">{value}</h3></div>
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/20' : 'bg-gray-100'}`}><Icon size={24} /></div>
        </div>
    );
}
function MiniStatCard({ label, value, icon: Icon, color }) {
    return (
        <div className={`p-4 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-sm flex items-center gap-4 shadow-sm hover:shadow-md transition`}>
            <div className={`p-2.5 rounded-xl ${color}`}><Icon size={20} /></div>
            <div><p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">{label}</p><h4 className="text-xl font-bold text-gray-800">{value}</h4></div>
        </div>
    );
}
function Input({ label, name, type = "text", val, set }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">{label}</label>
            <input type={type} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none bg-white/50 transition shadow-sm" value={val[name]} onChange={(e) => set({ ...val, [name]: e.target.value })} />
        </div>
    );
}

export default DashboardPage;