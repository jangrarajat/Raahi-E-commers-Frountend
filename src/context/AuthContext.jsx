import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App load hone par check karo agar user pehle se login hai (Optional - agr 'me' endpoint ho)
  useEffect(() => {
    // Abhi ke liye hum assume krte h ki page refresh pr user state reset hogi
    // Real app me yahan /api/user/me call krke user verify krte hain
    setLoading(false);
  }, []);

  // --- REGISTER ---
  const register = async (formData) => {
    try {
      const { data } = await API.post("/api/user/registration", formData);
      if (data.success) {
        setUser(data.user); 
        return { success: true, message: "Registration Successful" };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration Failed" };
    }
  };

  // --- LOGIN ---
  const login = async (email, password) => {
    try {
      const { data } = await API.post("/api/user/login", { email, password });
      if (data.success) {
        setUser(data.user); // Backend se user data aana chahiye
        return { success: true, message: "Login Successful" };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login Failed" };
    }
  };

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await API.get("/api/user/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);