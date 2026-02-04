'use client';

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  KeyRound,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname(); 

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Project Managers", icon: Users, href: "/dashboard/managers" },
    { name: "Projects", icon: FolderKanban, href: "/dashboard/projects" },
    { name: "Permissions", icon: KeyRound, href: "/dashboard/permissions" },
    { name: "Reports", icon: BarChart3, href: "/dashboard/reports" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

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

        
          // Treat the top-level dashboard route as an exact match only.
          // For other menu items allow prefix matching so nested routes remain active.
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

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
