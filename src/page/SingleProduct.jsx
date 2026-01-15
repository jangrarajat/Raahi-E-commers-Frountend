import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/loader/Loader';
import { getProductDetails } from '../api/productDietaild'; 
import { Heart, ArrowLeft, ShoppingCart, Check, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import Footer from '../components/Footer';
import axios from 'axios';

function SingleProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleLike, isLiked, isCart } = useShop();

    const [mainProduct, setMainProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [moreCollection, setMoreCollection] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    // --- HELPER: SAFE IMAGE URL ---
    const getSafeImageUrl = (imgData) => {
        if (!imgData) return "https://via.placeholder.com/300?text=No+Image";
        if (typeof imgData === 'object') {
            const url = imgData.url || imgData.secure_url || imgData.link;
            return url ? url.replace("http://", "https://") : "";
        }
        if (typeof imgData === 'string') return imgData.replace("http://", "https://");
        return "";
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await getProductDetails(id);
                const product = res.data.findProduct || res.data.product; 
                
                if (product) {
                    setMainProduct(product);
                    
                    // Image Setup
                    const firstImg = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
                    setSelectedImage(getSafeImageUrl(firstImg));

                    // --- COLOR LOGIC (Backend First) ---
                    if(product.colors && product.colors.length > 0) {
                        setSelectedColor(product.colors[0]);
                    }

                    // Related Products Logic
                    if(product.subCategory || product.category) fetchRelated(product);
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

    const fetchRelated = async (currentProduct) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/product/all`); 
            if(res.data.success) {
                const allProds = res.data.products;
                const currentId = currentProduct._id;
                const subCatId = currentProduct.subCategory?._id || currentProduct.subCategory;

                const similar = allProds.filter(item => 
                    (item.subCategory?._id === subCatId || item.subCategory === subCatId) && item._id !== currentId
                ).slice(0, 6);

                const collection = allProds.filter(item => item._id !== currentId && !similar.includes(item)).slice(0, 8);

                setSimilarProducts(similar);
                setMoreCollection(collection);
            }
        } catch (error) {
            console.log("Related fetch error", error);
        }
    };

    const handleBuyNow = () => {
        // Direct Checkout with State
        navigate('/checkout', { state: { 
            buyNowId: mainProduct._id, 
            size: selectedSize, 
            color: selectedColor,
            singleQuantity: 1,
            productDetails: mainProduct // Passing details for invoice display
        }});
    };

    if (loading) return <div className="h-screen flex justify-center items-center"><Loader /></div>;
    if (!mainProduct) return <div className="h-screen flex justify-center items-center">Product Not Found</div>;

    const imagesList = (mainProduct.images && mainProduct.images.length > 0) ? mainProduct.images : (mainProduct.imageUrl ? [mainProduct.imageUrl] : []);
    
    // --- DYNAMIC SIZE & COLOR ARRAYS ---
    const displaySizes = (mainProduct.sizes && mainProduct.sizes.length > 0) ? mainProduct.sizes : ["S", "M", "L", "XL", "XXL"];
    const displayColors = (mainProduct.colors && mainProduct.colors.length > 0) ? mainProduct.colors : [];

    return (
        <div className="w-full min-h-screen bg-white">
            <div className="w-full p-4 md:px-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm uppercase font-bold hover:underline">
                    <ArrowLeft size={18} /> Back
                </button>
            </div>

            <div className='w-full flex flex-col md:flex-row gap-10 px-4 md:px-10 mb-20'>
                {/* Images Section */}
                <div className='w-full md:w-[60%] flex flex-col gap-4'>
                    <div className='w-full h-[50vh] md:h-[70vh] bg-gray-50 flex justify-center items-center overflow-hidden border border-gray-100 rounded-lg'>
                        <img src={selectedImage} className='h-full w-full object-contain mix-blend-multiply' alt={mainProduct.name} />
                    </div>
                    <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
                        <div className="flex gap-3 min-w-max">
                            {imagesList.map((img, i) => {
                                const safeUrl = getSafeImageUrl(img);
                                return (
                                    <img key={i} src={safeUrl} className={`w-20 h-24 object-cover cursor-pointer border-2 rounded-md ${selectedImage === safeUrl ? "border-black" : "border-transparent"}`} onClick={() => setSelectedImage(safeUrl)} />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className='w-full md:w-[40%] flex flex-col gap-6'>
                    <div>
                        <h1 className='text-3xl font-bold uppercase'>{mainProduct.name}</h1>
                        <p className='text-sm text-gray-500 uppercase mt-1'>{mainProduct.subCategory?.name || "Collection"}</p>
                    </div>

                    <p className='text-2xl font-medium'>₹{mainProduct.price}</p>
                    <p className='text-sm text-gray-700 leading-relaxed'>{mainProduct.description}</p>

                    {/* Colors (Only if available) */}
                    {displayColors.length > 0 && (
                        <div>
                            <h3 className='text-sm font-bold uppercase mb-3'>Select Color</h3>
                            <div className='flex gap-3'>
                                {displayColors.map((col, idx) => (
                                    <button key={idx} onClick={() => setSelectedColor(col)}
                                        className={`w-8 h-8 rounded-full border border-gray-300 flex justify-center items-center shadow-sm ${selectedColor === col ? "ring-2 ring-black ring-offset-2" : ""}`}
                                        style={{ backgroundColor: col.toLowerCase() }}
                                    >
                                        {selectedColor === col && <Check size={14} color={col.toLowerCase() === 'white' ? 'black' : 'white'} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    <div>
                        <h3 className='text-sm font-bold uppercase mb-3'>Select Size</h3>
                        <div className='flex flex-wrap gap-3'>
                            {displaySizes.map((siz) => (
                                <button key={siz} 
                                    onClick={() => setSelectedSize(siz)}
                                    className={`w-12 h-12 border flex justify-center items-center uppercase text-sm font-medium transition-all
                                        ${selectedSize === siz ? "bg-black text-white border-black" : "bg-white text-black hover:border-black"}`}
                                >
                                    {siz}
                                </button>
                            ))}
                        </div>
                        {selectedSize === "" && <p className="text-red-500 text-xs mt-2 font-medium">* Please select a size</p>}
                    </div>

                    <div className='flex gap-4 mt-4'>
                        <button className='flex-1 py-4 uppercase border border-black font-bold hover:bg-gray-50 flex justify-center items-center gap-2' onClick={() => addToCart(mainProduct._id)}>
                            {isCart(mainProduct._id) ? "Added" : "Add to Bag"} <ShoppingCart size={18} />
                        </button>
                        <button className='flex-1 py-4 uppercase bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50' disabled={!selectedSize} onClick={handleBuyNow}>
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* ... (Related Products code same as previous) ... */}
             {similarProducts.length > 0 && (
                <div className="w-full px-4 md:px-10 mb-16 border-t pt-10">
                     <h2 className="text-xl md:text-2xl font-bold uppercase mb-6">Similar Styles</h2>
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 hide-scrollbar snap-x">
                        {similarProducts.map((item) => (
                            <div key={item._id} className="min-w-[160px] md:min-w-[220px] cursor-pointer snap-start group" onClick={() => navigate(`/product/details/${item._id}`)}>
                                <div className="w-full h-60 md:h-72 overflow-hidden bg-gray-100 mb-3 rounded-md relative">
                                    <img src={getSafeImageUrl(item.images?.[0] || item.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name}/>
                                </div>
                                <h3 className="font-bold text-sm uppercase truncate">{item.name}</h3>
                                <p className="text-sm font-medium mt-1">₹{item.price}</p>
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