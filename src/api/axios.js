import axios from "axios";

// 🔥 Use your deployed backend URL on Render
const BASE_URL = "https://ems-backend-ss37.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
});

// 🔒 Automatically attach JWT access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
