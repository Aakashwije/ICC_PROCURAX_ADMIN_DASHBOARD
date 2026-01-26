'use client';

import { useState } from 'react';

interface Permission {
  id: string;
  feature: string;
  description: string;
  canGrant: boolean;
}

export default function AccessControlPanel() {
  const [selectedManager, setSelectedManager] = useState('1');
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: '1',
      feature: 'View Projects',
      description: 'Allow project managers to view all assigned projects',
      canGrant: true,
    },
    {
      id: '2',
      feature: 'Edit Project Details',
      description: 'Modify project information and status',
      canGrant: true,
    },
    {
      id: '3',
      feature: 'Assign Workers',
      description: 'Assign and manage workers on projects',
      canGrant: false,
    },
    {
      id: '4',
      feature: 'Upload Documents',
      description: 'Upload project documents and reports',
      canGrant: true,
    },
    {
      id: '5',
      feature: 'View Budget',
      description: 'Access project budget and expenses',
      canGrant: false,
    },
    {
      id: '6',
      feature: 'Generate Reports',
      description: 'Create and export project reports',
      canGrant: true,
    },
  ]);

  const togglePermission = (id: string) => {
    setPermissions(permissions.map(perm =>
      perm.id === id ? { ...perm, canGrant: !perm.canGrant } : perm
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Select Project Manager
        </label>
        <select
          value={selectedManager}
          onChange={(e) => setSelectedManager(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="1">John Smith</option>
          <option value="2">Sarah Johnson</option>
          <option value="3">Mike Davis</option>
        </select>
      </div>

      <div className="space-y-3">
        {permissions.map((perm) => (
          <div
            key={perm.id}
            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{perm.feature}</h3>
              <p className="text-sm text-slate-600">{perm.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={perm.canGrant}
                onChange={() => togglePermission(perm.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <button className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
        Save Permissions
      </button>
    </div>
  );
}
