import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  
  
  const handleButtonClick = () => {
    if (auth.isAuthenticated) {
      navigate(auth.user.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 bg-white shadow-lg rounded-md max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Welcome to Secure File Sharing
        </h1>
        {auth.isAuthenticated ? (
          <p className="text-lg text-gray-700">
            Welcome, How
            are you today?
          </p>
        ) : (
          <p className="text-lg text-gray-700">
            Share files securely with ease.
          </p>
        )}
        <button
          onClick={handleButtonClick}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
        >
          {auth.isAuthenticated ? "Go to Dashboard" : "Login"}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
