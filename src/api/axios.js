import axios from "axios";

// ✅ Your backend runs on port 3003
const BASE_URL = "http://localhost:3003";

const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Automatically include your JWT access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
