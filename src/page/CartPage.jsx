import React, { useMemo } from 'react'
import { useShop } from '../context/ShopContext'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import FilterNav from '../components/FilterNav'

function CartPage() {
    const { isLiked, isCart, addToCart, toggleLike, cart } = useShop()
    const navigate = useNavigate()

    // --- HELPER: SAFE IMAGE URL ---
    const getSafeImageUrl = (item) => {
        try {
            if (!item) return "https://via.placeholder.com/300?text=No+Data";
            
            if (item.images && item.images.length > 0) {
                const img = item.images[0];
                if (typeof img === 'object') return (img.url || img.secure_url || "").replace("http://", "https://");
                if (typeof img === 'string') return img.replace("http://", "https://");
            }
            
            if (item.imageUrl) {
                return item.imageUrl.replace("http://", "https://");
            }
            
            return "https://via.placeholder.com/300?text=No+Image";
        } catch (err) {
            return "https://via.placeholder.com/300?text=Error";
        }
    };

    // --- CALCULATE TOTAL PRICE ---
    const totalAmount = useMemo(() => {
        return cart.reduce((acc, item) => {
            // FIX: Ensure product exists properly
            const product = (item.productId && typeof item.productId === 'object') ? item.productId : item;
            
            // Agar product valid nahi hai (e.g. deleted from DB), to price 0 maano
            if (!product || !product.name) return acc;

            return acc + (product.price || 0);
        }, 0);
    }, [cart]);

    const handleCheckout = () => {
        navigate('/checkout'); 
    };

    // --- FILTER VALID ITEMS ONLY ---
    // Ye line ensure karegi ki 'items' count me bhi wahi dikhe jo valid hain
    const validCartItems = cart.filter(item => {
        const p = item.productId || item;
        return p && p.name; // Jiska naam hai wahi valid hai
    });

    return (
        <div className="w-full min-h-screen bg-white flex flex-col md:flex-row p-5 relative">
          
            
            <div className='w-full flex flex-col gap-5 md:px-10'>
                {/* Header Section */}
                <div className='flex justify-between items-end border-b pb-4'>
                    <div>
                        <h1 className='uppercase font-bold text-4xl md:text-5xl'>Shopping Bag</h1>
                        <p className='uppercase text-gray-500 mt-2 font-medium'>{validCartItems.length} Items</p>
                    </div>
                    
                    {/* Desktop Checkout Button */}
                    {validCartItems.length > 0 && (
                        <div className='hidden md:block text-right'>
                            <p className='text-xl font-bold mb-2'>Total: ₹{totalAmount}</p>
                            <button 
                                onClick={handleCheckout}
                                className='bg-black text-white px-8 py-3 uppercase font-bold hover:bg-gray-800 transition-colors flex items-center gap-2'
                            >
                                Checkout <ArrowRight size={18}/>
                            </button>
                        </div>
                    )}
                </div>

                {/* Free Shipping Banner */}
                {validCartItems.length > 0 && (
                    <div className='w-full flex justify-center items-center uppercase h-12 bg-gray-50 border border-gray-200 text-sm font-medium tracking-wide'>
                        {totalAmount > 1999 ? "✅ You are eligible for Free Shipping!" : `Add items worth ₹${1999 - totalAmount} more for Free Shipping`}
                    </div>
                )}

                {/* Empty Cart Message */}
                {validCartItems.length === 0 && (
                    <div className='flex flex-col items-center justify-center h-60 gap-4'>
                        <h1 className='font-medium text-2xl uppercase text-gray-400'>Your shopping bag is empty.</h1>
                        <Link to="/product/all" className='uppercase underline font-bold'>Browse Products</Link>
                    </div>
                )}

                {/* Cart Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 mt-5 mb-24">
                    {cart.map((item) => {
                        // FIX: Logic sudhara hai taaki ghost cards na banein
                        const product = (item.productId && typeof item.productId === 'object') ? item.productId : item;
                        
                        // STRICT CHECK: Agar product data corrupt hai ya delete ho gaya hai, to render mat karo
                        if(!product || !product.name || !product._id) return null; 

                        const imageUrl = getSafeImageUrl(product);

                        return (
                            <div key={item._id || Math.random()} className="w-full group">
                                <div className="relative w-full h-72 md:h-[400px] bg-gray-100 overflow-hidden">
                                    <Link to={`/product/details/${product._id}`}>
                                        <img 
                                            src={imageUrl} 
                                            alt={product.name}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </Link>
                                    
                                    <button 
                                        onClick={() => addToCart(product._id)}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors"
                                        title="Remove from Cart"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="w-full flex flex-col pt-3">
                                    <h2 className="font-bold text-sm uppercase truncate">{product.name}</h2>
                                    <p className="text-xs text-gray-500 uppercase truncate">{product.subCategory?.name || "Collection"}</p>

                                    <div className="flex justify-between items-center mt-2">
                                        <p className="font-bold text-md">₹{product.price}</p>
                                        
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleLike(product._id)}
                                                className={`p-2 border rounded-full transition-colors ${isLiked(product._id) ? "bg-black text-white border-black" : "bg-white text-black hover:bg-gray-100"}`}
                                            >
                                                <Heart size={14} fill={isLiked(product._id) ? "white" : "none"} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Sticky Checkout Button */}
                {validCartItems.length > 0 && (
                    <div className='md:hidden fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'>
                        <div>
                            <p className='text-xs text-gray-500 uppercase'>Total</p>
                            <p className='text-xl font-bold'>₹{totalAmount}</p>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            className='bg-black text-white px-8 py-3 uppercase font-bold text-sm'
                        >
                            Checkout
                        </button>
                    </div>
                )}
                
                <div className='mt-10 border-t pt-5'>
                    <h1 className='uppercase text-xs font-bold text-gray-400'>
                        Secure Checkout via HM.com/Payment
                    </h1>
                </div>
            </div>
        </div>
    )
}

export default CartPage