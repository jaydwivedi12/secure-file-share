import React, { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth} = useAuth();

  // Redirect if authenticated and visiting the login page
  useEffect(() => {
    if ((location.pathname === "/login" || location.pathname==='/login/') && auth.isAuthenticated) {
        navigate(auth.user.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
    }
    if(location.pathname === "/logout" || location.pathname==='/logout/' && !auth.isAuthenticated){
      navigate("/login");
    }
  }, [auth.isAuthenticated, location.pathname, navigate]);

  return <Outlet/>;
};

export default PublicRoute;
