import React from 'react'
import { useShop } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { Heart , ShoppingCart} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FilterNav from '../components/FilterNav'
function LikePage() {
    const { likelist ,isLiked , isCart, addToCart, toggleLike} = useShop()
    

    return (
        <div className="w-full min-h-fit bg-white flex flex-col md:flex-row p-5 ">
            <FilterNav/>
            <div className='w-full min-h-10 flex flex-col gap-5'>
                <h1 className=' uppercase font-bold text-5xl '>Favourites</h1>

                <h1 className=' uppercase'>
                    {likelist.length} Items
                </h1>

                {
                    likelist.length === 0 ? (
                        <>
                            <h1 >Tap the heart icon on items to save them here.</h1>
                            <Link to="/product/all">
                                <button className=' w-full md:w-96 h-16 border border-gray-500'>
                                    Explore R&M
                                </button>
                            </Link>

                        </>) : null
                }
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 ">
                    {likelist.map((item) => {
                        // FIX 1: Kabhi kabhi product details 'productId' object ke andar hoti hain (population ki wajah se)
                        // Hum check karenge ki data 'item' me hai ya 'item.productId' me.
                        const product = item.productId ? item.productId : item;

                        // FIX 2: Agar imageUrl nahi hai to crash mat hone do, ek default/placeholder image use karo
                        // Optional chaining (?.) use kiya hai aur fallback (||) lagaya hai
                        const rawImage = product.imageUrl || "https://via.placeholder.com/300?text=No+Image";

                        // Ab safe tarike se replace karein
                        const secureImage = rawImage.replace("http://", "https://");

                        return (
                            <div key={item._id} className="w-full mb-5">
                                <Link to={`/product/details/${product._id}`}>
                                    <div
                                        className="w-full h-80 md:h-[450px] bg-cover bg-center cursor-pointer"
                                        // Yahan humne fixed variable 'secureImage' use kiya hai
                                        style={{ backgroundImage: `url('${secureImage}')` }}
                                    ></div>
                                </Link>

                                <div className="w-full h-fit flex">
                                    <div className="w-full flex flex-col pl-3">
                                        {/* Note: product.name aur product.price use karein */}
                                        <h2 className="font-semibold text-xl mt-3 uppercase">{product.name || "Unknown Product"}</h2>
                                        <p className="text-xs uppercase">{product.descraption}</p>

                                        <div className="w-full flex justify-between items-center py-4 pr-2">
                                            <p className="mt-2 font-bold text-lg uppercase">₹{product.price}</p>

                                            <div className="flex gap-1 items-center">
                                                <button
                                                    onClick={() => toggleLike(product._id)}
                                                    className={`uppercase flex items-center border p-2  md:p-3   
                         ${isLiked(product._id) ? "bg-black text-white " : "bg-white text-black"}`}
                                                >
                                                    <Heart size={15} />
                                                </button>
                                                <button
                                                    onClick={() => addToCart(product._id)}
                                                    className={`uppercase flex items-center border p-1  md:p-2    
                         ${isCart(product._id) ? "bg-black text-white" : "bg-white text-black"}`}
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
                <h1 className=' uppercase mt-10'>
                    HM.com/Favourites
                </h1>
            </div>

        </div>
    )
}

export default LikePage
