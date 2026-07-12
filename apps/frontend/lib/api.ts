import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data;
      if (data?.error?.message) {
        return Promise.reject(new Error(data.error.message));
      }
      if (data?.error && typeof data.error === "string") {
        return Promise.reject(new Error(data.error));
      }
    }
    if (error.request && !error.response) {
      return Promise.reject(new Error("Network error. Check your connection."));
    }
    return Promise.reject(error);
  }
);

export default api;
