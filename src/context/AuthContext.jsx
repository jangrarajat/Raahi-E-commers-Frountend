import React, { createContext, useContext, useState } from "react";

// 1. Context Create kiya (Dabba banaya)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 2. State: Abhi user 'null' hai matlab koi login nahi hai
  const [user, setUser] = useState(null);
  const  [catProduct , setCatProduct] = useState([])
 



  const login = (email, password) => {
  
    const dummyUser = {
      name: "Rajat Jangra",
      email: email, 
      role: "admin"
    };

    setUser(dummyUser); // State update ho gayi -> User Login ho gaya!
    console.log("Login ho gaya:", dummyUser);
    return { success: true, message: "Login Successful (Dummy)" };
  };

  // --- LOGOUT FUNCTION ---
  const logout = () => {
    setUser(null); // User ko wapis null kar diya -> Logout ho gaya
    console.log("User Logout ho gaya");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout , catProduct, setCatProduct }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook: Isko dusre pages me use karenge
export const useAuth = () => useContext(AuthContext);