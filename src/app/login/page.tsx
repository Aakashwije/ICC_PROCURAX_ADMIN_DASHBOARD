"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

            <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-slate-700">Remember me</span>
              </label>
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot password?
              </Link>
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
          <p>© 2026 Construction Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
