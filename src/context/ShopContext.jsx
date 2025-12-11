import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import Registration from "../components/auth/Registration";
import axios from "axios";
import { refreshExpriedToken } from "../api/refreshExpiredToken";
const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { user,
    logout,
    showAuth,
    setShowAuth,
    isLoginView,
    setIsLoginView } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [likelist, setLikelist] = useState([]);

  const setLikeAndCartList = async () => {
    try {
      // FIX 1: Removed the empty {} object. 
      // axios.get(url, config) <-- Correct syntax
      const resLike = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/like/likeList`,
        { withCredentials: true }
      );

      const resCart = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cart/cartList`,
        { withCredentials: true }
      );


      setLikelist(resLike.data.likeList)
      setCart(resCart.data.cartList)
      // setLikelist(res.data) // Update your state here if successful

    } catch (error) {
      console.log("error in setLikeAndCartList", error.message);

      const errorMessage = error.response?.data?.message;

      // FIX 2: Corrected the OR (||) logic check
      if (errorMessage === "jwt expired" || errorMessage === "UnAuthroize request") {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/user/refreshExpiredToken`,
            {},
            { withCredentials: true }
          );
          console.log("Token Refreshed", res);



        } catch (refreshError) {
          console.log("error in refreshExpiredtoken", refreshError.response?.data?.message);
          logout(); // Only logout if refresh FAILS
        }
      }
    }
  }

  useEffect(() => {
    const getUser = JSON.parse(localStorage.getItem("user"));

    if (getUser !== null) {
      setLikeAndCartList();
    }


  }, [user]);

  const isLiked = (id) => {
    return likelist.some((item) => item.productId?._id === id);
  };
  const isCart = (id) => {
    return cart.some((item) => item.productId?._id === id);
  };


  // Jab User Login ho, tabhi Cart aur Wishlist load karo
  const toggleLike = async (id) => {
    // 1. Auth Check
    if (user === null) return setShowAuth(true);

    // 2. Check Current Status
    const alreadyLiked = isLiked(id);

    // --- OPTIMISTIC UPDATE START (Ye naya magic code hai) ---
    // API call se pehle hi UI update kar do
    if (alreadyLiked) {
      // Agar liked hai, to turant list se hata do
      setLikelist((prev) => prev.filter((item) => item.productId?._id !== id));
    } else {
      // Agar liked nahi hai, to turant ek fake item add kar do
      setLikelist((prev) => [...prev, { productId: { _id: id } }]);
    }
    // --- OPTIMISTIC UPDATE END ---

    try {
      // 3. Ab Background me API Call chalne do
      if (alreadyLiked) {
        console.log("Unliked API Call:", id);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/like/dislikeProduct`,
          { productId: id },
          { withCredentials: true }
        );
      } else {
        console.log("Liked API Call:", id);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/like/likeProduct`,
          { productId: id },
          { withCredentials: true }
        );
      }

      // 4. Success ke baad data sync kar lo (Optional but good for safety)
      // User ko fark nahi padega kyunki UI pehle hi update ho chuka hai
      await setLikeAndCartList();

    } catch (error) {
      console.log("toggleLike error", error.message);

      // --- ROLLBACK (Agar error aaya to wapis sahi data lao) ---
      // Agar API fail hui, to UI jhooth bol raha hoga, isliye list wapis fetch karo
      await setLikeAndCartList();

      // --- TUMHARA EXISTING TOKEN LOGIC ---
      const errorMessage = error.response?.data?.message;

      if (errorMessage === "jwt expired" || errorMessage === "UnAuthroize request") {
        const refresh = await refreshExpriedToken(); // Make sure ye function defined ho context me
        if (refresh) {
          // Token refresh hone ke baad wapis try karo
          toggleLike(id);
        } else {
          logout();
        }
      }
    }
  };

  const addToCart = async (id) => {
    // 1. Auth Check
    console.log(user);
    if (user === null) return setShowAuth(true);

    // 2. Check Current Status
    const alreadyInCart = isCart(id);

    // --- OPTIMISTIC UPDATE START (Instant UI Change) ---
    if (alreadyInCart) {
      // Agar cart me hai, to turant UI se hata do
      setCart((prev) => prev.filter((item) => item.productId?._id !== id));
    } else {
      // Agar cart me nahi hai, to turant fake item jod do
      setCart((prev) => [...prev, { productId: { _id: id } }]);
    }
    // --- OPTIMISTIC UPDATE END ---

    try {
      // 3. Background API Calls
      if (alreadyInCart) {
        console.log("Removing from Cart API:", id);
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/cart/disCartProduct`,
          { productId: id },
          { withCredentials: true }
        );
        console.log(res);
      } else {
        console.log("Adding to Cart API:", id);
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/cart/addCartProduct`,
          { productId: id },
          { withCredentials: true }
        );
        console.log(res);
      }

      // 4. Success ke baad asli data sync kar lo
      await setLikeAndCartList();

    } catch (error) {
      console.log('addToCart error', error);

      // --- ROLLBACK (Agar API fail hui to wapis sahi data lao) ---
      await setLikeAndCartList();

      // --- TOKEN REFRESH LOGIC ---
      const errorMessage = error.response?.data?.message; // Ye line zaroori hai error padhne ke liye

      if (errorMessage === "jwt expired" || errorMessage === "UnAuthroize request") {
        // Make sure refreshExpriedToken context me defined ho
        const refresh = await refreshExpriedToken();
        if (refresh) {
          addToCart(id); // ID paas karna zaroori hai retry ke liye
        } else {
          logout();
        }
      }
    }
  };


  return (
    <ShopContext.Provider value={{ toggleLike, addToCart, isLiked, isCart, cart, likelist }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);