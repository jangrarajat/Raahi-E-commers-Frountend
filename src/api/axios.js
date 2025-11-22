import axios from "axios";

// Backend ka base URL yahan daalo
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Ya jo bhi tumhara backend URL ho
  withCredentials: true, // Important: Cookies handle karne ke liye
});

export default API;