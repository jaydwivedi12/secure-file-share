import React, { createContext, useState, useContext,useEffect } from "react";
import api from "../services/apiConfig";
// Create AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const authStatus = async () => {
    try {
      const response = await api.post("/auth/verify-token/");
      if (response.status === 200) {
        setAuth({ isAuthenticated: true, user: response.data , isLoading: false });
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      setAuth({ isAuthenticated: false, user: null, isLoading: false });
    }
  };

  // Auto verify on mount
  useEffect(() => {
     authStatus();
  }, []);


  const login = (userData) => {
    setAuth({ isAuthenticated: true, user: userData });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, authStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
