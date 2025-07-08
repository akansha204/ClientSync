"use client";
import { useState } from "react";
import Image from "next/image";
import SignupBtn from "@/components/signupBtn";
import LoginBtn from "@/components/LoginBtn";

export default function Home() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleShowSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleShowLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ClientSync</h1>
          </div>
          <p className="text-gray-600">
            Manage your clients efficiently with AI-powered follow-ups
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <LoginBtn onSignupClick={handleShowSignup} />
          <SignupBtn
            isOpen={isSignupOpen}
            onOpenChange={setIsSignupOpen}
            onLoginClick={handleShowLogin}
          />
        </div>
      </div>
    </div>
  );
}
