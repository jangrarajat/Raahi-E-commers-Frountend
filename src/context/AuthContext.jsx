import React, { createContext, useContext, useState } from "react";

// 1. Context Create kiya (Dabba banaya)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 2. State: Abhi user 'null' hai matlab koi login nahi hai
  const [user, setUser] = useState(null);

  // --- FAKE LOGIN FUNCTION ---
  // (Asli app me hum yahan API call karte, abhi bas data set kar rahe hain)
  const login = (email, password) => {
    // Hum maan lete hain login successful ho gaya
    // Aur hum ek nakli user data save kar dete hain
    const dummyUser = {
      name: "Rajat Jangra",
      email: email, // Jo email aayi wahi save kar li
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

  // 3. Value: Ye cheezein puri app me available hongi
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook: Isko dusre pages me use karenge
export const useAuth = () => useContext(AuthContext);