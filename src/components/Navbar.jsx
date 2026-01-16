import React, { useState, useEffect, useRef } from 'react'
import {
    User, Heart, Handbag, Search, Menu, X, ChevronRight, Clock, Trash2, ArrowRight,
    Box, MapPin, Settings, Key, LogOut, LayoutDashboard,
    User2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from './auth/Login'
import Registration from './auth/Registration'
import { BASE_URL } from '../api/baseUrl'

// NOTE: Apne API ka base URL yahan set karein
const API_BASE_URL = "http://localhost:5000/api/dashboard";

function Navbar() {
    const navigate = useNavigate()
    const { user, showAuth, setShowAuth, isLoginView, setIsLoginView, logout } = useAuth()

    // --- STATES ---
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searchHistory, setSearchHistory] = useState([])
    const [loading, setLoading] = useState(false)

    const searchTimeout = useRef(null)

    // --- USE EFFECTS ---
    useEffect(() => {
        const storedHistory = localStorage.getItem('userSearchHistory')
        if (storedHistory) {
            setSearchHistory(JSON.parse(storedHistory))
        }
    }, [])

    // --- FUNCTIONS ---

    const showUser = () => {
        if (user === null) return setShowAuth(true)
        navigate('/user')
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
        setIsSearchOpen(false)
    }

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen)
        setIsMenuOpen(false)
        if (!isSearchOpen) {
            setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
        }
    }

    // Logout Function for Mobile Menu
    const handleLogout = () => {
        logout(); // Context se logout call
        setIsMenuOpen(false);
        navigate('/');
    }

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length > 1) {
            setLoading(true);
            searchTimeout.current = setTimeout(async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/dashboard/search?query=${query}`);
                    const data = await res.json();
                    if (data.success) {
                        setSearchResults(data.products);
                    }
                } catch (error) {
                    console.error("Search Error", error);
                    const errorMessage = error.response?.data?.message; // Ye line zaroori hai error padhne ke liye

                    if (errorMessage === "jwt expired" || errorMessage === "UnAuthroize request") {
                        // Make sure refreshExpriedToken context me defined ho
                        const refresh = await refreshExpriedToken();
                        if (refresh) {
                            handleSearchChange(); // ID paas karna zaroori hai retry ke liye
                        } else {
                            return navigate('/')
                        }
                    }
                } finally {
                    setLoading(false);
                }
            }, 500);
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectProduct = (product) => {
        addToHistory(product.name);
        setIsSearchOpen(false);
        setIsMenuOpen(false);
        // Search Results Page par bhejo
        navigate(`/product/all?search=${encodeURIComponent(product.name)}`);
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            addToHistory(searchQuery);
            navigate(`/product/all?search=${searchQuery}`);
            setIsSearchOpen(false);
        }
    }

    const addToHistory = (term) => {
        let newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('userSearchHistory', JSON.stringify(newHistory));
    }

    const deleteHistoryItem = (e, term) => {
        e.stopPropagation();
        const newHistory = searchHistory.filter(h => h !== term);
        setSearchHistory(newHistory);
        localStorage.setItem('userSearchHistory', JSON.stringify(newHistory));
    }

    const clearAllHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('userSearchHistory');
    }

    return (
        <>
            {showAuth ? isLoginView ? (
                <Login setIsLoginView={setIsLoginView} setShowAuth={setShowAuth} />
            ) : (
                <Registration setIsLoginView={setIsLoginView} setShowAuth={setShowAuth} />
            ) : null}

            {/* --- MAIN NAVBAR --- */}
            <div className='h-16 md:h-20 w-full p-3 flex items-center font-sans fixed bg-white z-40 shadow-sm transition-all'>

                <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-[0%] md:w-[20%] opacity-0 md:opacity-100 overflow-hidden' : 'w-[50%]'}`}>
                    <Link to='/'>
                        <img src="https://res.cloudinary.com/drrj8rl9n/image/upload/v1763718042/Gemini_Generated_Image_saghf3saghf3sagh_whaulb.jpg" alt="logo" className='w-20 min-w-[80px]' />
                    </Link>
                    <div className='hidden md:flex gap-7 mx-5'>
                        {!isSearchOpen && (
                            <>
                                <Link to='/product/all' className='hover:underline uppercase text-sm'>All</Link>
                                <Link to='/product/Women' className='hover:underline uppercase text-sm'>Women</Link>
                                <Link to='/product/Men' className='hover:underline uppercase text-sm'>Men</Link>
                            </>
                        )}
                    </div>
                </div>

                <div className={`flex items-center justify-end transition-all duration-300 ${isSearchOpen ? 'w-[100%] md:w-[80%]' : 'w-[50%]'}`}>

                    {isSearchOpen ? (
                        <div className="relative w-full flex items-center gap-2">
                            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    id="searchInput"
                                    type="text"
                                    className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-10 focus:outline-none focus:border-black transition-all"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    autoFocus
                                />
                                {searchQuery && (
                                    <X
                                        size={16}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                                        onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                                    />
                                )}
                            </form>
                            <button onClick={() => setIsSearchOpen(false)} className="text-sm uppercase font-bold hover:underline whitespace-nowrap">Cancel</button>

                            {/* Desktop Search Dropdown */}
                            <div className="absolute top-12 left-0 w-full bg-white shadow-xl rounded-lg border border-gray-100 max-h-[400px] overflow-y-auto z-50">
                                {loading && <div className="p-4 text-center text-gray-500">Searching...</div>}

                                {!loading && searchResults.length > 0 && (
                                    <div className="p-2">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">Suggestions</h3>
                                        {searchResults.map((prod) => (
                                            <div key={prod._id} onClick={() => handleSelectProduct(prod)} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded-md">
                                                {prod.images && prod.images[0] && (
                                                    <img src={prod.images[0].url} alt="" className="w-10 h-10 object-cover rounded" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{prod.name}</p>
                                                    <p className="text-xs text-gray-500">{prod.category}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Desktop History (Only if no results) */}
                                {!loading && searchResults.length === 0 && searchHistory.length > 0 && (
                                    <div className="p-2 border-t">
                                        <div className="flex justify-between items-center px-2 mb-2">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase">Recent Searches</h3>
                                            <button onClick={clearAllHistory} className="text-xs text-red-500 hover:underline">Clear All</button>
                                        </div>
                                        {searchHistory.map((term, index) => (
                                            <div key={index} onClick={() => { setSearchQuery(term); handleSearchChange({ target: { value: term } }) }} className="flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer rounded-md group">
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <Clock size={16} />
                                                    <span className="text-sm">{term}</span>
                                                </div>
                                                <Trash2 size={14} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteHistoryItem(e, term)} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center gap-5 md:gap-8'>
                            <button onClick={toggleSearch}><Search size={20} className='stroke-1' /></button>
                            <div onClick={showUser} className='cursor-pointer block'>
                                <User size={20} className='stroke-1' />
                            </div>
                            <Link to='/like'><Heart size={20} className='stroke-1' /></Link>
                            <Link to='/cart'><Handbag size={20} className='stroke-1' /></Link>
                           
                        </div>
                    )}
                </div>
            </div>

            <div className=' h-28 md:h-20 w-full'></div>
            {/* phone mode serch filder */}
            <div
                className='md:hidden flex gap-7  px-4
                           justify-center items-center h-10
                           fixed top-16 bg-white
                           z-20
                          w-full  text-black  '>
                <Link to='/product/all' className=' hover:underline uppercase '>All</Link>
                <Link to='/product/Women' className=' hover:underline uppercase '>Women</Link>
                <Link to='/product/Men' className=' hover:underline uppercase '>Men</Link>
                <Link to='/product/Kids' className=' hover:underline uppercase '>Kids</Link>
                <Link to='/product/Accessories' className=' hover:underline uppercase '>Accessories</Link>

            </div>
            {/* --- MOBILE SEARCH DRAWER --- */}
            <div className={`fixed inset-0 bg-white z-[60] flex flex-col transition-transform duration-300 ${isSearchOpen && window.innerWidth < 768 ? 'translate-y-0' : '-translate-y-full'} md:hidden`}>
                <div className="flex items-center p-4 border-b gap-3">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        className="flex-1 text-lg outline-none placeholder:text-gray-400"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        autoFocus={isSearchOpen}
                    />
                    <button onClick={() => setIsSearchOpen(false)}><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading && <div className="text-center text-gray-500 mt-5">Searching...</div>}

                    {!loading && searchResults.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Suggestions</h3>
                            {searchResults.map((prod) => (
                                <div key={prod._id} onClick={() => handleSelectProduct(prod)} className="flex items-center gap-4 py-3 border-b border-gray-50">
                                    {prod.images && prod.images[0] && (
                                        <img src={prod.images[0].url} alt="" className="w-12 h-12 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-base font-medium">{prod.name}</p>
                                        <p className="text-xs text-gray-500">{prod.category}</p>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-300" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && searchResults.length === 0 && searchHistory.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase">Recent Searches</h3>
                                <button onClick={clearAllHistory} className="text-xs text-red-500">Clear All</button>
                            </div>
                            {searchHistory.map((term, index) => (
                                <div key={index} onClick={() => { setSearchQuery(term); handleSearchChange({ target: { value: term } }) }} className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Clock size={18} />
                                        <span className="text-base">{term}</span>
                                    </div>
                                    <button onClick={(e) => deleteHistoryItem(e, term)} className="p-2">
                                        <X size={16} className="text-gray-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MOBILE SIDEBAR MENU (Full Features) --- */}
            <div className={`fixed top-0 left-0 h-full w-full bg-white z-[60] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-xl font-bold uppercase tracking-wider">Menu</h2>
                    <button onClick={toggleMenu} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-6 overflow-y-auto h-[calc(100vh-80px)] pb-20">

                   

                    {/* 2. ADMIN DASHBOARD LINK (Only for Admin/Owner) */}
                    {/* Logic: Check if user role is admin or owner */}
                    {user && (user?.role === 'admin' || user?.role === 'owner') && (
                        <div className='bg-black text-white rounded-lg overflow-hidden'>
                            <Link to='/dashboard' onClick={toggleMenu} className='flex items-center gap-3 p-4 hover:bg-gray-800'>
                                <LayoutDashboard size={20} />
                                <span className='font-bold uppercase tracking-wide'>Admin Dashboard</span>
                            </Link>
                        </div>
                    )}
                    {/* 4. MY ACCOUNT (Visible only if logged in) */}
                    {user && (
                        <div className='mt-2'>
                            <h3 className='text-gray-400 uppercase text-xs tracking-widest mb-4 font-bold'>My Account</h3>
                            
                        </div>
                    )}
                    {/* 3. SHOP Categories */}
                    <div>
                        <h3 className='text-gray-400 uppercase text-xs tracking-widest mb-4 font-bold'>Shop</h3>
                        <div className='flex flex-col gap-2'>
                            <Link to='/product/all' onClick={toggleMenu} className='text-lg font-medium py-2 border-b border-gray-100 flex justify-between'>All Products <ChevronRight size={18} className="text-gray-300" /></Link>
                            <Link to='/product/Women' onClick={toggleMenu} className='text-lg font-medium py-2 border-b border-gray-100 flex justify-between'>Women <ChevronRight size={18} className="text-gray-300" /></Link>
                            <Link to='/product/Men' onClick={toggleMenu} className='text-lg font-medium py-2 border-b border-gray-100 flex justify-between'>Men <ChevronRight size={18} className="text-gray-300" /></Link>
                            <Link to='/product/Kids' onClick={toggleMenu} className='text-lg font-medium py-2 border-b border-gray-100 flex justify-between'>Kids <ChevronRight size={18} className="text-gray-300" /></Link>
                            <Link to='/product/Accessories' onClick={toggleMenu} className='text-lg font-medium py-2 border-b border-gray-100 flex justify-between'>Accessories <ChevronRight size={18} className="text-gray-300" /></Link>
                        </div>
                    </div>


                </div>
            </div>
        </>
    )
}

export default Navbar