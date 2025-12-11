import React, { createContext, use, useContext, useEffect, useState } from "react";
import axios from "axios";
// 1. Context Create kiya (Dabba banaya)
const AuthContext = createContext();
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }) => {
  // 2. State: Abhi user 'null' hai matlab koi login nahi hai
  const [user, setUser] = useState(null);
  const [catProduct, setCatProduct] = useState([])
  const [showAuth, setShowAuth] = useState(false)
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginLaoding, setLoginLaoding] = useState(false)
  const [registrationLaoding, setRegistrationLaoding] = useState(false)
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState(false)
  const [registrationFailedMsg, setRegistrationFailedMsg] = useState(false)
  const [registrationErrorMsg, setRegistrationErrorMsg] = useState("")
  const [loginFailedMsg, setLoginFailedMsg] = useState(false)
  const [loginErrorMsg, setLoginErrorMsg] = useState("")
  const [logoutLoading, setLogoutLoading] = useState(false)
  const navigate = useNavigate()


  const login = async (email, password) => {
    setLoginLaoding(true)

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/login`, { email, password }, { withCredentials: true })
      console.log("Login ho gaya:", res.data.user);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user))
      
      setShowAuth(false)
      setLoginLaoding(false)
      navigate('/user')
      return { success: true, message: "Login Successful " };
    } catch (error) {
      setLoginLaoding(false)
      setLoginFailedMsg(true)

      setLoginErrorMsg(error.response?.data.message)
      console.log("error in login", error)
      if (error.message === "Network Error") return setLoginErrorMsg(error.message)
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) return setUser(user)
  }, [])




  // --- LOGOUT FUNCTION ---
  const logout = async () => {
    setLogoutLoading(true)
    try {
      localStorage.removeItem('user')
      window.location.href = "/"
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/logout`, {}, { withCredentials: true })
      console.log(res)
      setUser(null);
      console.log("User Logout ho gaya");
    } catch (error) {
      console.log("error in logout", error.response.data.message )
      if (error.response.data.message === "jwt expired" || "UnAuthroize request") {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/refreshExpiredToken`, {}, { withCredentials: true })
          console.log(res)
          logout()

        } catch (error) {
          console.log("error in refreshExpiredtoken", error.response.data.message)
          throw error
        } finally {
          setLogoutLoading(false)
        }
      }

    }
  };


  const Registration = async (username, email, password) => {
    setRegistrationLaoding(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/registration`, { username, email, password })
      setRegistrationSuccessMsg(true)
      console.log(res)
    } catch (error) {
      setRegistrationFailedMsg(true)
      setRegistrationErrorMsg(error.response.data.message)
      console.log("error in registration", error)

    } finally {
      setRegistrationLaoding(false)
    }
  }


  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      catProduct,
      setCatProduct,
      showAuth,
      setShowAuth,
      isLoginView,
      setIsLoginView,
      loginLaoding,
      registrationLaoding,
      Registration,
      registrationSuccessMsg,
      registrationFailedMsg,
      setRegistrationSuccessMsg,
      setRegistrationFailedMsg,
      registrationErrorMsg,
      setRegistrationErrorMsg,
      loginFailedMsg,
      setLoginFailedMsg,
      loginErrorMsg,
      setLoginErrorMsg,
      logoutLoading,
      setLogoutLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook: Isko dusre pages me use karenge
export const useAuth = () => useContext(AuthContext);