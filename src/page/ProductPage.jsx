import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducts } from "../api/product.api";
import Loader from "../components/loader/Loader";
import Oops from "../components/Oops";
import { Heart, Instagram, ShoppingCart } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

function ProductPage() {
    const { id } = useParams();
    const { addToCart, toggleLike, isLiked, isCart } = useShop();
    const { setCatProduct } = useAuth();
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);

    // --- HELPER FUNCTION TO FIX IMAGE ERROR ---
    const getSafeImageUrl = (item) => {
        try {
            if (!item.images || item.images.length === 0) return "https://via.placeholder.com/300?text=No+Image";
            const firstImg = item.images[0];
            if (typeof firstImg === 'object') {
                const url = firstImg.url || firstImg.secure_url || firstImg.link;
                return url ? url.replace("http://", "https://") : "https://via.placeholder.com/300?text=Error";
            }
            if (typeof firstImg === 'string') return firstImg.replace("http://", "https://");
            return "https://via.placeholder.com/300";
        } catch (error) {
            return "https://via.placeholder.com/300";
        }
    };

    // 1. Reset on Category Change
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasNextPage(true);
        setLoading(true);
        fetchProducts(1, id);
    }, [id]);

    // 2. Infinite Scroll
    useEffect(() => {
        if (page > 1) fetchProducts(page, id);
    }, [page]);

    // 3. Main Fetch Function
    async function fetchProducts(pageNo, categoryId) {
        try {
            const data = await getProducts(categoryId, pageNo);
            if (!data.success) {
                setHasNextPage(false);
                setLoading(false);
                return;
            }
            setProducts((prev) => {
                if (pageNo === 1) return data.products;
                const newProducts = data.products.filter(
                    (newP) => !prev.some((existingP) => existingP._id === newP._id)
                );
                return [...prev, ...newProducts];
            });
            setHasNextPage(data.hasNextPage);
            setLoading(false);
        } catch (error) {
            console.log("Error fetching products:", error.message);
            if (error.message === "Network Error") return setLoading(null);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (loading !== null) {
            const handleScroll = () => {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                    if (hasNextPage && !loading) setPage((p) => p + 1);
                }
            };
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [hasNextPage, loading]);

    useEffect(() => { setCatProduct(products); }, [products]);

    return (
        <div className="w-full min-h-screen bg-white">
            {/* Error Handling */}
            {loading === null ? <Oops /> : null}

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
                {products.map((item) => {
                    const imageUrl = getSafeImageUrl(item);
                    
                    // --- CALCULATE TOTAL STOCK ---
                    let totalStock = 0;
                    if (item.variants && item.variants.length > 0) {
                        totalStock = item.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                    } else {
                        // Fallback for old data without variants
                        totalStock = item.stock || 0; 
                    }
                    const isSoldOut = totalStock === 0;

                    return (
                        <div key={item._id} className="w-full mb-5 relative group">
                            {/* SOLD OUT BADGE */}
                            {isSoldOut && (
                                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-md">
                                    Sold Out
                                </div>
                            )}

                            <Link to={`/product/details/${item._id}`}>
                                <div
                                    className={`w-full h-80 md:h-[450px] bg-cover bg-center cursor-pointer transition-all ${isSoldOut ? "opacity-60 grayscale" : "hover:opacity-95"}`}
                                    style={{ backgroundImage: `url('${imageUrl}')` }}
                                ></div>
                            </Link>

                            <div className="w-full h-fit flex">
                                <div className="w-full flex flex-col pl-3">
                                    <h2 className="font-semibold text-sm md:text-xl mt-3 uppercase truncate pr-2">{item.name}</h2>
                                    <p className="text-xs uppercase text-gray-500 truncate">{item.category}</p> 

                                    <div className="w-full flex justify-between items-center py-4 pr-2">
                                        <p className="mt-2 font-bold text-lg uppercase">₹{item.price}</p>

                                        {/* Hide Buttons if Sold Out */}
                                        {!isSoldOut && (
                                            <div className="flex gap-1 items-center">
                                                <button
                                                    onClick={() => toggleLike(item._id)}
                                                    className={`uppercase flex items-center border p-2 md:p-3 
                                                     ${isLiked(item._id) ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
                                                >
                                                    <Heart size={15} />
                                                </button>
                                                <button
                                                    onClick={() => addToCart(item._id)}
                                                    className={`uppercase flex items-center border p-1 md:p-2 
                                                     ${isCart(item._id) ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
                                                >
                                                    Add <ShoppingCart size={15} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* LOADING SPINNER */}
            {loading && (
                <div className="flex justify-center w-full my-10">
                    <Loader />
                </div>
            )}

            {/* Footer Area */}
            <div className="w-full px-6 md:px-16">
                <img
                    src="https://res.cloudinary.com/drrj8rl9n/image/upload/v1763724939/Gemini_Generated_Image_9y17m59y17m59y17_aunkz4.jpg"
                    alt="logo"
                    className="w-20 mb-5"
                />
            </div>
            <div className="flex flex-col md:flex-row px-10 pb-10 justify-between items-start md:items-center gap-5">
                <p className="text-sm md:text-base">
                    The content of this site is copyright-protected and is the property of R & M.
                </p>

                <div className="flex gap-4">
                    <a href="#">
                        <Instagram />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;