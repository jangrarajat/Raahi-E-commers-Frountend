import axios from "axios";

export const getProducts = async (category, page) => {
    const res = await axios.get(
        `http://localhost:8000/api/limited/getLimitProduct?category=${category}&limit=6&page=${page}`
    );

    return res.data;
};
