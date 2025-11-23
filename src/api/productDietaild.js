import axios from "axios";


const getProductDetails = async (id) => {
    try {
        const data = await axios.get(`${import.meta.env.VITE_API_URL}/api/limited/getSingleProduct?id=${id}`)
        return data
    } catch (error) {
        console.log("error in  getProductDetails", error)
        throw error
    }
}

export { getProductDetails }