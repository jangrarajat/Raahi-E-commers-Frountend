import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Package, 
    Users, 
    TrendingUp, 
    MapPin, 
    Home,
    Plus, 
    Search,
    Trash2,
    CheckCircle,
    XCircle,
    Edit
} from 'lucide-react'

// --- DUMMY DATA (Backend se replace karein) ---
const initialOrders = [
    { id: '#1001', customer: 'Rajat Jangra', product: 'Oversized Tee (Black)', amount: '₹899', status: 'Pending', date: '12 Jan, 2026' },
    { id: '#1002', customer: 'Amit Kumar', product: 'Cargo Pants (Green)', amount: '₹1499', status: 'Shipped', date: '11 Jan, 2026' },
    { id: '#1003', customer: 'Rahul Sharma', product: 'Denim Jacket', amount: '₹2200', status: 'Delivered', date: '10 Jan, 2026' },
]

const initialPincodes = [
    { code: '301001', city: 'Alwar', active: true },
    { code: '110001', city: 'Delhi', active: true },
    { code: '400001', city: 'Mumbai', active: false }, // Currently not delivering
]

const initialProducts = [
    { id: 1, name: 'Basic Black Tee', price: '₹499', stock: 120, category: 'Men' },
    { id: 2, name: 'Slim Fit Jeans', price: '₹1299', stock: 45, category: 'Men' },
]

function DashboardPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('dashboard') // Konsa page dikhana hai

    // --- RENDER CONTENT FUNCTION (Switch Case) ---
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardOverview setActiveTab={setActiveTab} />
            case 'products': return <ProductManager />
            case 'orders': return <OrderManager />
            case 'customers': return <CustomerManager />
            case 'pincodes': return <PincodeManager />
            case 'analytics': return <AnalyticsView />
            default: return <DashboardOverview />
        }
    }

    return (
        <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="h-20 flex items-center justify-center border-b border-zinc-100">
                        <h1 className="text-2xl font-bold tracking-tighter uppercase">RAAHI <span className='font-light'>ADMIN</span></h1>
                    </div>
                    <nav className="p-4 space-y-2 mt-4">
                        <SidebarBtn label="Dashboard" icon={LayoutDashboard} id="dashboard" activeTab={activeTab} setTab={setActiveTab} />
                        <SidebarBtn label="Products" icon={Package} id="products" activeTab={activeTab} setTab={setActiveTab} />
                        <SidebarBtn label="Orders" icon={ShoppingBag} id="orders" activeTab={activeTab} setTab={setActiveTab} />
                        <SidebarBtn label="Customers" icon={Users} id="customers" activeTab={activeTab} setTab={setActiveTab} />
                        <SidebarBtn label="Delivery Pincodes" icon={MapPin} id="pincodes" activeTab={activeTab} setTab={setActiveTab} />
                        <SidebarBtn label="Analytics" icon={TrendingUp} id="analytics" activeTab={activeTab} setTab={setActiveTab} />
                    </nav>
                </div>

                {/* Home / Back Button */}
                <div className="p-4 border-t border-zinc-100">
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all"
                    >
                        <Home size={20} />
                        <span className="font-medium">Back to Website</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <h2 className="text-xl font-bold uppercase tracking-wide">{activeTab.replace('-', ' ')}</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">R</div>
                    </div>
                </header>

                {/* Dynamic Content Body */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-50 p-8 [&::-webkit-scrollbar]:hidden">
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTS (Views) ---

// 1. DASHBOARD HOME
function DashboardOverview({ setActiveTab }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Sales" value="₹45,200" color="bg-zinc-900 text-white" />
                <StatCard title="New Orders" value="12" color="bg-white border border-zinc-200" />
                <StatCard title="Pending Delivery" value="5" color="bg-white border border-zinc-200" />
                <StatCard title="Active Pincodes" value="150" color="bg-white border border-zinc-200" />
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-zinc-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm text-zinc-500 hover:text-black underline">View All</button>
                </div>
                <OrderTable orders={initialOrders.slice(0, 3)} />
            </div>
        </div>
    )
}

// 2. PRODUCT MANAGER (Add & List)
function ProductManager() {
    const [isAdding, setIsAdding] = useState(false) // Toggle Add Form
    const [products, setProducts] = useState(initialProducts)

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <input placeholder="Search products..." className="px-4 py-2 border rounded-lg bg-white outline-none focus:border-black" />
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-black text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-zinc-800"
                >
                    {isAdding ? <XCircle size={18}/> : <Plus size={18}/>} 
                    {isAdding ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {isAdding ? (
                <div className="bg-white p-8 rounded-xl border border-zinc-200 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-xl font-bold mb-6">Add New Product</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Product Name</label>
                            <input className="w-full p-2 border rounded-md outline-none focus:border-black" placeholder="Ex: Oversized T-shirt" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Price (₹)</label>
                            <input className="w-full p-2 border rounded-md outline-none focus:border-black" placeholder="999" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock Qty</label>
                            <input className="w-full p-2 border rounded-md outline-none focus:border-black" placeholder="50" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea className="w-full p-2 border rounded-md outline-none focus:border-black" rows="3"></textarea>
                        </div>
                        <button className="col-span-2 bg-black text-white py-3 rounded-md font-bold hover:bg-zinc-800 mt-2">Publish Product</button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                                    <td className="p-4 font-medium">{p.name}</td>
                                    <td className="p-4">{p.price}</td>
                                    <td className="p-4">{p.stock} units</td>
                                    <td className="p-4">{p.category}</td>
                                    <td className="p-4"><button className="text-blue-600 hover:underline">Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// 3. PINCODE MANAGER (Delivery)
function PincodeManager() {
    const [pincodes, setPincodes] = useState(initialPincodes)
    const [newCode, setNewCode] = useState('')
    const [newCity, setNewCity] = useState('')

    const addPincode = () => {
        if(!newCode) return;
        setPincodes([...pincodes, { code: newCode, city: newCity || 'India', active: true }])
        setNewCode(''); setNewCity('')
    }

    const toggleStatus = (index) => {
        const newPins = [...pincodes];
        newPins[index].active = !newPins[index].active;
        setPincodes(newPins)
    }

    const deletePin = (index) => {
        const newPins = pincodes.filter((_, i) => i !== index);
        setPincodes(newPins);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Add New Section */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 h-fit">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20}/> Add Delivery Area</h3>
                <div className="space-y-3">
                    <input 
                        value={newCode} onChange={(e) => setNewCode(e.target.value)}
                        placeholder="Enter Pincode (e.g. 301001)" 
                        className="w-full p-2 border rounded-md outline-none focus:border-black" 
                    />
                    <input 
                        value={newCity} onChange={(e) => setNewCity(e.target.value)}
                        placeholder="City Name (Optional)" 
                        className="w-full p-2 border rounded-md outline-none focus:border-black" 
                    />
                    <button onClick={addPincode} className="w-full bg-black text-white py-2 rounded-md font-medium">Add Pincode</button>
                </div>
            </div>

            {/* List Section */}
            <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase">
                        <tr>
                            <th className="p-4">Pincode</th>
                            <th className="p-4">City</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pincodes.map((pin, i) => (
                            <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50">
                                <td className="p-4 font-bold">{pin.code}</td>
                                <td className="p-4 text-zinc-600">{pin.city}</td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => toggleStatus(i)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${pin.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {pin.active ? 'Available' : 'Unavailable'}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => deletePin(i)} className="text-zinc-400 hover:text-red-600"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// 4. ORDER MANAGER
function OrderManager() {
    const [orders, setOrders] = useState(initialOrders)

    const updateStatus = (id, newStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200">
             {/* Filter Tabs Mockup */}
             <div className="flex border-b border-zinc-100">
                <button className="px-6 py-3 border-b-2 border-black font-bold text-sm">All Orders</button>
                <button className="px-6 py-3 text-zinc-500 hover:text-black font-medium text-sm">New</button>
                <button className="px-6 py-3 text-zinc-500 hover:text-black font-medium text-sm">Delivered</button>
             </div>
             
             <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-100">
                    <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Product</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status (Click to Change)</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                            <td className="p-4 font-bold">{order.id}</td>
                            <td className="p-4">{order.customer}</td>
                            <td className="p-4">{order.product}</td>
                            <td className="p-4">{order.amount}</td>
                            <td className="p-4">
                                <select 
                                    value={order.status} 
                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold outline-none cursor-pointer appearance-none
                                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                                          'bg-green-100 text-green-700'}`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    )
}

// 5. CUSTOMERS & ANALYTICS PLACEHOLDERS
function CustomerManager() {
    return <div className="p-10 text-center text-zinc-400">Customer List Implementation Here (Table)</div>
}
function AnalyticsView() {
    return <div className="p-10 text-center text-zinc-400">Graphs & Charts Implementation Here</div>
}

// --- HELPER COMPONENTS ---
function SidebarBtn({ label, icon: Icon, id, activeTab, setTab }) {
    const isActive = activeTab === id;
    return (
        <button 
            onClick={() => setTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
            ${isActive ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'}`}
        >
            <Icon size={20} className={isActive ? 'text-white' : 'text-zinc-500 group-hover:text-black'} />
            <span className="font-medium text-sm tracking-wide">{label}</span>
        </button>
    )
}

function StatCard({ title, value, color }) {
    return (
        <div className={`p-6 rounded-xl shadow-sm ${color} flex flex-col justify-between h-32`}>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
        </div>
    )
}

function OrderTable({ orders }) {
    return (
        <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
                <tr><th className="p-3">Order</th><th className="p-3">Status</th><th className="p-3">Total</th></tr>
            </thead>
            <tbody>
                {orders.map((o, i) => (
                    <tr key={i} className="border-b border-zinc-100"><td className="p-3">{o.product}</td><td className="p-3">{o.status}</td><td className="p-3">{o.amount}</td></tr>
                ))}
            </tbody>
        </table>
    )
}

export default DashboardPage