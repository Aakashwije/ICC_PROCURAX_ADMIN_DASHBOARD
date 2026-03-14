// 'use client' directive — indicates this component renders in the browser and uses React hooks
'use client';

// Import essential React hooks for state and lifecycle management
import { useCallback, useEffect, useState } from 'react';

// Import layout components used across the admin dashboard
import Header from '@/components/Header';   // Top bar with date and admin profile info
import Sidebar from '@/components/Sidebar'; // Left navigation menu

// Import icons from lucide-react for buttons and UI elements
import { FolderKanban, Plus, X, ExternalLink, Edit } from 'lucide-react';

// Import utility to log admin actions (like adding/deleting projects) to localStorage 
// so they appear in "Recent Activity" on the Dashboard and Notifications pages
import { addActivity } from '@/utils/activityLogger';

// Import auth utility to safely retrieve the JWT token required for API calls
import { getToken } from '@/utils/auth';

// Import all API service functions related to projects and managers
import {
  addProject,       // POST: Create a new project
  assignManager,    // PATCH: Assign or remove a manager from a project
  deleteProject,    // DELETE: Remove a project permanently
  getManagers,      // GET: Fetch list of managers (for the assignment dropdown)
  getProjects,      // GET: Fetch the list of all projects
  updateProject,    // PATCH: Update project details (like status)
} from '@/services/api';

// ═══════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════

// Represents a Project as currently used in the frontend UI
interface Project {
  _id: string;              // MongoDB's unique ID for the project
  name: string;             // Project title/name
  managerName: string;      // Name of the assigned manager (or "Unassigned")
  managerId: string | null; // ID of the assigned manager (null if unassigned)
  status: string;           // Project status (e.g., 'Active', 'Completed')
  sheetUrl: string;         // URL to the associated Google Sheet
}

// Represents a Manager specifically for the "Assign Manager" dropdown list
interface Manager {
  id: string;               // Manager's MongoDB ID
  name: string;             // Manager's full display name
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT: Projects Management Page
// ═══════════════════════════════════════════════════════
export default function ProjectsPage() {
  
  // -- UI Modal States --
  // These booleans control whether the overlay dialogs are visible or hidden
  const [showAddModal, setShowAddModal] = useState(false);             // Modal to create a new project
  const [showAssignModal, setShowAssignModal] = useState(false);       // Modal to assign a manager
  const [showDetailsModal, setShowDetailsModal] = useState(false);     // Modal to view/edit expanded project details
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);   // Modal to confirm project deletion

  // -- Context States --
  // These keep track of which project or manager the user is currently interacting with
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null); // For assigning a manager
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);    // For details & deletion

  // -- Form Input States --
  // Track text typed into inputs across the various modals
  const [projectTitle, setProjectTitle] = useState('');                 // Name of new project
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');             // URL of new project
  const [selectedManagerId, setSelectedManagerId] = useState('');       // ID chosen inside the Assign Manager select box
  
  // -- Data States --
  // Hold the actual data fetched from the backend APIs
  const [projects, setProjects] = useState<Project[]>([]);             // List of all projects
  const [managers, setManagers] = useState<Manager[]>([]);             // List of managers for the dropdown

  // Retrieve JWT auth token (null if user is not logged in)
  const token = getToken();

  // ═══════════════════════════════════════════════════════
  // DATA FETCHING FUNCTIONS
  // Wrapped in useCallback so they don't trigger unnecessary useEffect re-runs
  // ═══════════════════════════════════════════════════════

  // Fetch all projects and normalize their fields for the UI
  const fetchProjects = useCallback(async () => {
    if (!token) return; // Guard clause against unauthenticated requests
    try {
      // Call the API
      const data = await getProjects(token);
      
      // Map API response to our local Project interface, providing safe fallbacks
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

  // Fetch all managers (needed so we can populate the "Assign Manager" dropdown)
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

  // EFFECT: Fetch data once when the component mounts
  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, [fetchManagers, fetchProjects]);

  // ═══════════════════════════════════════════════════════
  // ACTION HANDLERS
  // ═══════════════════════════════════════════════════════

  // Action: Submit the "Add New Project" form
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault(); // Stop the form from causing a page reload
    if (!token) return;

    // Define async helper inside the handler
    const submit = async () => {
      try {
        // Send create request to API with default "Active" status
        await addProject(token, { 
          name: projectTitle, 
          sheetUrl: googleSheetUrl,
          status: 'Active' // Set default status to Active so it counts in dashboard stats
        });
        
        // Log the activity to Dashboard
        addActivity('New Project Added', projectTitle, 'project_added');
        
        // Refresh the list to show the new project
        await fetchProjects();
        
        // Reset form inputs and close modal
        setProjectTitle('');
        setGoogleSheetUrl('');
        setShowAddModal(false);
      } catch (err) {
        console.error('Failed to add project', err);
      }
    };

    void submit(); // Execute the helper
  };

  // Action: User clicked "Assign Manager" or "Change Manager" on a project card
  const handleAssignManager = (projectId: string) => {
    setSelectedProjectId(projectId); // Save which project we're modifying
    
    // Find the project locally so we can pre-select the current manager in the dropdown
    const project = projects.find(p => p._id === projectId);
    setSelectedManagerId(project?.managerId || '');
    
    // Open the modal
    setShowAssignModal(true);
  };

  // Action: Submit the "Assign Project Manager" modal form
  const handleSaveAssignment = () => {
    if (selectedProjectId === null) return;
    if (!token) return;
    
    // Grab full objects to use their names in the activity log
    const selectedManager = managers.find(m => m.id === selectedManagerId);
    const project = projects.find(p => p._id === selectedProjectId);

    const submit = async () => {
      try {
        // Send update to API. Sending `null` removes the current manager.
        await assignManager(token, {
          projectId: selectedProjectId,
          managerId: selectedManagerId || null,
        });
        
        // Logic for logging the activity correctly based on the action performed
        if (project && selectedManager) {
          // A manager was actively assigned
          addActivity(
            `${selectedManager.name} Assigned to ${project.name}`,
            selectedManager.name,
            'project_assigned'
          );
        }
        if (project && !selectedManagerId) {
          // User selected the "Unassigned" option, stripping the previous manager
          addActivity(
            `Manager Removed from ${project.name}`,
            'System',
            'project_unassigned'
          );
        }
        
        // Refresh UI
        await fetchProjects();
      } catch (err) {
        console.error('Failed to assign manager', err);
      } finally {
        // Always close modal and reset context, even on error
        setShowAssignModal(false);
        setSelectedProjectId(null);
        setSelectedManagerId('');
      }
    };

    void submit();
  };

  // Action: Directly remove a manager by clicking the "✕" icon next to their name on the card
  const handleRemoveManager = (projectId: string) => {
    if (!token) return;
    const project = projects.find(p => p._id === projectId);

    const submit = async () => {
      try {
        // Instantly assign to null to remove them
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

  // Action: User clicked "Delete" on a project card
  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project); // Remember which project to delete
    setShowDeleteConfirm(true);  // Pop Open warning modal
  };

  // Action: User confirmed deletion inside the warning modal
  const handleDeleteConfirm = () => {
    if (!selectedProject) return;
    if (!token) return;
    
    const submit = async () => {
      try {
        // DELETE request to backend
        await deleteProject(token, selectedProject._id);
        
        // Log activity
        addActivity('Project Deleted', selectedProject.name, 'project_deleted');
        
        // Refresh table
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

  // Action: User clicked "View Details" on a project card
  const handleViewDetails = (project: Project) => {
    setSelectedProject(project); // Pass project data to the modal
    setShowDetailsModal(true);   // Display the large details overlay
  };

  // ═══════════════════════════════════════════════════════
  // RENDER: Layout and UI
  // ═══════════════════════════════════════════════════════
  return (
    // Screen container with Sidebar on Left
    <div suppressHydrationWarning className="flex">
      <Sidebar />
      
      {/* Main Content Pane pushed right by Sidebar width (ml-64) */}
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          
          {/* HEADER SECTION: Title and Add Button */}
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

          {/* ─────────────────────────────────────────────── */}
          {/* PROJECTS GRID: Display each project as a card   */}
          {/* ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow-md p-6">
                
                {/* Card Top Row: Name, Manager, and Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                    
                    {/* Manager Name inline display */}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-slate-600">Manager: {project.managerName}</p>
                      {/* X Button - only shows if someone is actually assigned */}
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
                  
                  {/* Status Badge (Green for active, Blue for anything else like Planning/Completed) */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                {/* Google Sheet Direct Link */}
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
                
                {/* Card Action Buttons Bottom Row */}
                <div className="flex gap-2">
                  {/* Quick Assign Manager Button */}
                  <button
                    onClick={() => handleAssignManager(project._id)}
                    className="flex-1 flex items-center justify-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition border border-blue-600 hover:bg-blue-50 py-2 rounded-lg"
                  >
                    <Edit size={16} />
                    {project.managerId ? 'Change Manager' : 'Assign Manager'}
                  </button>
                  
                  {/* View Full Details Button */}
                  <button 
                    onClick={() => handleViewDetails(project)}
                    className="flex-1 text-blue-600 font-medium hover:text-blue-800 transition border border-blue-600 hover:bg-blue-50 py-2 rounded-lg"
                  >
                    View Details →
                  </button>
                  
                  {/* Delete Button (Red) */}
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

          {/* ═══════════════════════════════════════════════════════ */}
          {/* MODAL: ADD PROJECT                                      */}
          {/* ═══════════════════════════════════════════════════════ */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Add New Project</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                {/* Submit forces handleAddProject to run */}
                <form onSubmit={handleAddProject} className="space-y-4">
                  {/* Name Input */}
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

                  {/* Google Sheet URL Input */}
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

                  {/* Buttons */}
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

          {/* ═══════════════════════════════════════════════════════ */}
          {/* MODAL: ASSIGN MANAGER                                   */}
          {/* ═══════════════════════════════════════════════════════ */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Assign Project Manager</h2>
                  {/* X Button fully resets the modal state context variables */}
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
                  {/* HTML Select Dropdown populated mapped managers from fetchManagers() */}
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
                      {/* Empty string value correlates to "null" ID to unassign */}
                      <option value="">Unassigned</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
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

          {/* ═══════════════════════════════════════════════════════ */}
          {/* MODAL: PROJECT DETAILS OVERVIEW / EDIT STATUS           */}
          {/* ═══════════════════════════════════════════════════════ */}
          {showDetailsModal && selectedProject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full">
                
                {/* Header */}
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

                {/* Details List */}
                <div className="space-y-6">
                  {/* Read-only Name */}
                  <div>
                    <p className="block text-sm font-semibold text-slate-700 mb-2">Project Name</p>
                    <p className="text-lg text-slate-900">{selectedProject.name}</p>
                  </div>

                  {/* Read-only Assigned Manager Info with colored badge */}
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

                  {/* Editable Status Select Dropdown - Updating triggers API call instantly */}
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
                        
                        // Async handler to immediately push the status change to backend
                        const submit = async () => {
                          try {
                            await updateProject(token, selectedProject._id, { status: newStatus });
                            
                            // Optimistic update of local UI object
                            setSelectedProject({ ...selectedProject, status: newStatus });
                            
                            // Background refresh of master list
                            await fetchProjects();
                            
                            // Log activity for dashboard timeline
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

                  {/* Direct hyperlink to open the Google Sheets doc */}
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

                  {/* Internal MongoDB system ID reference */}
                  <div>
                    <p className="block text-sm font-semibold text-slate-700 mb-2">Project ID</p>
                    <p className="text-sm text-slate-600">#{selectedProject._id}</p>
                  </div>

                  {/* Deep links/buttons to other actions */}
                  <div className="flex gap-3 pt-4">
                    {/* Closes Details Modal and Opens Assignment Modal directly */}
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
                    {/* Normal visual close button */}
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

          {/* ═══════════════════════════════════════════════════════ */}
          {/* MODAL: DELETE CONFIRMATION                               */}
          {/* ═══════════════════════════════════════════════════════ */}
          {showDeleteConfirm && selectedProject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
                
                {/* Header */}
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
                
                {/* Visual warning message */}
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete <strong>{selectedProject.name}</strong>? 
                  This action cannot be undone.
                </p>
                
                {/* Safety buttons */}
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
                  {/* Triggers actual HTTP DELETE */}
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
