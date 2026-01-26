import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: '📊', href: '/dashboard' },
    { name: 'Project Managers', icon: '👥', href: '/dashboard/managers' },
    { name: 'Access Control', icon: '🔐', href: '/dashboard/access' },
    { name: 'Projects', icon: '🏗️', href: '/dashboard/projects' },
    { name: 'Permissions', icon: '⚙️', href: '/dashboard/permissions' },
    { name: 'Reports', icon: '📈', href: '/dashboard/reports' },
    { name: 'Settings', icon: '⚡', href: '/dashboard/settings' },
  ];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 h-screen fixed left-0 top-0 shadow-lg`}>
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        {isOpen && <h1 className="text-2xl font-bold">CM Admin</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <nav className="mt-6 space-y-2 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-slate-800 transition group"
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.name}</span>}
            {!isOpen && (
              <div className="absolute left-20 bg-slate-800 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                {item.name}
              </div>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
