"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogIn, Lock, Mail } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState("");

  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return;
    
    if (pass.length < 8) {
      setPasswordWarning("⚠️ Weak password: Use at least 8 characters for better security.");
      return;
    }
    
    const hasNumber = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome'];
    const isCommon = commonPasswords.some(common => pass.toLowerCase().includes(common));
    
    if (isCommon) {
      setPasswordWarning("⚠️ This is a commonly used password. Consider using a stronger one.");
    } else if (!hasNumber || !hasLetter) {
      setPasswordWarning("⚠️ Weak password: Include both letters and numbers for better security.");
    } else if (!hasSpecial) {
      setPasswordWarning("⚠️ Good password, but adding special characters would make it stronger.");
    } else {
      setPasswordWarning("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (email && password) {
        router.push("/dashboard");
      } else {
        setError("Please enter both email and password");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 overflow-hidden border border-slate-200">
              <Image
                src="/icc_logo.jpg"
                alt="ICC Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-2">ICC Procurax Admin</h1>
            <p className="text-slate-600 text-sm">Sign in to access the dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                  placeholder="admin@iccprocurax.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {passwordWarning && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                {passwordWarning}
                <p className="text-xs mt-1 text-yellow-700">You can still continue if you wish.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-6">
            Demo mode: Use any credentials to sign in
          </p>
        </div>
      </div>
    </div>
  );
}
