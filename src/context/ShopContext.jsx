import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Jab User Login ho, tabhi Cart aur Wishlist load karo
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await API.get("/api/cart/cartList");
      setCart(data.cart || []);
    } catch (error) { console.log(error); }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get("/api/like/likeList");
      setWishlist(data.wishlist || []);
    } catch (error) { console.log(error); }
  };

  // --- ADD TO CART ---
  const addToCart = async (productId) => {
    if (!user) {
      alert("Please Login first!");
      navigate("/login"); // Login page par bhej dega
      return;
    }
    try {
      const { data } = await API.post("/api/cart/addCartProduct", { productId });
      if (data.success) {
        fetchCart(); // Cart update karo
        alert("Item added to cart!");
      }
    } catch (error) {
      console.log("Add to cart error", error);
    }
  };

  // --- REMOVE FROM CART ---
  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await API.post("/api/cart/disCartProduct", { productId });
      fetchCart();
    } catch (error) { console.log(error); }
  };

  // --- TOGGLE LIKE ---
  const toggleLike = async (productId) => {
    if (!user) {
      alert("Please Login to like products!");
      navigate("/login");
      return;
    }

    // Check karo item pehle se liked hai kya
    const isLiked = wishlist.some((item) => item._id === productId || item.productId === productId);

    try {
      if (isLiked) {
        await API.post("/api/like/dislikeProduct", { productId });
      } else {
        await API.post("/api/like/likeProduct", { productId });
      }
      fetchWishlist(); // List refresh karo
    } catch (error) {
      console.log("Like Error", error);
    }
  };

  return (
    <ShopContext.Provider value={{ cart, wishlist, addToCart, removeFromCart, toggleLike }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);