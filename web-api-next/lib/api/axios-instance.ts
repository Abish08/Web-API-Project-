import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";

console.log(" API Base URL:", API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(" Request:", config.method?.toUpperCase(), config.url);
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