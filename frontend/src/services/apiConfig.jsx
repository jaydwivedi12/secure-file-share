import axios from "axios";

// Base URL configuration
const baseURL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000/api"
    : "http://127.0.0.1:8000/api";

// Function to get a specific cookie by name
const getCookie = (name) => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
};

// Create Axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // Ensures cookies are sent with requests
});

// Add CSRF token to headers if present
api.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

export default api;
