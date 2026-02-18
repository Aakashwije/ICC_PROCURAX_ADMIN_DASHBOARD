"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogIn, Lock, Mail } from "lucide-react";
import { adminLogin } from "@/services/api";
import {
  getRememberedEmail,
  setRememberedEmail,
  clearRememberedEmail,
  setToken,
  getToken,
} from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      router.replace("/dashboard");
      return;
    }

    const savedEmail = getRememberedEmail();

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    localStorage.removeItem('rememberedPassword');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await adminLogin(email, password);

      if (response?.success && response?.token) {
        setToken(response.token);
        if (rememberMe) {
          setRememberedEmail(email);
        } else {
          clearRememberedEmail();
        }

        router.push("/dashboard");
      } else {
        setError(response?.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login failed", err);
      setError("Unable to login right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <Image
                src="/icc_logo.jpg"
                alt="ICC Logo"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <LogIn size={20} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
            </div>
            <p className="text-slate-600 mt-2">
              ICC ProcuraX Admin Dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-slate-700">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-slate-600 text-sm mt-6">
            Test credentials: admin@example.com / password
          </p>
        </div>

        {/* Background decorations */}
        <div className="mt-8 text-center text-slate-300 text-sm">
          <p>© ICC ProcuraX 2026</p>
        </div>
      </div>
    </div>
  );
}
