import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/apiConfig";
import TwoFactorAuthGeneration from "@/components/TwoFactorAuthGeneration";
import { MotionDiv } from "../utils/motionConfig";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGenerate2FA, setGenerate2FA] = useState(false);
  const [twoFA_setup, setTwoFA_setup] = useState({});

  // On component mount, restore state from local storage
  useEffect(() => {
    const stored2FAState = localStorage.getItem("isGenerate2FA");
    const stored2FASetup = localStorage.getItem("twoFA_setup");

    if (stored2FAState === "true" && stored2FASetup) {
      setGenerate2FA(true);
      setTwoFA_setup(JSON.parse(stored2FASetup));
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await api.post("/auth/register/", { email, password });
      if (response.status === 201) {
        setGenerate2FA(true);
        setTwoFA_setup(response.data.twoFA_setup);

        localStorage.setItem("isGenerate2FA", "true");
        localStorage.setItem("twoFA_setup", JSON.stringify(response.data.twoFA_setup));
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <MotionDiv className="min-h-screen bg-stone-50 flex justify-center items-center">
      {isGenerate2FA ? (
        <TwoFactorAuthGeneration
          twoFA_setup={twoFA_setup}
        />
      ) : (
        <form onSubmit={handleRegister} className="bg-white p-12 rounded-xl shadow-xl w-96 space-y-6">
          <h3 className="text-3xl font-bold text-center text-black shadow-sm">Create an Account</h3>

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
                autoComplete="new-password"
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

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="block text-md font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full p-2 rounded-2xl border-2 border-black text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition duration-200"
          >
            Sign up
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-black hover:underline">
                Log in
              </a>
            </p>
          </div>
        </form>
      )}
    </MotionDiv>
  );
};

export default RegisterPage;
