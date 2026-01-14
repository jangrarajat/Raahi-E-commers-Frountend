import axios from "axios";

export const getProducts = async (category, page) => {
    try {
        const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/limited/getLimitProduct?category=${category}&limit=8&page=${page}`
        );
       
        return res.data;
    } catch (error) {
         console.log("error i nget protus ", error)
         throw error
    }

};
