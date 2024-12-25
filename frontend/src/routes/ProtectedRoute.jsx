import React from "react";
import { Navigate, Outlet} from "react-router";
import { useAuth } from "../contexts/AuthContext";
import Loader from "@/components/loader";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ProtectedRoute = ({ allowedRoles }) => {

  const { auth,authStatus } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  const verify = async () => {
    if (!auth.isAuthenticated) {
      await authStatus();
    }
    setIsVerifying(false);
  };

  useEffect(() => {
      verify();
  }, []);


  if (auth.isLoading || isVerifying) {
    return <Loader />;
  }

 
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(auth.user?.role)) {
    toast.error("You are not authorized to view this page.Redirecting Dashboard");
    return <Navigate to={auth.user.role === "admin"? "/admin-dashboard" : "/user-dashboard"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
