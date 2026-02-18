'use client';

import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { FolderKanban, Plus, X, ExternalLink, Edit } from 'lucide-react';
import { addActivity } from '@/utils/activityLogger';
import { getToken } from '@/utils/auth';
import {
  addProject,
  assignManager,
  deleteProject,
  getManagers,
  getProjects,
  updateProject,
} from '@/services/api';

interface Project {
  _id: string;
  name: string;
  managerName: string;
  managerId: string | null;
  status: string;
  sheetUrl: string;
}

interface Manager {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const token = getToken();

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getProjects(token);
      setProjects(
        data.map((project) => ({
          _id: project._id,
          name: project.name,
          managerName: project.managerName ?? 'Unassigned',
          managerId: project.managerId ?? null,
          status: project.status ?? 'Active',
          sheetUrl: project.sheetUrl,
        }))
      );
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  }, [token]);

  const fetchManagers = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getManagers(token);
      setManagers(
        data.map((manager) => ({
          id: manager._id,
          name: manager.name,
        }))
      );
    } catch (err) {
      console.error('Failed to load managers', err);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, [fetchManagers, fetchProjects]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const submit = async () => {
      try {
        await addProject(token, { name: projectTitle, sheetUrl: googleSheetUrl });
        addActivity('New Project Added', projectTitle, 'project_added');
        await fetchProjects();
        setProjectTitle('');
        setGoogleSheetUrl('');
        setShowAddModal(false);
      } catch (err) {
        console.error('Failed to add project', err);
      }
    };

    void submit();
  };

  const handleAssignManager = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find(p => p._id === projectId);
    setSelectedManagerId(project?.managerId || '');
    setShowAssignModal(true);
  };

  const handleSaveAssignment = () => {
    if (selectedProjectId === null) return;

    if (!token) return;
    const selectedManager = managers.find(m => m.id === selectedManagerId);
    const project = projects.find(p => p._id === selectedProjectId);

    const submit = async () => {
      try {
        await assignManager(token, {
          projectId: selectedProjectId,
          managerId: selectedManagerId || null,
        });
        if (project && selectedManager) {
          addActivity(
            `${selectedManager.name} Assigned to ${project.name}`,
            selectedManager.name,
            'project_assigned'
          );
        }
        if (project && !selectedManagerId) {
          addActivity(
            `Manager Removed from ${project.name}`,
            'System',
            'project_unassigned'
          );
        }
        await fetchProjects();
      } catch (err) {
        console.error('Failed to assign manager', err);
      } finally {
        setShowAssignModal(false);
        setSelectedProjectId(null);
        setSelectedManagerId('');
      }
    };

    void submit();
  };

  const handleRemoveManager = (projectId: string) => {
    if (!token) return;
    const project = projects.find(p => p._id === projectId);

    const submit = async () => {
      try {
        await assignManager(token, { projectId, managerId: null });
        if (project && project.managerName !== 'Unassigned') {
          addActivity(
            `${project.managerName} Removed from ${project.name}`,
            project.managerName,
            'project_unassigned'
          );
        }
        await fetchProjects();
      } catch (err) {
        console.error('Failed to remove manager', err);
      }
    };

    void submit();
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedProject) return;

    if (!token) return;
    const submit = async () => {
      try {
        await deleteProject(token, selectedProject._id);
        addActivity('Project Deleted', selectedProject.name, 'project_deleted');
        await fetchProjects();
      } catch (err) {
        console.error('Failed to delete project', err);
      } finally {
        setShowDeleteConfirm(false);
        setSelectedProject(null);
      }
    };

    void submit();
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <FolderKanban size={24} className="text-blue-600" />
                  <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
                </div>
                <p className="text-slate-600 mt-2">View and manage all construction projects</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-lg"
              >
                <Plus size={20} />
                Add Project
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-slate-600">Manager: {project.managerName}</p>
                      {project.managerId && (
                        <button
                          onClick={() => handleRemoveManager(project._id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                          title="Remove manager"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink size={16} className="text-slate-400" />
                  <a 
                    href={project.sheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Google Sheet
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAssignManager(project._id)}
                    className="flex-1 flex items-center justify-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition border border-blue-600 hover:bg-blue-50 py-2 rounded-lg"
                  >
                    <Edit size={16} />
                    {project.managerId ? 'Change Manager' : 'Assign Manager'}
                  </button>
                  <button 
                    onClick={() => handleViewDetails(project)}
                    className="flex-1 text-blue-600 font-medium hover:text-blue-800 transition border border-blue-600 hover:bg-blue-50 py-2 rounded-lg"
                  >
                    View Details →
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(project)}
                    className="text-red-600 font-medium hover:text-red-800 transition border border-red-600 hover:bg-red-50 py-2 px-4 rounded-lg"
                    title="Delete Project"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Project Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Add New Project</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label htmlFor="projectTitle" className="block text-sm font-medium text-slate-700 mb-2">
                      Project Title
                    </label>
                    <input
                      id="projectTitle"
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="googleSheetUrl" className="block text-sm font-medium text-slate-700 mb-2">
                      Google Sheet URL
                    </label>
                    <input
                      id="googleSheetUrl"
                      type="url"
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
                    >
                      Add Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Assign Manager Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Assign Project Manager</h2>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedProjectId(null);
                      setSelectedManagerId('');
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="managerSelect" className="block text-sm font-medium text-slate-700 mb-2">
                      Select Manager
                    </label>
                    <select
                      id="managerSelect"
                      value={selectedManagerId}
                      onChange={(e) => setSelectedManagerId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                    >
                      <option value="">Unassigned</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignModal(false);
                        setSelectedProjectId(null);
                        setSelectedManagerId('');
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAssignment}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
                    >
                      Save Assignment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Details Modal */}
          {showDetailsModal && selectedProject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Project Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedProject(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <p className="block text-sm font-semibold text-slate-700 mb-2">Project Name</p>
                    <p className="text-lg text-slate-900">{selectedProject.name}</p>
                  </div>

                  {/* Project Manager */}
                  <div>
                    <p className="block text-sm font-semibold text-slate-700 mb-2">Project Manager</p>
                    <div className="flex items-center gap-3">
                      <p className="text-lg text-slate-900">{selectedProject.managerName}</p>
                      {selectedProject.managerId ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Assigned
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="project-status"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Status
                    </label>
                    <select
                      id="project-status"
                      value={selectedProject.status}
                      onChange={(e) => {
                        if (!token) return;
                        const newStatus = e.target.value;
                        const submit = async () => {
                          try {
                            await updateProject(token, selectedProject._id, { status: newStatus });
                            setSelectedProject({ ...selectedProject, status: newStatus });
                            await fetchProjects();
                            addActivity(
                              `Project Status Changed to ${newStatus}`,
                              selectedProject.name,
                              'project_status_changed'
                            );
                          } catch (err) {
                            console.error('Failed to update project status', err);
                          }
                        };

                        void submit();
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
                        selectedProject.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Planning">Planning</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  {/* Google Sheet URL */}
                  <div>
                    <p className="block text-sm font-semibold text-slate-700 mb-2">Google Sheet</p>
                    <a 
                      href={selectedProject.sheetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink size={16} />
                      <span>Open Google Sheet</span>
                    </a>
                    <p className="text-xs text-slate-500 mt-1 break-all">{selectedProject.sheetUrl}</p>
                  </div>

                  {/* Project ID */}
                  <div>
                    <p className="block text-sm font-semibold text-slate-700 mb-2">Project ID</p>
                    <p className="text-sm text-slate-600">#{selectedProject._id}</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedProject(null);
                        handleAssignManager(selectedProject._id);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
                    >
                      {selectedProject.managerId ? 'Change Manager' : 'Assign Manager'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedProject(null);
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && selectedProject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Confirm Delete</h2>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedProject(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
                
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete <strong>{selectedProject.name}</strong>? 
                  This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedProject(null);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
