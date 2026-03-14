'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  // Start with consistent initial state for both server and client
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Only use pathname after hydration to prevent server/client mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Project Managers", icon: Users, href: "/dashboard/managers" },
    { name: "App Users", icon: Users, href: "/dashboard/mobile-users" },
    { name: "Projects", icon: FolderKanban, href: "/dashboard/projects" },
    { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  // Calculate isActive only after hydration to ensure server/client match
  const getIsActive = (href: string) => {
    if (!isMounted) return false; // Default to false on server
    
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href + "/"))
    );
  };

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-slate-900 text-white transition-all duration-300 h-screen fixed left-0 top-0 shadow-lg`}
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        {isOpen && <h1 className="text-2xl font-bold">ICC Admin</h1>}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="mt-6 space-y-2 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-lg transition group
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-slate-800 text-slate-200"
                }
              `}
            >
              <Icon
                size={20}
                className={`${isActive ? "text-white" : "text-slate-300"}`}
              />

              {isOpen && (
                <span className="text-sm font-medium">{item.name}</span>
              )}

              {!isOpen && (
                <div className="absolute left-20 bg-slate-800 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap text-sm">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
