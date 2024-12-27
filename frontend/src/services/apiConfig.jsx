import axios from "axios";

// Base URL configuration
const baseURL = 'https://localhost/api'  

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
