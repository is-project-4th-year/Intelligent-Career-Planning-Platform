import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Define a base URL that works with both development and production
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"; // Ensure this points to the backend

const api = axios.create({
  baseURL
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API error:", error.response || error);
    return Promise.reject(error);
  }
);

export default api;