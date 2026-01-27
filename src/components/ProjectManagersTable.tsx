'use client';

import { useState } from 'react';

interface ProjectManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  projects: number;
  status: 'active' | 'pending' | 'inactive';
  accessGranted: boolean;
  dateAdded: string;
}

export default function ProjectManagersTable() {
  const [managers, setManagers] = useState<ProjectManager[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-0101',
      projects: 5,
      status: 'active',
      accessGranted: true,
      dateAdded: '2025-01-15',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1-555-0102',
      projects: 3,
      status: 'active',
      accessGranted: true,
      dateAdded: '2025-01-10',
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@example.com',
      phone: '+1-555-0103',
      projects: 0,
      status: 'pending',
      accessGranted: false,
      dateAdded: '2025-01-20',
    },
  ]);

  const toggleAccess = (id: string) => {
    setManagers(managers.map(manager =>
      manager.id === id
        ? { ...manager, accessGranted: !manager.accessGranted }
        : manager
    ));
  };

  const updateStatus = (id: string, newStatus: 'active' | 'pending' | 'inactive') => {
    setManagers(managers.map(manager =>
      manager.id === id ? { ...manager, status: newStatus } : manager
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-300">
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Phone</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Projects</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Mobile Access</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date Added</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {managers.map((manager) => (
            <tr key={manager.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{manager.name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{manager.email}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{manager.phone}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{manager.projects}</td>
              <td className="px-6 py-4">
                <select
                  value={manager.status}
                  onChange={(e) => updateStatus(manager.id, e.target.value as ProjectManager['status'])}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${getStatusColor(
                    manager.status
                  )}`}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => toggleAccess(manager.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    manager.accessGranted
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  {manager.accessGranted ? '✓ Granted' : '✗ Denied'}
                </button>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{manager.dateAdded}</td>
              <td className="px-6 py-4 text-sm">
                <button className="text-blue-600 hover:text-blue-800 font-medium mr-4">Edit</button>
                <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
