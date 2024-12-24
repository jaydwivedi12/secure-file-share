import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/apiConfig";
import TwoFactorAuth from "../components/TwoFactorAuth";
import { MotionDiv } from "../utils/motionConfig";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [is2FA, setIs2FA] = useState(false); // To toggle the 2FA component

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login/", { email, password });
      if (response.status === 200) {
        setIs2FA(true); // Show the 2FA component
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <MotionDiv className="min-h-screen  bg-stone-50 flex justify-center items-center">
      {is2FA ? (
        <TwoFactorAuth email={email} />
      ) : (
        <form onSubmit={handleLogin} className="bg-white p-12 rounded-xl shadow-xl w-96 space-y-6">
          <h3 className="text-3xl font-bold text-center text-black shadow-sm">Welcome Back</h3>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-md font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded-2xl border-2 border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-md font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 rounded-2xl border-2 border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition duration-200"
          >
            Log in
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="text-black hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </form>
      )}
    </MotionDiv>
  );
};

export default LoginPage;
