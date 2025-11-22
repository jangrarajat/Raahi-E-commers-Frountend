import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios'; // Humara API setup
import { useShop } from '../context/ShopContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Loader from '../components/Loader';

function SingleProduct() {
    const { id } = useParams();
    const { addToCart, toggleLike, wishlist } = useShop();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Single Product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Endpoint check krna: /api/product/single/:id (Backend ke hisab se)
                const { data } = await API.get(`/api/product/${id}`); 
                setProduct(data.product); // Backend response structure match krna
                setLoading(false);
            } catch (error) {
                console.error("Error fetching product", error);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="mt-20"><Loader /></div>;
    if (!product) return <div className="mt-20 text-center">Product Not Found</div>;

    const isLiked = wishlist.some((item) => item._id === product._id);

    return (
        <div className="w-full min-h-screen bg-white pt-24 px-4 md:px-20">
            <div className="flex flex-col md:flex-row gap-10">
                
                {/* Left: Image */}
                <div className="w-full md:w-1/2 h-[500px]">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg shadow-md" />
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-1/2 flex flex-col gap-5">
                    <h1 className="text-4xl font-bold uppercase">{product.name}</h1>
                    <p className="text-gray-600">{product.descraption}</p> {/* description ki spelling check krna */}
                    <h2 className="text-3xl font-semibold">₹{product.price}</h2>

                    {/* Ratings (Fake for design) */}
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star fill="currentColor" size={20} />
                        <Star fill="currentColor" size={20} />
                        <Star fill="currentColor" size={20} />
                        <Star fill="currentColor" size={20} />
                        <span className="text-gray-400 text-sm ml-2">(120 Reviews)</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-5">
                        <button 
                            onClick={() => addToCart(product._id)}
                            className="flex-1 bg-black text-white py-4 uppercase font-bold hover:bg-gray-800 transition flex justify-center gap-2">
                            Add to Cart <ShoppingCart />
                        </button>
                        <button 
                            onClick={() => toggleLike(product._id)}
                            className="border-2 border-gray-300 p-4 rounded hover:bg-gray-100 transition">
                            <Heart 
                                fill={isLiked ? "red" : "none"} 
                                color={isLiked ? "red" : "black"} 
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products Section (Placeholder) */}
            <div className="mt-20">
                <h3 className="text-2xl font-serif uppercase border-b pb-2 mb-5">Related Products</h3>
                <p className="text-gray-400">Related products will appear here...</p>
                {/* Yahan tum ProductPage wala grid component reuse kar sakte ho filter laga ke */}
            </div>
        </div>
    );
}

export default SingleProduct;