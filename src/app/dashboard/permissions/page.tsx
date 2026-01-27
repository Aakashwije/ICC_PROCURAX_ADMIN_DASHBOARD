'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Check, KeyRound } from 'lucide-react';

export default function PermissionsPage() {
  const rolePermissions = [
    {
      role: 'Project Manager',
      permissions: [
        'View assigned projects',
        'Edit project details',
        'Upload documents',
        'Generate reports',
        'View team members',
      ],
    },
    {
      role: 'Site Manager',
      permissions: [
        'View assigned projects',
        'Assign workers',
        'Track daily progress',
        'Report safety issues',
        'Upload site photos',
      ],
    },
    {
      role: 'Administrator',
      permissions: [
        'Full system access',
        'Manage users',
        'Configure permissions',
        'View reports',
        'System settings',
      ],
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <KeyRound size={24} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Permissions</h1>
            </div>
            <p className="text-slate-600 mt-2">Manage role-based permissions for the mobile application</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rolePermissions.map((rolePerms) => (
              <div key={rolePerms.role} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{rolePerms.role}</h3>
                <ul className="space-y-3">
                  {rolePerms.permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check size={16} className="text-green-500" />
                      <span className="text-sm text-slate-700">{perm}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-6 border border-blue-600 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 transition">
                  Edit Role
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
