// 'use client' directive — this component runs in the browser (uses hooks, DOM, localStorage)
'use client';

// Import React hooks
import { useCallback, useEffect, useState } from 'react';
// useCallback — memoizes the fetchManagers function so it doesn't recreate on every render
// useEffect — runs side effects (data fetching) when the component mounts
// useState — manages component state (managers list, modals, form data, etc.)

// Import the activity logger utility — logs actions to localStorage for the dashboard & notifications page
import { addActivity } from '@/utils/activityLogger';

// Import the auth utility to get the JWT token stored after admin login
import { getToken } from '@/utils/auth';

// TypeScript interface defining the shape of a Project Manager object
interface ProjectManager {
  _id: string;         // Unique MongoDB ID of the manager
  name: string;        // Manager's full name
  email: string;       // Manager's email address
  phone?: string;      // Optional phone number
  projects: number;    // Number of projects currently assigned to this manager
  isApproved: boolean; // Whether the manager has been approved by an admin
  isActive: boolean;   // Whether the manager has active mobile app access
  createdAt: string;   // ISO date string of when the manager was added
}

// Import API service functions for CRUD operations on managers and projects
import { getManagers, getProjects, updateManager, deleteManager, toggleManagerAccess } from '@/services/api';
// getManagers — fetches all project managers from the backend
// getProjects — fetches all projects (used to count projects per manager)
// updateManager — updates a manager's name, email, phone, or status
// deleteManager — permanently removes a manager from the system
// toggleManagerAccess — toggles a manager's mobile app access (active/inactive)

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT: Displays all project managers in a table
// with inline editing, deletion, status changes, and access toggling
// ═══════════════════════════════════════════════════════
export default function ProjectManagersTable() {
  // State: array of all project managers fetched from the API
  const [managers, setManagers] = useState<ProjectManager[]>([]);

  // State: whether the initial data fetch is in progress (shows loading text)
  const [loading, setLoading] = useState(true);

  // State: controls visibility of the Edit Manager modal dialog
  const [showEditModal, setShowEditModal] = useState(false);

  // State: controls visibility of the Delete Confirmation modal dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // State: the manager currently selected for editing or deletion
  const [selectedManager, setSelectedManager] = useState<ProjectManager | null>(null);

  // State: form data for the Edit Manager modal (pre-filled when modal opens)
  const [editFormData, setEditFormData] = useState({
    name: '',    // Editable manager name
    email: '',   // Editable manager email
    phone: '',   // Editable manager phone
  });

  // Get the JWT authentication token from localStorage (set during login)
  const token = getToken();

  // ═══════════════════════════════════════════════════════
  // FETCH: Load all project managers AND projects from the API
  // Projects are fetched to calculate how many are assigned to each manager
  // ═══════════════════════════════════════════════════════
  const fetchManagers = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!token) return;
    try {
      // Show loading indicator while fetching
      setLoading(true);

      // Fetch managers and projects simultaneously using Promise.all for better performance
      const [managersData, projectsData] = await Promise.all([
        getManagers(token),   // GET /api/admin-managers
        getProjects(token),   // GET /api/admin-projects
      ]);

      // Build a map of managerId → number of assigned projects
      // Example: { "abc123": 3, "def456": 1 }
      const projectCountMap: Record<string, number> = {};
      projectsData.forEach((project) => {
        if (project.managerId) {
          // Increment the count for this manager (or initialize to 1)
          projectCountMap[project.managerId] = (projectCountMap[project.managerId] || 0) + 1;
        }
      });

      // Transform the raw API data into our ProjectManager interface shape
      const normalized: ProjectManager[] = managersData.map((manager) => ({
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        // Look up the project count from our map, default to 0 if no projects assigned
        projects: projectCountMap[manager._id] || 0,
        // Default to false if the API doesn't return these fields
        isApproved: manager.isApproved ?? false,
        isActive: manager.isActive ?? false,
        // Default to current date if createdAt is missing
        createdAt: manager.createdAt ?? new Date().toISOString(),
      }));

      // Update state with the normalized managers list
      setManagers(normalized);
    } catch (err) {
      console.error('Failed to load managers', err);
    } finally {
      // Hide loading indicator regardless of success or failure
      setLoading(false);
    }
  }, [token]); // Re-create this function only if the token changes

  // Run fetchManagers once when the component mounts (and whenever fetchManagers changes)
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  // ═══════════════════════════════════════════════════════
  // ACTION: Toggle Mobile App Access (Grant ↔ Revoke)
  // Calls PATCH /api/admin-managers/:id/access on the backend
  // ═══════════════════════════════════════════════════════
  const toggleAccess = async (manager: ProjectManager) => {
    if (!token) return;

    // Send the toggle request to the backend API
    await toggleManagerAccess(token, manager._id);

    // Log the activity so it appears in the dashboard and notifications page
    // If currently active → we're revoking; if inactive → we're granting
    addActivity(
      manager.isActive ? 'Mobile Access Revoked' : 'Mobile Access Granted',
      manager.name,
      manager.isActive ? 'access_revoked' : 'access_granted'
    );

    // Refresh the managers list to reflect the updated access status
    fetchManagers();
  };

  // ═══════════════════════════════════════════════════════
  // ACTION: Update Manager Status (Active / Pending / Inactive)
  // Uses the status dropdown in each table row
  // ═══════════════════════════════════════════════════════
  const updateStatus = async (
    manager: ProjectManager,
    status: 'active' | 'pending' | 'inactive'
  ) => {
    if (!token) return;

    // Send the update to the backend API
    // "active" = approved + active, "pending" = not approved, "inactive" = approved but not active
    await updateManager(token, manager._id, {
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      isApproved: status === 'active',          // Only "active" status means approved
      isActive: status !== 'inactive',           // Both "active" and "pending" are active
    });

    // Map status values to human-readable labels for the activity log
    const statusLabels: Record<string, string> = {
      active: 'Manager Approved',
      pending: 'Manager Set to Pending',
      inactive: 'Manager Deactivated',
    };

    // Map status values to activity type identifiers
    const statusTypes: Record<string, string> = {
      active: 'access_granted',
      pending: 'manager_edited',
      inactive: 'access_revoked',
    };

    // Log the status change activity
    addActivity(statusLabels[status], manager.name, statusTypes[status]);

    // Refresh the managers list to show the updated status
    fetchManagers();
  };

  // ═══════════════════════════════════════════════════════
  // ACTION: Open Edit Modal — pre-fill the form with the manager's current data
  // ═══════════════════════════════════════════════════════
  const handleEditClick = (manager: ProjectManager) => {
    // Store which manager is being edited
    setSelectedManager(manager);

    // Pre-fill the edit form with the manager's current values
    setEditFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone || '',  // Default to empty string if phone is undefined
    });

    // Show the edit modal dialog
    setShowEditModal(true);
  };

  // ═══════════════════════════════════════════════════════
  // ACTION: Save Edit — send updated manager data to the backend
  // ═══════════════════════════════════════════════════════
  const handleEditSave = async () => {
    // Guard: don't proceed if no manager is selected or no auth token
    if (!selectedManager || !token) return;

    // Send the updated form data to the backend API (PUT /api/admin-managers/:id)
    await updateManager(token, selectedManager._id, editFormData);

    // Log the edit activity for dashboard and notifications
    addActivity(
      'Manager Information Updated',
      selectedManager.name,
      'manager_edited'
    );

    // Close the modal and clear the selected manager
    setShowEditModal(false);
    setSelectedManager(null);

    // Refresh the managers list with the updated data
    fetchManagers();
  };

  // ═══════════════════════════════════════════════════════
  // ACTION: Confirm Delete — permanently remove a manager from the system
  // ═══════════════════════════════════════════════════════
  const handleDeleteConfirm = async () => {
    // Guard: don't proceed if no manager is selected or no auth token
    if (!selectedManager || !token) return;

    // Send the delete request to the backend API (DELETE /api/admin-managers/:id)
    await deleteManager(token, selectedManager._id);

    // Log the deletion activity for dashboard and notifications
    addActivity(
      'Manager Deleted',
      selectedManager.name,
      'manager_deleted'
    );

    // Close the confirmation dialog and clear the selected manager
    setShowDeleteConfirm(false);
    setSelectedManager(null);

    // Refresh the managers list (the deleted manager will no longer appear)
    fetchManagers();
  };

  // ═══════════════════════════════════════════════════════
  // HELPER: Determine a manager's display status from their boolean flags
  // Returns: 'active', 'pending', or 'inactive'
  // ═══════════════════════════════════════════════════════
  const getStatus = (manager: ProjectManager) => {
    // If not approved by admin → status is "pending"
    if (!manager.isApproved) return 'pending';

    // If approved but not active → status is "inactive" (disabled by admin)
    if (!manager.isActive) return 'inactive';

    // If both approved and active → status is "active"
    return 'active';
  };

  // ═══════════════════════════════════════════════════════
  // HELPER: Return Tailwind CSS classes for the status badge colors
  // ═══════════════════════════════════════════════════════
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';    // Green badge for active managers
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';  // Yellow badge for pending approval
      case 'inactive':
        return 'bg-red-100 text-red-800';        // Red badge for deactivated managers
      default:
        return 'bg-gray-100 text-gray-800';      // Gray fallback for unknown statuses
    }
  };

  // ═══════════════════════════════════════════════════════
  // LOADING STATE: Show a loading message while data is being fetched
  // ═══════════════════════════════════════════════════════
  if (loading) {
    return <p className="text-slate-600">Loading project managers...</p>;
  }

  // ═══════════════════════════════════════════════════════
  // RENDER: The managers data table and modal dialogs
  // ═══════════════════════════════════════════════════════
  return (
    // Horizontal scroll wrapper — allows the table to scroll on small screens
    <div className="overflow-x-auto">

      {/* ─────────────────────────────────────────── */}
      {/* MANAGERS TABLE                              */}
      {/* ─────────────────────────────────────────── */}
      <table className="min-w-full text-sm">

        {/* Table header row with column labels */}
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-700">
            <th className="px-6 py-4 text-left font-semibold">Name</th>
            <th className="px-6 py-4 text-left font-semibold">Email</th>
            <th className="px-6 py-4 text-left font-semibold">Projects</th>
            <th className="px-6 py-4 text-left font-semibold">Status</th>
            <th className="px-6 py-4 text-left font-semibold">Mobile Access</th>
            <th className="px-6 py-4 text-left font-semibold">Date Added</th>
            <th className="px-6 py-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>

        {/* Table body — one row per manager */}
        <tbody>
          {managers.map((manager) => {
            // Determine the manager's current display status
            const status = getStatus(manager);

            return (
              // Each table row is keyed by the manager's unique MongoDB _id
              <tr key={manager._id} className="border-b text-slate-700">

                {/* Column: Manager Name (bold) */}
                <td className="px-6 py-4 font-medium text-slate-900">
                  {manager.name}
                </td>

                {/* Column: Manager Email */}
                <td className="px-6 py-4 text-slate-600">{manager.email}</td>

                {/* Column: Number of assigned projects (fetched by cross-referencing projects API) */}
                <td className="px-6 py-4">{manager.projects}</td>

                {/* Column: Status dropdown — allows admin to change status inline */}
                <td className="px-6 py-4">
                  <select
                    value={status}
                    onChange={(e) =>
                      // Call updateStatus when the admin selects a new status
                      updateStatus(
                        manager,
                        e.target.value as 'active' | 'pending' | 'inactive'
                      )
                    }
                    // Apply color-coded styling based on the current status
                    className={`px-3 py-1 rounded-full text-xs border border-slate-200 bg-white ${getStatusColor(
                      status
                    )}`}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>

                {/* Column: Mobile Access toggle button */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleAccess(manager)}
                    // Green button if access is granted, gray if denied
                    className={`px-4 py-2 rounded-lg ${
                      manager.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {/* Show checkmark for granted, X for denied */}
                    {manager.isActive ? '✓ Granted' : '✗ Denied'}
                  </button>
                </td>

                {/* Column: Date the manager was added (formatted as locale date string) */}
                <td className="px-6 py-4">
                  {new Date(manager.createdAt).toLocaleDateString()}
                </td>

                {/* Column: Action buttons — Edit and Delete */}
                <td className="px-6 py-4">
                  {/* Edit button — opens the Edit Modal with this manager's data */}
                  <button
                    onClick={() => handleEditClick(manager)}
                    className="text-blue-600 font-medium hover:text-blue-800 mr-4"
                  >
                    Edit
                  </button>

                  {/* Delete button — opens the Delete Confirmation modal */}
                  <button
                    onClick={() => {
                      setSelectedManager(manager);     // Store which manager to delete
                      setShowDeleteConfirm(true);      // Show the confirmation dialog
                    }}
                    className="text-red-600 font-medium hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ─────────────────────────────────────────── */}
      {/* EDIT MANAGER MODAL                          */}
      {/* Only rendered when showEditModal is true     */}
      {/* ─────────────────────────────────────────── */}
      {showEditModal && selectedManager && (
        // Full-screen overlay with semi-transparent black background
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          {/* Modal card — centered, max width 32rem */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">

            {/* Modal title */}
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Edit Manager
            </h3>

            {/* Edit form fields */}
            <div className="space-y-4">

              {/* Name field */}
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
                    // Update only the name field in the form data object
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-black"
                />
              </div>

              {/* Email field */}
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
                    // Update only the email field in the form data object
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-black"
                />
              </div>

              {/* Phone field */}
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
                    // Update only the phone field in the form data object
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-black"
                />
              </div>
            </div>

            {/* Modal action buttons */}
            <div className="flex justify-end gap-2 mt-6">
              {/* Cancel button — closes the modal without saving */}
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>

              {/* Save button — submits the edited data to the API */}
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

      {/* ─────────────────────────────────────────── */}
      {/* DELETE CONFIRMATION MODAL                    */}
      {/* Only rendered when showDeleteConfirm is true */}
      {/* ─────────────────────────────────────────── */}
      {showDeleteConfirm && selectedManager && (
        // Full-screen overlay with semi-transparent black background
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          {/* Confirmation card — centered, max width 28rem */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">

            {/* Warning title */}
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Manager
            </h3>

            {/* Confirmation message showing the manager's name */}
            <p className="text-sm text-slate-600">
              Are you sure you want to delete {selectedManager.name}?
            </p>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-6">
              {/* Cancel button — closes the dialog without deleting */}
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>

              {/* Delete button — confirms and performs the deletion */}
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
