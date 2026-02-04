'use client';

import { useState, useEffect } from 'react';
import { addActivity } from '@/utils/activityLogger';

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

interface Project {
  id: number;
  name: string;
  managerId: string | null;
}

export default function ProjectManagersTable() {
  const [managers, setManagers] = useState<ProjectManager[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedManager, setSelectedManager] = useState<ProjectManager | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Load managers from localStorage on mount
  useEffect(() => {
    const storedManagers = localStorage.getItem('projectManagers');
    if (storedManagers) {
      setManagers(JSON.parse(storedManagers));
    } else {
      // Set default managers if none exist
      const defaultManagers = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0101',
          projects: 0,
          status: 'active' as const,
          accessGranted: true,
          dateAdded: '2025-01-15',
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0102',
          projects: 0,
          status: 'active' as const,
          accessGranted: true,
          dateAdded: '2025-01-10',
        },
        {
          id: '3',
          name: 'Mike Davis',
          email: 'mike.davis@example.com',
          phone: '+1-555-0103',
          projects: 0,
          status: 'pending' as const,
          accessGranted: false,
          dateAdded: '2025-01-20',
        },
      ];
      setManagers(defaultManagers);
      localStorage.setItem('projectManagers', JSON.stringify(defaultManagers));
    }
  }, []);

  // Update project counts based on localStorage projects
  useEffect(() => {
    const updateProjectCounts = () => {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const projects: Project[] = JSON.parse(storedProjects);
        
        setManagers(prevManagers =>
          prevManagers.map(manager => ({
            ...manager,
            projects: projects.filter(p => p.managerId === manager.id).length,
          }))
        );
      }
    };

    // Initial update
    updateProjectCounts();

    // Set up an interval to check for updates
    const interval = setInterval(updateProjectCounts, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleAccess = (id: string) => {
    const manager = managers.find(m => m.id === id);
    const updatedManagers = managers.map(m =>
      m.id === id
        ? { ...m, accessGranted: !m.accessGranted }
        : m
    );
    setManagers(updatedManagers);
    localStorage.setItem('projectManagers', JSON.stringify(updatedManagers));
    
    // Log activity
    if (manager) {
      addActivity(
        manager.accessGranted ? 'Mobile Access Revoked' : 'Mobile Access Granted',
        manager.name,
        manager.accessGranted ? 'access_revoked' : 'access_granted'
      );
    }
  };

  const updateStatus = (id: string, newStatus: 'active' | 'pending' | 'inactive') => {
    const updatedManagers = managers.map(manager =>
      manager.id === id ? { ...manager, status: newStatus } : manager
    );
    setManagers(updatedManagers);
    localStorage.setItem('projectManagers', JSON.stringify(updatedManagers));
  };

  const handleEditClick = (manager: ProjectManager) => {
    setSelectedManager(manager);
    setEditFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
    });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (!selectedManager) return;

    const updatedManagers = managers.map(manager =>
      manager.id === selectedManager.id
        ? { ...manager, ...editFormData }
        : manager
    );
    setManagers(updatedManagers);
    localStorage.setItem('projectManagers', JSON.stringify(updatedManagers));
    
    // Log activity
    addActivity('Manager Information Updated', selectedManager.name, 'manager_edited');
    
    setShowEditModal(false);
    setSelectedManager(null);
  };

  const handleDeleteClick = (manager: ProjectManager) => {
    setSelectedManager(manager);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedManager) return;

    const updatedManagers = managers.filter(manager => manager.id !== selectedManager.id);
    setManagers(updatedManagers);
    localStorage.setItem('projectManagers', JSON.stringify(updatedManagers));
    
    // Log activity
    addActivity('Manager Deleted', selectedManager.name, 'manager_deleted');
    
    // Also remove manager from any projects
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const projects = JSON.parse(storedProjects);
      const updatedProjects = projects.map((project: any) =>
        project.managerId === selectedManager.id
          ? { ...project, manager: 'Unassigned', managerId: null }
          : project
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }

    setShowDeleteConfirm(false);
    setSelectedManager(null);
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
                <button 
                  onClick={() => handleEditClick(manager)}
                  className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteClick(manager)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {showEditModal && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Project Manager</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedManager(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Confirm Delete</h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{selectedManager.name}</strong>? 
              This will also remove them from all assigned projects.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedManager(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition"
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
