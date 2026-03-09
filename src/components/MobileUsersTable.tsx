// 'use client' directive — runs heavily in the browser using React state and DOM events
'use client';

// Import standard React hooks
import { useCallback, useEffect, useState } from 'react';
// useCallback — memoizes functions to prevent unnecessary re-renders
// useEffect — triggers side effects like fetching data when the component loads
// useState — stores and updates data (users list, loading states, form inputs)

// Import API services for MongoDB interactions
import { getMobileUsers, approveMobileUser, rejectMobileUser, assignSheetUrl } from '../services/api';

// Import auth utility to get the JWT token for secure API requests
import { getToken } from '@/utils/auth';

// Import activity logger to track admin actions for the dashboard history
import { addActivity } from '@/utils/activityLogger';

// Import icons for UI buttons and indicators
import { CheckCircle, XCircle, Loader2, Link as LinkIcon, Save, X } from 'lucide-react';

// Import Firebase sync services to push approval/URL status down to the mobile app
import { saveUserToFirestore, updateUserSheetUrl } from '../utils/firebaseUserSync';

// TypeScript interface defining a simplified Mobile User for the frontend
interface MobileUser {
  id: string;          // Extracted ID
  name: string;        // Display name
  email: string;       // User email
  status: 'pending' | 'approved' | 'rejected'; // Calculated approval status
  registrationDate: string; // ISO date of sign up
  googleSheetUrl?: string | null; // Assigned project sheet URL (if approved)
}

// TypeScript type defining the raw response shape from the backend API
type MobileUserApi = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  isApproved?: boolean;
  isActive?: boolean;
  createdAt?: string;
  googleSheetUrl?: string | null;
};

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT: Displays and manages mobile app registrations
// ══════════════════════════════════════════════════════════
export default function MobileUsersTable() {
  // State: the array of processed mobile users shown in the table
  const [users, setUsers] = useState<MobileUser[]>([]);

  // State: true while initially fetching users from the API
  const [loading, setLoading] = useState(true);

  // State: stores the ID of the user currently being approved/rejected/assigned
  // This prevents clicking buttons twice while an API call is in flight
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // State: stores the ID of the user currently having a Google Sheet URL assigned to them
  // This toggles the specific row into "edit mode" for the URL input
  const [assigningUrlFor, setAssigningUrlFor] = useState<string | null>(null);

  // State: temporarily holds the typed text for a new Google Sheet URL before saving
  const [sheetUrlInput, setSheetUrlInput] = useState<string>('');

  // Get current admin JWT token
  const token = getToken();

  // ══════════════════════════════════════════════════════════
  // HELPER: Convert raw API data into pure frontend MobileUser objects
  // Handles structural differences and calculates the simplified 'status'
  // ══════════════════════════════════════════════════════════
  const normalizeUsers = (payload: unknown): MobileUser[] => {
    // Safely extract the array whether it's wrapped in a { users: [] } object or not
    const users = Array.isArray(payload)
      ? payload
      : (payload as { users?: MobileUserApi[] })?.users ?? [];

    // Helper function to map boolean flags to a single string status
    const getStatus = (user: MobileUserApi): MobileUser['status'] => {
      if (user.isApproved) return 'approved';      // Approved overrides everything
      if (user.isActive === false) return 'rejected'; // Explicitly rejected/banned
      return 'pending';                            // Default awaiting admin action
    };

    // Map through raw data and return clean MobileUser objects
    return (users as MobileUserApi[]).map((user) => ({
      id: user._id ?? user.id ?? '', // Support both _id (MongoDB) and id
      name: user.name ?? 'Unknown',
      email: user.email ?? '',
      status: getStatus(user),
      registrationDate: user.createdAt ?? new Date().toISOString(),
      googleSheetUrl: user.googleSheetUrl ?? null,
    }));
  };

  // ══════════════════════════════════════════════════════════
  // FETCH: Load mobile users from the backend
  // ══════════════════════════════════════════════════════════
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true); // Show initial spinner
      const data = await getMobileUsers(token);
      setUsers(normalizeUsers(data));
    } catch (err) {
      console.error('Failed to load mobile users', err);
      // Fallback mock data useful during development if the backend is down
      setUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'pending', registrationDate: new Date().toISOString() },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'approved', registrationDate: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false); // Hide spinner
    }
  }, [token]);

  // Run fetch immediately on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ══════════════════════════════════════════════════════════
  // ACTION: Approve a pending mobile user
  // ══════════════════════════════════════════════════════════
  const handleApprove = async (user: MobileUser) => {
    if (!token) return;
    try {
      setActionLoading(user.id); // Indicate this specific row is loading
      
      // Send approval to MongoDB backend
      await approveMobileUser(token, user.id);
      
      // Optimistic update: instantly update UI without waiting for a full refetch
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'approved' } : u));
      
      // Crucial: Sync the approval to Firestore so the mobile app immediately unlocks
      await saveUserToFirestore(user.id, {
        name: user.name,
        email: user.email,
        isApproved: true,
        isActive: true, // Mark them active to grant login access
      });

      // Log the activity to appear in dashboard/notifications
      addActivity(`Mobile User Approved: ${user.name}`, user.email, 'access_granted');

    } catch (err) {
      console.error('Failed to approve user', err);
    } finally {
      setActionLoading(null); // Remove row-level loading spinner
    }
  };

  // ══════════════════════════════════════════════════════════
  // ACTION: Reject a pending mobile user
  // ══════════════════════════════════════════════════════════
  const handleReject = async (user: MobileUser) => {
    if (!token) return;
    try {
      setActionLoading(user.id); // Indicate this specific row is loading
      
      // Send rejection to MongoDB backend
      await rejectMobileUser(token, user.id);
      
      // Optimistic upate: instantly update UI
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'rejected' } : u));
      
      // Sync rejection to Firestore so the mobile app actively blocks them
      await saveUserToFirestore(user.id, {
        isApproved: false,
        isActive: false, // Ensure they cannot log in
      });

      // Log the activity
      addActivity(`Mobile User Rejected: ${user.name}`, user.email, 'access_revoked');

    } catch (err) {
      console.error('Failed to reject user', err);
    } finally {
      setActionLoading(null); // Remove spinner
    }
  };

  // ══════════════════════════════════════════════════════════
  // ACTION: Save a Google Sheet URL assigned to an approved user
  // ══════════════════════════════════════════════════════════
  const handleAssignSheetUrl = async (user: MobileUser) => {
    // Prevent empty saves
    if (!token || !sheetUrlInput.trim()) return;
    try {
      // Use 'assign_' prefix to differentiate this loading state from approve/reject
      setActionLoading('assign_' + user.id);
      
      // Save Sheet URL to MongoDB backend
      await assignSheetUrl(token, user.id, sheetUrlInput.trim());
      
      // Optimistic update: update the user objects sheet URL locally
      setUsers(users.map(u => u.id === user.id ? { ...u, googleSheetUrl: sheetUrlInput.trim() } : u));
      
      // Sync the new URL to Firestore so the mobile app pulls the right project spreadsheet
      await updateUserSheetUrl(user.id, sheetUrlInput.trim());
      
      // Log the activity
      addActivity(`Sheet URL Assigned to ${user.name}`, user.email, 'project_assigned');

      // Reset the local component state (close the input box and clear the text)
      setAssigningUrlFor(null);
      setSheetUrlInput('');
    } catch (err) {
      console.error('Failed to assign sheet URL', err);
    } finally {
      setActionLoading(null); // Stop spinner
    }
  };

  // ══════════════════════════════════════════════════════════
  // HELPER: Returns Tailwind CSS colors for status badges
  // ══════════════════════════════════════════════════════════
  const getStatusClass = (status: MobileUser['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'; // Green
      case 'rejected': return 'bg-red-100 text-red-700';     // Red
      case 'pending': 
      default:         return 'bg-yellow-100 text-yellow-700'; // Yellow
    }
  };

  // Show a large centered loading spinner when first pulling data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* lucide-react Loader2 spins using Tailwind's animate-spin class */}
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RENDER: The Mobile Users Data Table
  // ══════════════════════════════════════════════════════════
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Scrollable container prevents table breaking layouts on narrow screens */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          
          {/* Table Headers */}
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="px-6 py-4 text-left font-semibold">Name</th>
              <th className="px-6 py-4 text-left font-semibold">Email</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Date</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {/* Conditional rendering depending on if users exist */}
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  {/* Name and email columns */}
                  <td className="px-6 py-4 text-slate-900 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  
                  {/* Visual Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(user.status)}`}>
                      {/* Capitalize the first letter (e.g., 'pending' -> 'Pending') */}
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  
                  {/* Registration Date built from ISO string into local timezone format */}
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(user.registrationDate).toLocaleDateString()}
                  </td>
                  
                  {/* Actions Column: Different buttons render depending on status */}
                  <td className="px-6 py-4">
                    
                    {/* SCENARIO 1: User is pending → Show Approve / Reject buttons */}
                    {user.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        {/* Approve Button */}
                        <button
                          onClick={() => handleApprove(user)}
                          disabled={actionLoading === user.id} // Disable to prevent double-click
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition disabled:opacity-50"
                          title="Approve"
                        >
                          {/* Swap checkmark for a spinner while API request is in-flight */}
                          {actionLoading === user.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        </button>
                        
                        {/* Reject Button */}
                        <button
                          onClick={() => handleReject(user)}
                          disabled={actionLoading === user.id} // Disable to prevent double-click
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
                          title="Reject"
                        >
                          {/* Swap 'X' for a spinner while API request is in-flight */}
                          {actionLoading === user.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                        </button>
                      </div>
                    )}
                    
                    {/* SCENARIO 2: User is Approved → Show Sheet URL assignment options */}
                    {user.status === 'approved' && (
                      <div className="flex flex-col gap-2">
                        
                         {/* Check: is the admin actively editing the URL for this specific row? */}
                         {assigningUrlFor === user.id ? (
                            // Edit Mode: Show input field and Save/Cancel buttons
                            <div className="flex items-center gap-2">
                              {/* The input binds to the sheetUrlInput state */}
                              <input 
                                type="url" 
                                placeholder="📋 Paste Sheet URL Here" 
                                className="border-2 border-blue-500 rounded-lg px-4 py-2 text-sm text-black placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm min-w-[300px]"
                                value={sheetUrlInput}
                                onChange={(e) => setSheetUrlInput(e.target.value)}
                                autoFocus
                              />
                              
                              {/* Save URL button */}
                              <button 
                                onClick={() => handleAssignSheetUrl(user)}
                                disabled={actionLoading === 'assign_' + user.id}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Save"
                              >
                                {/* Spinner vs Save icon */}
                                {actionLoading === 'assign_' + user.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              </button>
                              
                              {/* Cancel edit button (resets state) */}
                              <button 
                                onClick={() => { setAssigningUrlFor(null); setSheetUrlInput(''); }}
                                className="p-1 text-slate-500 hover:bg-slate-50 rounded transition"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                         ) : (
                           // Normal Mode: Show the "Assign Sheet" or "Change URL" trigger link
                           <button
                             onClick={() => setAssigningUrlFor(user.id)}
                             className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition"
                           >
                             <LinkIcon size={14} /> 
                             {/* Label changes based on whether a URL already exists */}
                             {user.googleSheetUrl ? 'Change Sheet URL' : 'Assign Sheet'}
                           </button>
                         )}
                         
                         {/* Display the active sheet link if one is assigned (hidden during edit mode) */}
                         {user.googleSheetUrl && assigningUrlFor !== user.id && (
                           // Target _blank opens the sheet in a new tab securely
                           <a href={user.googleSheetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 truncate max-w-[150px] inline-block hover:underline" title={user.googleSheetUrl}>
                             Linked Sheet ↗
                           </a>
                         )}
                      </div>
                    )}
                    
                    {/* SCENARIO 3: User is Rejected → Show simple disabled text */}
                    {user.status === 'rejected' && (
                      <span className="text-xs text-slate-500">Rejected</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              // Empty State (when users list is length 0)
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No mobile users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
