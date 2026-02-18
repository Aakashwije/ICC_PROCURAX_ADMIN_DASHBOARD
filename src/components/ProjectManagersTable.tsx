'use client';

import { useCallback, useEffect, useState } from 'react';
import { addActivity } from '@/utils/activityLogger';
import { getToken } from '@/utils/auth';

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

  const token = getToken();

  // -------------------------------
  // Fetch Project Managers
  // -------------------------------
  const fetchManagers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getManagers(token);
      const normalized: ProjectManager[] = data.map((manager) => ({
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        projects: 0,
        isApproved: manager.isApproved ?? false,
        isActive: manager.isActive ?? false,
        createdAt: manager.createdAt ?? new Date().toISOString(),
      }));
      setManagers(normalized);
    } catch (err) {
      console.error('Failed to load managers', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

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
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
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

      {showEditModal && selectedManager && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Edit Manager
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-manager-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Name
                </label>
                <input
                  id="edit-manager-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-manager-email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="edit-manager-email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-manager-phone"
                  className="block text-sm font-medium text-slate-700"
                >
                  Phone
                </label>
                <input
                  id="edit-manager-phone"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedManager && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Manager
            </h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete {selectedManager.name}?
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
