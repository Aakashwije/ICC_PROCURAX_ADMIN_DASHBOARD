'use client';

import { Bell, Settings, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken } from "@/utils/auth";

export default function Header() {
  const router = useRouter();
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );

  const getHealthBadgeClass = () => {
    switch (healthStatus) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-amber-500";
    }
  };

  const getHealthLabel = () => {
    switch (healthStatus) {
      case "online":
        return "Backend Online";
      case "offline":
        return "Backend Offline";
      default:
        return "Checking...";
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await fetch("/api");
        if (!isMounted) return;
        setHealthStatus(res.ok ? "online" : "offline");
      } catch (err) {
        console.error("Health check failed", err);
        if (!isMounted) return;
        setHealthStatus("offline");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    clearToken();
    // Redirect to login page (keep saved email if remember me was checked)
    router.replace('/login');
  };
  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">{getCurrentDate()}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
            <span className={`h-2 w-2 rounded-full ${getHealthBadgeClass()}`} />
            <span>{getHealthLabel()}</span>
          </div>
          <button
            aria-label="Notifications"
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <Bell size={18} className="text-slate-700" />
          </button>

          <button
            aria-label="Settings"
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <Settings size={18} className="text-slate-700" />
          </button>

          <button
            aria-label="Logout"
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition flex items-center gap-2 text-red-600 hover:text-red-700"
            title="Logout"
          >
            <LogOut size={18} />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-600">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              <User size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
