import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../components/loader/Loader';
import { getProductDetails } from '../api/productDietaild'; 
import { getProducts } from '../api/product.api'; // NEW IMPORT
import { Heart, ArrowLeft, ShoppingCart, Check, ChevronDown, Bell } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

function SingleProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleLike, isLiked, isCart } = useShop();
    
    // --- MAIN PRODUCT STATE ---
    const [mainProduct, setMainProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- RELATED PRODUCTS STATES ---
    const [xRelatedProducts, setXRelatedProducts] = useState([]); // For Top Horizontal Scroll (Page 1)
    const [yRelatedProducts, setYRelatedProducts] = useState([]); // For Bottom Vertical Grid (Last Page)
    
    // --- SELECTION STATES ---
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [currentStock, setCurrentStock] = useState(0);
    const [uniqueColors, setUniqueColors] = useState([]);
    const [availableSizesForColor, setAvailableSizesForColor] = useState([]);

    const allSizes = ["XS","S", "M", "L", "XL", "XXL"];

    // Helper to safely extract Image URL
    const getSafeImageUrl = (imgData) => {
        if (!imgData) return "https://via.placeholder.com/300?text=No+Image";
        if (typeof imgData === 'object') return (imgData.url || imgData.secure_url || "").replace("http://", "https://");
        if (typeof imgData === 'string') return imgData.replace("http://", "https://");
        return "";
    };

    // 1. FETCH MAIN PRODUCT DETAILS
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await getProductDetails(id);
                const product = res.data.findProduct || res.data.product; 
                
                if (product) {
                    setMainProduct(product);
                    
                    // Set Initial Image
                    const firstImg = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
                    setSelectedImage(getSafeImageUrl(firstImg));

                    // Set Variants
                    if (product.variants && product.variants.length > 0) {
                        const colors = [...new Set(product.variants.map(v => v.color))];
                        setUniqueColors(colors);
                        if (colors.length > 0) setSelectedColor(colors[0]);
                    } 

                    // TRIGGER RELATED PRODUCTS FETCH
                    fetchRelatedLogic(product.category);
                }
            } catch (error) { console.log(error); } 
            finally { setLoading(false); }
        };

        fetchDetails();
        window.scrollTo(0, 0);
    }, [id]);

    // 2. LOGIC TO FETCH RELATED PRODUCTS (Start & End Pages)
    const fetchRelatedLogic = async (category) => {
        if (!category) return;
        try {
            // Step A: Fetch First Page (For Horizontal Scroll)
            const firstPageRes = await getProducts(category, 1);
            
            if (firstPageRes && firstPageRes.success) {
                // Filter out current product from results
                const filteredTop = firstPageRes.products.filter(p => p._id !== id);
                setXRelatedProducts(filteredTop);

                const totalPages = firstPageRes.totalPages;

                // Step B: Fetch Last Page (For Vertical Grid) - ONLY if more than 1 page exists
                if (totalPages > 1) {
                    const lastPageRes = await getProducts(category, totalPages);
                    if (lastPageRes && lastPageRes.success) {
                        // Filter out current product and verify we don't have duplicates from top list
                        const filteredBottom = lastPageRes.products.filter(p => 
                            p._id !== id && !filteredTop.find(topP => topP._id === p._id)
                        );
                        setYRelatedProducts(filteredBottom);
                    }
                } else {
                    // Agar sirf 1 page hai, to niche wala section blank rakhenge ya hide karenge
                    setYRelatedProducts([]);
                }
            }
        } catch (error) {
            console.error("Error fetching related products:", error);
        }
    };

    // --- STOCK LOGIC ---
    useEffect(() => {
        if (mainProduct && mainProduct.variants && selectedColor) {
            const variantsForColor = mainProduct.variants.filter(v => v.color === selectedColor);
            const sizes = variantsForColor.map(v => v.size);
            setAvailableSizesForColor(sizes);

            if (selectedSize) {
                const variant = variantsForColor.find(v => v.size === selectedSize);
                setCurrentStock(variant ? variant.stock : 0);
            } else {
                setCurrentStock(0);
            }
        }
    }, [selectedColor, selectedSize, mainProduct]);

    const handleBuyNow = () => {
        if(currentStock <= 0) return alert("Product is out of stock!");
        navigate('/checkout', { state: { 
            buyNowId: mainProduct._id, 
            size: selectedSize, 
            color: selectedColor,
            singleQuantity: 1,
            productDetails: mainProduct 
        }});
    };

    const handleNotifyMe = () => {
        alert("We will notify you when this product is back in stock!");
    };

    if (loading) return <div className="h-screen flex justify-center items-center"><Loader /></div>;
    if (!mainProduct) return <div className="h-screen flex justify-center items-center">Product Not Found</div>;

    const imagesList = (mainProduct.images && mainProduct.images.length > 0) ? mainProduct.images : [mainProduct.imageUrl];

    return (
        <div className="w-full min-h-screen bg-white font-sans">
            {/* --- BACK BUTTON --- */}
            <div className="w-full p-4 md:px-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm uppercase font-bold hover:underline">
                    <ArrowLeft size={18} /> Back
                </button>
            </div>

            {/* --- MAIN PRODUCT SECTION --- */}
            <div className='w-full flex flex-col md:flex-row gap-10 px-4 md:px-10 mb-10'>
                {/* Images */}
                <div className='w-full md:w-[60%] flex flex-col gap-4'>
                    <div className='w-full h-[50vh] md:h-[70vh] bg-gray-50 flex justify-center items-center overflow-hidden border border-gray-100 rounded-lg relative'>
                        <img src={selectedImage} className='h-full w-full object-contain mix-blend-multiply' alt={mainProduct.name} />
                        {currentStock === 0 && selectedSize && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-6 py-2 text-xl font-bold uppercase rotate-[-15deg] shadow-lg border-2 border-white">Sold Out</span>
                            </div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    <div className="w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                        <div className="flex gap-3 min-w-max">
                            {imagesList.map((img, i) => {
                                const safeUrl = getSafeImageUrl(img);
                                return (
                                    <img key={i} src={safeUrl} className={`w-20 h-24 object-cover cursor-pointer border-2 rounded-md transition-all ${selectedImage === safeUrl ? "border-black scale-105" : "border-transparent opacity-70"}`} onClick={() => setSelectedImage(safeUrl)} />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Info & Actions */}
                <div className='w-full md:w-[40%] flex flex-col gap-6'>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className='text-3xl font-bold uppercase tracking-wide'>{mainProduct.name}</h1>
                            <p className='text-sm text-gray-500 uppercase mt-1'>{mainProduct.subCategory?.name || mainProduct.category}</p>
                        </div>
                        <button onClick={() => toggleLike(mainProduct._id)} className={`p-3 rounded-full border ${isLiked(mainProduct._id) ? "bg-black text-white" : "hover:bg-gray-100"}`}>
                            <Heart size={20} fill={isLiked(mainProduct._id) ? "white" : "none"} />
                        </button>
                    </div>

                    <p className='text-2xl font-medium'>₹{mainProduct.price} <span className="text-sm text-gray-400 line-through ml-2">₹{mainProduct.mrp}</span></p>
                    <div>
                        <h3 className="font-bold text-sm uppercase mb-1">Description</h3>
                        <p className='text-sm text-gray-600 leading-relaxed capitalize line-clamp-4 hover:line-clamp-none transition-all cursor-pointer'>{mainProduct.description}</p>
                    </div>

                    {/* Colors */}
                    {uniqueColors.length > 0 && (
                        <div>
                            <h3 className='text-sm font-bold uppercase mb-3'>Select Color</h3>
                            <div className='flex gap-3'>
                                {uniqueColors.map((col, idx) => (
                                    <button key={idx} onClick={() => { setSelectedColor(col); setSelectedSize(""); }}
                                        className={`w-8 h-8 rounded-full border flex justify-center items-center shadow-sm transition-all ${selectedColor === col ? "ring-2 ring-offset-2 ring-black scale-110" : "hover:scale-105 border-gray-300"}`}
                                        style={{ backgroundColor: col.toLowerCase() }}
                                    >
                                        {selectedColor === col && <Check size={14} color={col.toLowerCase() === 'white' ? 'black' : 'white'} />}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 uppercase">{selectedColor}</p>
                        </div>
                    )}

                    {/* Sizes */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className='text-sm font-bold uppercase'>Select Size</h3>
                            {selectedSize && <span className="text-xs font-bold uppercase">{selectedSize}</span>}
                        </div>
                        <div className='flex flex-wrap gap-3'>
                            {allSizes.map((siz) => {
                                const variantExists = availableSizesForColor.includes(siz);
                                const variantData = mainProduct.variants?.find(v => v.color === selectedColor && v.size === siz);
                                const hasStock = variantData && variantData.stock > 0;

                                return (
                                    <button 
                                        key={siz} 
                                        disabled={!variantExists}
                                        onClick={() => variantExists && setSelectedSize(siz)}
                                        className={`relative w-12 h-12 border flex justify-center items-center uppercase text-sm font-medium transition-all rounded-md
                                            ${!variantExists 
                                                ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200" 
                                                : selectedSize === siz 
                                                    ? "bg-black text-white border-black shadow-md"
                                                    : "bg-white text-black border-gray-300 hover:border-black"
                                            }
                                            ${(variantExists && !hasStock) ? "opacity-60" : ""} 
                                        `}
                                    >
                                        {siz}
                                        {(variantExists && !hasStock) && (
                                            <div className="absolute w-[120%] h-[1px] bg-red-500 rotate-45"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {selectedSize && currentStock > 0 && currentStock < 5 && (
                            <p className="text-orange-600 text-xs font-bold mt-2 animate-pulse">Hurry! Only {currentStock} left in stock.</p>
                        )}
                        {selectedSize === "" && <p className="text-red-500 text-xs mt-2 font-medium">* Please select a size</p>}
                        
                        <details className="mt-4 cursor-pointer group text-sm text-gray-600">
                            <summary className="font-bold uppercase list-none flex justify-between items-center border-b pb-2">Size Guide <ChevronDown size={16}/></summary>
                            <div className="pt-2 text-xs space-y-1"><p>S - 36"</p><p>M - 38"</p><p>L - 40"</p><p>XL - 42"</p><p>XXL - 44"</p></div>
                        </details>
                    </div>

                    {/* Buttons */}
                    <div className='flex gap-4 mt-2'>
                        {(!selectedSize || currentStock > 0) ? (
                            <>
                                <button 
                                    className='flex-1 py-4 uppercase border border-black font-bold hover:bg-gray-50 flex justify-center items-center gap-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                    onClick={() => addToCart(mainProduct._id)}
                                    disabled={!selectedSize || currentStock === 0}
                                >
                                    {isCart(mainProduct._id) ? "Added" : "Add to Bag"} <ShoppingCart size={18}/>
                                </button>
                                <button 
                                    className='flex-1 py-4 uppercase bg-black text-white font-bold hover:bg-gray-800 rounded-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                                    disabled={!selectedSize || currentStock === 0}
                                    onClick={handleBuyNow}
                                >
                                    Buy Now
                                </button>
                            </>
                        ) : (
                            <button onClick={handleNotifyMe} className='w-full py-4 uppercase bg-gray-900 text-white font-bold hover:bg-gray-800 rounded-sm flex justify-center items-center gap-2'>
                                <Bell size={18} /> Notify Me When Available
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* ========================================================= */}
            {/* PART 1: X-SCROLL (Horizontal) - Showing STARTING Products */}
            {/* ========================================================= */}
            {xRelatedProducts.length > 0 && (
                <div className="mt-16 px-4 md:px-10 mb-10 border-t pt-10">
                    <h2 className="text-xl md:text-2xl font-bold uppercase mb-6 tracking-wide flex items-center gap-2">
                         More to Explore 
                    </h2>
                    
                    {/* Horizontal Slider Container */}
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scroll-smooth [&::-webkit-scrollbar]:hidden">
                        {xRelatedProducts.map((item) => (
                            <Link to={`/product/details/${item._id}`} key={item._id} className="min-w-[160px] md:min-w-[240px] group cursor-pointer block flex-shrink-0">
                                <div className="w-full h-56 md:h-72 bg-gray-50 overflow-hidden rounded-md relative border border-gray-100">
                                    <img 
                                        src={getSafeImageUrl(item.images?.[0] || item.imageUrl)} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase truncate group-hover:underline">{item.name}</h3>
                                    <p className="text-xs text-gray-500 mb-1 uppercase">{item.subCategory?.name || item.category}</p>
                                    <div className="flex gap-2 items-center">
                                        <span className="font-semibold text-gray-900">₹{item.price}</span>
                                        {item.mrp && <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* PART 2: Y-SCROLL (Grid) - Showing ENDING Products (Difference) */}
            {/* ============================================================ */}
            {yRelatedProducts.length > 0 && (
                <div className="mt-10 px-4 md:px-10 mb-20">
                     <h2 className="text-xl md:text-2xl font-bold uppercase mb-6 tracking-wide flex items-center gap-2">
                        Trending Now <span className='text-xs font-normal text-gray-500 lowercase'>(From our Latest Collection)</span>
                    </h2>

                    {/* Vertical Grid (Y Scroll via Page) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {yRelatedProducts.map((item) => (
                            <Link to={`/product/details/${item._id}`} key={item._id} className="group cursor-pointer block">
                                <div className="w-full h-64 bg-gray-50 overflow-hidden rounded-md relative border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <img 
                                        src={getSafeImageUrl(item.images?.[0] || item.imageUrl)} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    {/* Optional: Label for second section items */}
                                    <span className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase rounded-sm">Hot</span>
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase truncate group-hover:underline">{item.name}</h3>
                                    <p className="text-xs text-gray-500 mb-1 uppercase">{item.subCategory?.name || item.category}</p>
                                    <div className="flex gap-2 items-center">
                                        <span className="font-semibold text-gray-900">₹{item.price}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
         
       
        </div>
    );
}

export default SingleProduct;