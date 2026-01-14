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
            // 1. Agar images array hi nahi hai
            if (!item.images || item.images.length === 0) {
                return "https://via.placeholder.com/300?text=No+Image";
            }

            const firstImg = item.images[0];

            // 2. Agar image OBJECT hai (Jaisa aapke data me { url: '...' } ho sakta hai)
            if (typeof firstImg === 'object') {
                // Yahan check kar rahe hain ki URL kahan chupa hai
                const url = firstImg.url || firstImg.secure_url || firstImg.link;
                return url ? url.replace("http://", "https://") : "https://via.placeholder.com/300?text=Error";
            }

            // 3. Agar image STRING hai (Purana data)
            if (typeof firstImg === 'string') {
                return firstImg.replace("http://", "https://");
            }

            return "https://via.placeholder.com/300";
        } catch (error) {
            return "https://via.placeholder.com/300";
        }
    };

    // --- LOGIC CHANGE START ---

    // 1. Jab bhi ID (Category) change ho, reset karo
    useEffect(() => {
        console.log("produts page");
        setProducts([]);
        setPage(1);
        setHasNextPage(true);
        setLoading(true);
        fetchProducts(1, id);
    }, [id]);

    // 2. Infinite Scroll Logic
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, id);
        }
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
                // Duplicate items avoid karne ke liye check (Optional safety)
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

    // Infinite Scroll Event Listener
    useEffect(() => {
        if (loading !== null) {
            const handleScroll = () => {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                    if (hasNextPage && !loading) {
                        setPage((p) => p + 1);
                    }
                }
            };
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [hasNextPage, loading]);

    useEffect(() => {
        setCatProduct(products);
    }, [products]);

    return (
        <div className="w-full min-h-screen bg-white">

            <div className='md:hidden flex gap-7 mx-5'>
                <Link to='/product/all' className='hover:underline uppercase'>All</Link>|
                <Link to='/product/Women' className='hover:underline uppercase'>Women</Link>|
                <Link to='/product/men' className='hover:underline uppercase'>Men</Link>|
                <Link to='/product/kids' className='hover:underline uppercase'>Kids</Link>
            </div>

            {/* Error Handling */}
            {loading === null ? <Oops /> : null}

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
                {products.map((item) => {
                    // Safe Image URL nikal lo pehle
                    const imageUrl = getSafeImageUrl(item);

                    return (
                        <div key={item._id} className="w-full mb-5">
                            <Link to={`/product/details/${item._id}`}>
                                <div
                                    className="w-full h-80 md:h-[450px] bg-cover bg-center cursor-pointer"
                                    // Yahan ab direct URL variable use kiya hai
                                    style={{ backgroundImage: `url('${imageUrl}')` }}
                                ></div>
                            </Link>

                            <div className="w-full h-fit flex">
                                <div className="w-full flex flex-col pl-3">
                                    <h2 className="font-semibold text-xl mt-3 uppercase">{item.name}</h2>
                                    <p className="text-xs uppercase">{item.description}</p> 

                                    <div className="w-full flex justify-between items-center py-4 pr-2">
                                        <p className="mt-2 font-bold text-lg uppercase">₹{item.price}</p>

                                        <div className="flex gap-1 items-center">
                                            <button
                                                onClick={() => toggleLike(item._id)}
                                                className={`uppercase flex items-center border p-2 md:p-3 
                                                 ${isLiked(item._id) ? "bg-black text-white" : "bg-white text-black"}`}
                                            >
                                                <Heart size={15} />
                                            </button>
                                            <button
                                                onClick={() => addToCart(item._id)}
                                                className={`uppercase flex items-center border p-1 md:p-2 
                                                 ${isCart(item._id) ? "bg-black text-white" : "bg-white text-black"}`}
                                            >
                                                Add
                                                <ShoppingCart size={15} />
                                            </button>
                                        </div>
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