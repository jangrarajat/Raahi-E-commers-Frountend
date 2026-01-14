import axios from 'axios';
// Aapka banaya hua function yahan import kar rahe hain
import { refreshExpriedToken } from './refreshExpiredToken'; 

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
    withCredentials: true // Cookies bhejne ke liye zaroori hai
});

// Response Interceptor (Jasoos 👀)
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Agar 401 (Unauthorized) aaya aur humne pehle retry nahi kiya
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Loop rokne ke liye flag lagaya

            try {
                // Aapka function call kiya
                const isRefreshed = await refreshExpriedToken();

                if (isRefreshed) {
                    // Agar refresh success hua, toh wahi purani request dobara bhejo
                    return API(originalRequest);
                }
            } catch (refreshError) {
                console.error("Session Expired completely", refreshError);
                // Agar refresh bhi fail hua toh login pe bhejo
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default API;