import React, { createContext, useState, useContext,useEffect } from "react";
import api from "../services/apiConfig";
import { toast } from "react-toastify";

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

  const logout = async () => {
    try {
      const response = await api.post('/auth/logout/');
  
      if (response.status === 200) {

        setAuth({ isAuthenticated: false, user: null });
        toast.info('Logged out successfully!'); 
        navigate('/login'); 
      } else {
        toast.error('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, authStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
