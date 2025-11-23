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




  return (
    <ShopContext.Provider value={{ }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);