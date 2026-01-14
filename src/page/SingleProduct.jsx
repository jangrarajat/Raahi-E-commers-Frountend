import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/loader/Loader';
import { getProductDetails } from '../api/productDietaild'; 
import { Heart, ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import Footer from '../components/Footer';
import axios from 'axios';

function SingleProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleLike, isLiked, isCart } = useShop();

    // Product Data
    const [mainProduct, setMainProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // User Selection
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    // --- STATIC DATA CONFIG (Backend se replace kar sakte ho) ---
    const allSizes = ["S", "M", "L", "XL", "XXL"];
    
    // --- HELPER: SAFE IMAGE URL ---
    // Ye function crash hone se bachaega
    const getSafeImageUrl = (imgData) => {
        if (!imgData) return "https://via.placeholder.com/300?text=No+Image";
        
        // Agar object hai (backend se {url: '...'} aa raha hai)
        if (typeof imgData === 'object') {
            const url = imgData.url || imgData.secure_url || imgData.link;
            return url ? url.replace("http://", "https://") : "";
        }
        // Agar string hai
        if (typeof imgData === 'string') {
            return imgData.replace("http://", "https://");
        }
        return "";
    };

    // 1. Fetch Main Product Details
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await getProductDetails(id);
                const product = res.data.findProduct || res.data.product; 
                
                if (product) {
                    setMainProduct(product);
                    
                    // Default Image Set
                    const firstImg = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
                    setSelectedImage(getSafeImageUrl(firstImg));

                    // Default Color Set (Agar product me colors defined hain)
                    if(product.colors && product.colors.length > 0) {
                        setSelectedColor(product.colors[0]);
                    }

                    // Related Products
                    if(product.subCategory) {
                        fetchRelated(product.subCategory._id || product.subCategory, product._id);
                    }
                }
            } catch (error) {
                console.log("Error fetching detail", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
        window.scrollTo(0, 0);
    }, [id]);

    // 2. Fetch Related Products
    const fetchRelated = async (subCatId, currentId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/product/all`); 
            if(res.data.success) {
                const related = res.data.products.filter(item => 
                    (item.subCategory?._id === subCatId || item.subCategory === subCatId) && 
                    item._id !== currentId
                ).slice(0, 4);
                setRelatedProducts(related);
            }
        } catch (error) {
            console.log("Related fetch error", error);
        }
    };

    const handleBuyNow = () => {
        if(!isCart(mainProduct._id)) {
            addToCart(mainProduct._id);
        }
        navigate('/checkout', { state: { 
            buyNowId: mainProduct._id, 
            size: selectedSize,
            color: selectedColor 
        }});
    };

    // --- CHECK AVAILABILITY LOGIC ---
    const isSizeAvailable = (size) => {
        // Agar product me 'sizes' array hai, to check karo
        if (mainProduct.sizes && mainProduct.sizes.length > 0) {
            return mainProduct.sizes.includes(size);
        }
        // Fallback: Agar backend sizes nahi bhej raha, to maan lo sab available hain
        // (Yahan aap false bhi return kar sakte ho agar specific sizes hi dikhani hain)
        return true; 
    };

    if (loading) return <div className="h-screen flex justify-center items-center"><Loader /></div>;
    if (!mainProduct) return <div className="h-screen flex justify-center items-center">Product Not Found</div>;

    // Images Array Prepare
    const imagesList = (mainProduct.images && mainProduct.images.length > 0) 
        ? mainProduct.images 
        : (mainProduct.imageUrl ? [mainProduct.imageUrl] : []);

    return (
        <div className="w-full min-h-screen bg-white">
            
            {/* Back Button */}
            <div className="w-full p-4 md:px-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm uppercase font-bold hover:underline">
                    <ArrowLeft size={18} /> Back
                </button>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className='w-full flex flex-col md:flex-row gap-10 px-4 md:px-10 mb-20'>
                
                {/* 1. IMAGE GALLERY SECTION */}
                <div className='w-full md:w-[60%] flex flex-col gap-4'>
                    
                    {/* Big Image */}
                    <div className='w-full h-[50vh] md:h-[70vh] bg-gray-50 flex justify-center items-center overflow-hidden border border-gray-100 rounded-lg'>
                        <img 
                            src={selectedImage} 
                            className='h-full w-full object-contain mix-blend-multiply' 
                            alt={mainProduct.name} 
                        />
                    </div>

                    {/* Thumbnails Slider (Scrollable) */}
                    <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
                        <div className="flex gap-3 min-w-max">
                            {imagesList.map((img, i) => {
                                const safeUrl = getSafeImageUrl(img);
                                return (
                                    <img 
                                        key={i}
                                        src={safeUrl}
                                        className={`w-20 h-24 object-cover cursor-pointer border-2 rounded-md transition-all
                                            ${selectedImage === safeUrl ? "border-black scale-105" : "border-transparent opacity-70 hover:opacity-100"}
                                        `}
                                        onClick={() => setSelectedImage(safeUrl)}
                                        alt={`view-${i}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. PRODUCT DETAILS SECTION */}
                <div className='w-full md:w-[40%] flex flex-col gap-6'>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className='text-3xl font-bold uppercase tracking-wide'>{mainProduct.name}</h1>
                            <p className='text-sm text-gray-500 uppercase mt-1'>{mainProduct.subCategory?.name || "Collection"}</p>
                        </div>
                        <button
                            onClick={() => toggleLike(mainProduct._id)}
                            className={`p-3 rounded-full border transition-all ${isLiked(mainProduct._id) ? "bg-black text-white" : "hover:bg-gray-100"}`}
                        >
                            <Heart size={20} fill={isLiked(mainProduct._id) ? "white" : "none"} />
                        </button>
                    </div>

                    <p className='text-2xl font-medium'>₹{mainProduct.price}</p>
                    <p className='text-sm text-gray-700 leading-relaxed opacity-90'>{mainProduct.description}</p>

                    {/* --- COLOR SELECTION (Agar product ke paas colors hain) --- */}
                    {mainProduct.colors && mainProduct.colors.length > 0 && (
                        <div>
                            <h3 className='text-sm font-bold uppercase mb-3'>Select Color</h3>
                            <div className='flex gap-3'>
                                {mainProduct.colors.map((col, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setSelectedColor(col)}
                                        className={`w-8 h-8 rounded-full border border-gray-300 shadow-sm flex justify-center items-center
                                            ${selectedColor === col ? "ring-2 ring-offset-2 ring-black" : ""}
                                        `}
                                        style={{ backgroundColor: col.toLowerCase() }}
                                        title={col}
                                    >
                                        {selectedColor === col && <Check size={14} color={col.toLowerCase() === 'white' ? 'black' : 'white'} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- SIZE SELECTION (With Cut Mark Logic) --- */}
                    <div>
                        <h3 className='text-sm font-bold uppercase mb-3'>Select Size</h3>
                        <div className='flex flex-wrap gap-3'>
                            {allSizes.map((siz) => {
                                const isAvailable = isSizeAvailable(siz);
                                return (
                                    <button 
                                        key={siz} 
                                        disabled={!isAvailable}
                                        onClick={() => isAvailable && setSelectedSize(siz)}
                                        className={`relative w-12 h-12 border flex justify-center items-center uppercase text-sm font-medium transition-all
                                            ${!isAvailable 
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" // Disabled Style
                                                : selectedSize === siz 
                                                    ? "bg-black text-white border-black" // Selected Style
                                                    : "bg-white text-black hover:border-black" // Normal Style
                                            }
                                        `}
                                    >
                                        {siz}
                                        {/* Cut Mark (Diagonal Line) for Unavailable */}
                                        {!isAvailable && (
                                            <div className="absolute w-[140%] h-[1px] bg-gray-400 rotate-45"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedSize === "" && <p className="text-red-500 text-xs mt-2 font-medium">* Please select a size</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-4 mt-2'>
                        <button 
                            className='flex-1 py-4 uppercase border border-black font-bold hover:bg-gray-50 transition-colors flex justify-center items-center gap-2'
                            onClick={() => addToCart(mainProduct._id)}
                        >
                            {isCart(mainProduct._id) ? "Added" : "Add to Bag"}
                            <ShoppingCart size={18} />
                        </button>
                        <button 
                            className='flex-1 py-4 uppercase bg-black text-white font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={!selectedSize}
                            onClick={handleBuyNow}
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Delivery Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-2 font-medium">
                        <p className="flex items-center gap-2">🚚 Free delivery on orders above ₹1999</p>
                        <p className="flex items-center gap-2">💵 Cash on delivery available</p>
                        <p className="flex items-center gap-2">🔄 7 days easy return/exchange</p>
                    </div>
                </div>
            </div>

            {/* 3. RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="px-4 md:px-10 mb-20 border-t pt-10">
                    <h2 className="text-2xl font-bold uppercase mb-6 text-center md:text-left">You May Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((item) => (
                            <div key={item._id} className="cursor-pointer group" onClick={() => navigate(`/product/details/${item._id}`)}>
                                <div className="w-full h-64 md:h-80 overflow-hidden bg-gray-100 mb-3 rounded-md">
                                    <img 
                                        src={getSafeImageUrl(item.images?.[0] || item.imageUrl)} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        alt={item.name}
                                    />
                                </div>
                                <h3 className="font-bold text-sm uppercase">{item.name}</h3>
                                <p className="text-sm text-gray-600">₹{item.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Footer/>
        </div>
    );
}

export default SingleProduct;