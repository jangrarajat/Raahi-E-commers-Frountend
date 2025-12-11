import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducts } from "../api/product.api";
import Loader from "../components/loader/Loader";
import Oops from "../components/Oops";
import { Heart, ShoppingCart } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

function ProductPage() {
    const { id } = useParams(); // URL se ID ayegi (ladies, man, etc.)
    const { addToCart, toggleLike, wishlist, isLiked, isCart } = useShop();
    const { catProduct, setCatProduct } = useAuth()
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);

    // --- LOGIC CHANGE START ---

    // 1. Jab bhi ID (Category) change ho, sab kuch reset kardo
    useEffect(() => {
        setProducts([]);      // Purane products hatao
        setPage(1);           // Page 1 par wapis jao
        setHasNextPage(true); // Scroll wapis enable karo
        setLoading(true);     // Loading dikhao
        fetchProducts(1, id); // Naya data fetch karo (Direct call with page 1)
    }, [id]);

    // 2. Infinite Scroll ke liye Page change hone par fetch karo
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, id);
        }
    }, [page]); // Note: Yahan 'id' hataya taki double call na ho

    // 3. Main Fetch Function
    async function fetchProducts(pageNo, categoryId) {
        try {
            const data = await getProducts(categoryId, pageNo);

            if (!data.success) {
                setHasNextPage(false);
                setLoading(false);
                return;
            }

            // Agar Page 1 hai to pura data replace karo, nahi to neeche jodo
            setProducts((prev) => {
                if (pageNo === 1) return data.products;
                return [...prev, ...data.products];
            });

            setHasNextPage(data.hasNextPage);
            setLoading(false);

        } catch (error) {
            console.log("baby error", error.message);
            if (error.message === "Network Error") return setLoading(null);
            setLoading(false);
        }
    }

    // --- LOGIC CHANGE END ---

    // Infinite Scroll Logic (Same as before)
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
        setCatProduct(products)
    }, [products])

    // Check helper
    // const isLiked = (prodId) => wishlist.some((item) => item._id === prodId || item.productId === prodId);

    return (
        <div className="w-full min-h-screen bg-white ">


            <div className='  md:hidden flex  gap-7 mx-5'>
                <Link to='/product/all' className=' hover:underline uppercase '>All</Link>|
                <Link to='/product/ladies' className=' hover:underline uppercase '>Ladies</Link>|
                <Link to='/product/man' className=' hover:underline uppercase '>Man</Link>|
                <Link to='/product/kids' className=' hover:underline uppercase '>Kids</Link>
            </div>

            {/* Error Handling */}
            {loading === null ? <Oops /> : null}

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 ">

                {products.map((item) => (
                    <div key={item._id} className="w-full mb-5">
                        <Link to={`/product/details/${item._id}`}>
                            <div
                                className="w-full h-80 md:h-[450px] bg-cover bg-center cursor-pointer"
                                style={{ backgroundImage: `url('${item.imageUrl.replace("http://", "https://")}')` }}
                            ></div>
                        </Link>

                        <div className="w-full h-fit flex">
                            <div className="w-full flex flex-col pl-3">
                                <h2 className="font-semibold text-xl mt-3 uppercase">{item.name}</h2>
                                <p className="text-xs uppercase">{item.descraption}</p>

                                <div className="w-full flex justify-between items-center py-4 pr-2">
                                    <p className="mt-2 font-bold text-lg uppercase">₹{item.price}</p>

                                    <div className="flex gap-1 items-center">
                                        <button
                                            onClick={() => toggleLike(item._id)}
                                            className={`uppercase flex items-center border p-2  md:p-3   
                                                 ${isLiked(item._id) ? "bg-black text-white "
                                                    : "bg-white text-black"}`
                                            }
                                        >
                                            <Heart
                                                size={15}

                                            />
                                        </button>
                                        <button
                                            onClick={() => addToCart(item._id)}
                                            className={`uppercase flex items-center border p-1  md:p-2    
                                                 ${isCart(item._id) ? "bg-black text-white"
                                                    : "bg-white text-black"}`
                                            }   >
                                            Add
                                            <ShoppingCart size={15} />
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* LOADING SPINNER */}
            {loading && (
                <div className="flex justify-center w-full my-10">
                    <Loader />
                </div>
            )}

            {/* Footer Area (Logo etc) - Same as your original */}
            <div className="w-full px-6 md:px-16 pb-10">
                <img
                    src="https://res.cloudinary.com/drrj8rl9n/image/upload/v1763724939/Gemini_Generated_Image_9y17m59y17m59y17_aunkz4.jpg"
                    alt="logo"
                    className="w-20 mb-5"
                />
                {/* Baki ka footer content waisa hi */}


            </div>
        </div>
    );
}

export default ProductPage;