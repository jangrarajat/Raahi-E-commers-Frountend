import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../api/product.api";
import Loader from "../components/Loader";
import Oops from "../components/Oops";
import { Heart, ShoppingCart } from "lucide-react";

function ProductPage() {
    const { id } = useParams();

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);

    async function fetchProducts() {
        if (!hasNextPage || loading) return;
        let data
        setLoading(true);

        try {
            data = await getProducts(id, page);
        } catch (error) {
            setLoading(null);
        }

        if (!data.success) {
            setHasNextPage(false);
            setLoading(false);
            return;
        }

        setProducts((prev) => [...prev, ...data.products]); // merge old + new
        console.log(data.products.message)
        setHasNextPage(data.hasNextPage);
        setLoading(false);
    }

    useEffect(() => {
        fetchProducts();
    }, [page, id]);

    // 🔥 Infinite scroll listener
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 200
            ) {
                if (hasNextPage && !loading) {
                    setPage((p) => p + 1);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasNextPage, loading]);


    return (
        <div className="w-full min-h-screen bg-white ">

            {loading === null ? (<>
                <Oops />
            </>) : null}


            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 ">

                {products.map((item) => (
                    <div key={item._id} className="w-full  mb-5  shadow-md ">
                        <div
                            className="w-full h-80 md:h-[450px] bg-cover bg-center rounded"
                            style={{ backgroundImage: `url('${item.imageUrl}')` }}
                        ></div>

                        <div className="w-full  h-fit flex">
                            <div className="w-full flex flex-col pl-3">
                                <h2 className="font-semibold text-xl mt-3 uppercase">{item.name}</h2>
                                <p className="text-xs uppercase">{item.descraption}</p>


                                <div className=" w-full flex  justify-between items-center py-4 pr-2">
                                    <p className="mt-2 font-bold text-lg uppercase">₹{item.price}</p>

                                 <div className=" flex gap-4 items-center">
                                       <Heart size={15}/>
                                    <ShoppingCart size={15} /> 
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




            {/* No More Products */}
            {!hasNextPage && (
                <h3 className="text-center text-gray-500 mt-10 mb-10">
                    No more products available
                </h3>
            )}
        </div>
    );
}

export default ProductPage;
