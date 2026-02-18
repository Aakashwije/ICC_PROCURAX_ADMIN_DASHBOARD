'use client';

import { useEffect, useState } from 'react';
import { addActivity } from '@/utils/activityLogger';

interface ProjectManager {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  projects: number;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

import { getManagers, updateManager, deleteManager, toggleManagerAccess } from '@/services/api';

export default function ProjectManagersTable() {
  const [managers, setManagers] = useState<ProjectManager[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedManager, setSelectedManager] = useState<ProjectManager | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  // -------------------------------
  // Fetch Project Managers
  // -------------------------------
  const fetchManagers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getManagers(token);
      setManagers(data);
    } catch (err) {
      console.error('Failed to load managers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // -------------------------------
  // Toggle Access (Active / Inactive)
  // -------------------------------
  const toggleAccess = async (manager: ProjectManager) => {
    if (!token) return;
    await toggleManagerAccess(token, manager._id);

    addActivity(
      manager.isActive ? 'Mobile Access Revoked' : 'Mobile Access Granted',
      manager.name,
      manager.isActive ? 'access_revoked' : 'access_granted'
    );

    fetchManagers();
  };

  // -------------------------------
  // Approve / Pending / Inactive
  // -------------------------------
  const updateStatus = async (
    manager: ProjectManager,
    status: 'active' | 'pending' | 'inactive'
  ) => {
    if (!token) return;
    await updateManager(token, manager._id, {
        isApproved: status === 'active',
        isActive: status !== 'inactive',
    });

    fetchManagers();
  };

  // -------------------------------
  // Edit Manager
  // -------------------------------
  const handleEditClick = (manager: ProjectManager) => {
    setSelectedManager(manager);
    setEditFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone || '',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!selectedManager || !token) return;

    await updateManager(token, selectedManager._id, editFormData);

    addActivity(
      'Manager Information Updated',
      selectedManager.name,
      'manager_edited'
    );

    setShowEditModal(false);
    setSelectedManager(null);
    fetchManagers();
  };

  // -------------------------------
  // Delete Manager
  // -------------------------------
  const handleDeleteConfirm = async () => {
    if (!selectedManager || !token) return;

    await deleteManager(token, selectedManager._id);

    addActivity(
      'Manager Deleted',
      selectedManager.name,
      'manager_deleted'
    );

    setShowDeleteConfirm(false);
    setSelectedManager(null);
    fetchManagers();
  };

  const getStatus = (manager: ProjectManager) => {
    if (!manager.isApproved) return 'pending';
    if (!manager.isActive) return 'inactive';
    return 'active';
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

  if (loading) {
    return <p className="text-slate-600">Loading project managers...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-300">
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Email</th>
            <th className="px-6 py-4 text-left">Projects</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Mobile Access</th>
            <th className="px-6 py-4 text-left">Date Added</th>
            <th className="px-6 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {managers.map((manager) => {
            const status = getStatus(manager);

            return (
              <tr key={manager._id} className="border-b">
                <td className="px-6 py-4">{manager.name}</td>
                <td className="px-6 py-4">{manager.email}</td>
                <td className="px-6 py-4">{manager.projects}</td>
                <td className="px-6 py-4">
                  <select
                    value={status}
                    onChange={(e) =>
                      updateStatus(
                        manager,
                        e.target.value as 'active' | 'pending' | 'inactive'
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      status
                    )}`}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleAccess(manager)}
                    className={`px-4 py-2 rounded-lg ${
                      manager.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {manager.isActive ? '✓ Granted' : '✗ Denied'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  {new Date(manager.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEditClick(manager)}
                    className="text-blue-600 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedManager(manager);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modals remain SAME UI logic */}
      {/* Your existing modal JSX can stay unchanged */}
    </div>
  );
}
