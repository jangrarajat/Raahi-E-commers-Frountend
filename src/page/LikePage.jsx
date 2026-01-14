import React from 'react'
import { useShop } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import FilterNav from '../components/FilterNav'

function LikePage() {
    const { likelist, isLiked, isCart, addToCart, toggleLike } = useShop()

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

    // Filter valid items first to avoid count mismatch
    const validLikeItems = likelist.filter(item => {
        const p = (item.productId && typeof item.productId === 'object') ? item.productId : item;
        return p && p.name; // Only count items that have a name
    });

    return (
        <div className="w-full min-h-screen bg-white flex flex-col md:flex-row p-5">
            <FilterNav/>
            
            <div className='w-full flex flex-col gap-5 md:px-10'>
                {/* Header */}
                <div className='border-b pb-4'>
                    <h1 className='uppercase font-bold text-4xl md:text-5xl'>Favourites</h1>
                    <h1 className='uppercase text-gray-500 mt-2 font-medium'>
                        {validLikeItems.length} Items
                    </h1>
                </div>

                {/* Empty State */}
                {validLikeItems.length === 0 && (
                    <div className='flex flex-col gap-5 justify-center items-center h-64 text-center'>
                        <h1 className='text-xl text-gray-600'>Tap the heart icon on items to save them here.</h1>
                        <Link to="/product/all">
                            <button className='uppercase font-bold border border-black px-10 py-4 hover:bg-black hover:text-white transition-all'>
                                Explore R&M
                            </button>
                        </Link>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 mt-5 mb-20">
                    {likelist.map((item) => {
                        // FIX: Logic sudhara hai
                        const product = (item.productId && typeof item.productId === 'object') ? item.productId : item;
                        
                        // STRICT CHECK: Agar product data valid nahi hai to render mat karo
                        if(!product || !product.name || !product._id) return null;

                        const imageUrl = getSafeImageUrl(product);

                        return (
                            <div key={item._id || Math.random()} className="w-full group">
                                <Link to={`/product/details/${product._id}`}>
                                    <div
                                        className="w-full h-72 md:h-[400px] bg-gray-100 overflow-hidden relative"
                                    >
                                        <img 
                                            src={imageUrl} 
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                </Link>

                                <div className="w-full flex flex-col pt-3">
                                    <h2 className="font-bold text-sm uppercase truncate">{product.name}</h2>
                                    <p className="text-xs text-gray-500 uppercase truncate">{product.subCategory?.name || "Collection"}</p>

                                    <div className="w-full flex justify-between items-center mt-2">
                                        <p className="font-bold text-md">₹{product.price}</p>

                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={() => toggleLike(product._id)}
                                                className={`p-2 border rounded-full transition-colors ${isLiked(product._id) ? "bg-black text-white border-black" : "bg-white text-black hover:bg-gray-100"}`}
                                            >
                                                <Heart size={16} fill={isLiked(product._id) ? "white" : "none"} />
                                            </button>
                                            
                                            <button
                                                onClick={() => addToCart(product._id)}
                                                className={`p-2 border rounded-full transition-colors ${isCart(product._id) ? "bg-black text-white border-black" : "bg-white text-black hover:bg-gray-100"}`}
                                                title="Add to Cart"
                                            >
                                                <ShoppingCart size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {validLikeItems.length > 0 && (
                    <h1 className='uppercase mt-10 text-xs font-bold text-gray-400'>
                        HM.com/Favourites
                    </h1>
                )}
            </div>
        </div>
    )
}

export default LikePage