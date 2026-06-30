import axios from "axios";
import { getAuthToken } from "@/lib/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";

console.log(" API Base URL:", API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add request interceptor for token + debugging
apiClient.interceptors.request.use(
  async (config) => {
    // Auto-attach token
    const token = await getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    console.log(" Request:", config.method?.toUpperCase(), config.url);
    console.log(" Token attached:", !!token);
    
    return config;
  },
  (error) => {
    console.error(" Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;