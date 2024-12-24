import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import api from "../services/apiConfig";
import { toast } from "react-toastify";
import { MotionDiv } from "@/utils/motionConfig";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const TwoFactorAuthVerify = ({ email }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [token, setToken] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (/\D/.test(value)) return; // Allow only numeric input

    const newToken = [...token];
    newToken[index] = value;
    setToken(newToken);

    // Automatically focus the next input if the current one is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !token[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/verify2fa/", {
        email,
        token: token.join(""),
      });

      if (response.status === 200) {
        toast.success("Login successful!");
        const userData = response.data;
        login(userData);
        navigate(userData.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
      }
    } catch (error) {
      console.error("2FA verification failed:", error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <MotionDiv className=" bg-stone-50 flex justify-center items-center">
    <Card className="bg-white rounded-xl space-y-6 mt-10 p-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <form onSubmit={handle2FA}>
        <CardContent>
          <div className="flex justify-center gap-2 mb-4">
            {token.map((digit, index) => (
              <Input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-12 h-12 text-center text-lg font-semibold border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition duration-200">
            Verify
          </Button>
        </CardFooter>
      </form>
    </Card>
    </MotionDiv>
  );
};

export default TwoFactorAuthVerify;
