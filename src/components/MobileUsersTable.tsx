'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMobileUsers, approveMobileUser, rejectMobileUser, assignSheetUrl } from '../services/api';
import { getToken } from '@/utils/auth';
import { addActivity } from '@/utils/activityLogger';
import { CheckCircle, XCircle, Loader2, Link as LinkIcon, Save, X } from 'lucide-react';
import { saveUserToFirestore, updateUserSheetUrl } from '../utils/firebaseUserSync';

interface MobileUser {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  googleSheetUrl?: string | null;
}

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

export default function MobileUsersTable() {
  const [users, setUsers] = useState<MobileUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [assigningUrlFor, setAssigningUrlFor] = useState<string | null>(null);
  const [sheetUrlInput, setSheetUrlInput] = useState<string>('');

  const token = getToken();

  const normalizeUsers = (payload: unknown): MobileUser[] => {
    const users = Array.isArray(payload)
      ? payload
      : (payload as { users?: MobileUserApi[] })?.users ?? [];

    const getStatus = (user: MobileUserApi): MobileUser['status'] => {
      if (user.isApproved) return 'approved';
      if (user.isActive === false) return 'rejected';
      return 'pending';
    };

    return (users as MobileUserApi[]).map((user) => ({
      id: user._id ?? user.id ?? '',
      name: user.name ?? 'Unknown',
      email: user.email ?? '',
      status: getStatus(user),
      registrationDate: user.createdAt ?? new Date().toISOString(),
      googleSheetUrl: user.googleSheetUrl ?? null,
    }));
  };

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getMobileUsers(token);
      setUsers(normalizeUsers(data));
    } catch (err) {
      console.error('Failed to load mobile users', err);
       // Mock data for demonstration if API fails in this environment
       setUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'pending', registrationDate: new Date().toISOString() },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'approved', registrationDate: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (user: MobileUser) => {
    if (!token) return;
    try {
      setActionLoading(user.id);
      await approveMobileUser(token, user.id);
      // Optimistic update
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'approved' } : u));
      
      // Sync to Firestore
      await saveUserToFirestore(user.id, {
        name: user.name,
        email: user.email,
        isApproved: true,
        isActive: true,
      });

      addActivity(`Mobile User Approved: ${user.name}`, user.email, 'access_granted');

    } catch (err) {
      console.error('Failed to approve user', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (user: MobileUser) => {
    if (!token) return;
    try {
      setActionLoading(user.id);
      await rejectMobileUser(token, user.id);
      // Optimistic update
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'rejected' } : u));
      
      // Sync to Firestore
      await saveUserToFirestore(user.id, {
        isApproved: false,
        isActive: false,
      });

      addActivity(`Mobile User Rejected: ${user.name}`, user.email, 'access_revoked');

    } catch (err) {
      console.error('Failed to reject user', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignSheetUrl = async (user: MobileUser) => {
    if (!token || !sheetUrlInput.trim()) return;
    try {
      setActionLoading('assign_' + user.id);
      await assignSheetUrl(token, user.id, sheetUrlInput.trim());
      // Optimistic update
      setUsers(users.map(u => u.id === user.id ? { ...u, googleSheetUrl: sheetUrlInput.trim() } : u));
      
      // Sync to Firestore
      await updateUserSheetUrl(user.id, sheetUrlInput.trim());
      
      addActivity(`Sheet URL Assigned to ${user.name}`, user.email, 'project_assigned');

      setAssigningUrlFor(null);
      setSheetUrlInput('');
    } catch (err) {
      console.error('Failed to assign sheet URL', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (status: MobileUser['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
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
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-900 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                        user.status
                      )}`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(user.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(user)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition disabled:opacity-50"
                          title="Approve"
                        >
                          {actionLoading === user.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleReject(user)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
                          title="Reject"
                        >
                          {actionLoading === user.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                        </button>
                      </div>
                    )}
                    {user.status === 'approved' && (
                      <div className="flex flex-col gap-2">
                         {assigningUrlFor === user.id ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="url" 
                                placeholder="Paste Sheet URL" 
                                className="border border-slate-300 rounded px-2 py-1 text-xs"
                                value={sheetUrlInput}
                                onChange={(e) => setSheetUrlInput(e.target.value)}
                              />
                              <button 
                                onClick={() => handleAssignSheetUrl(user)}
                                disabled={actionLoading === 'assign_' + user.id}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Save"
                              >
                                {actionLoading === 'assign_' + user.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              </button>
                              <button 
                                onClick={() => { setAssigningUrlFor(null); setSheetUrlInput(''); }}
                                className="p-1 text-slate-500 hover:bg-slate-50 rounded transition"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                         ) : (
                           <button
                             onClick={() => setAssigningUrlFor(user.id)}
                             className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition"
                           >
                             <LinkIcon size={14} /> 
                             {user.googleSheetUrl ? 'Change Sheet URL' : 'Assign Sheet'}
                           </button>
                         )}
                         
                         {user.googleSheetUrl && assigningUrlFor !== user.id && (
                           <a href={user.googleSheetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 truncate max-w-[150px] inline-block hover:underline" title={user.googleSheetUrl}>
                             Linked Sheet ↗
                           </a>
                         )}
                      </div>
                    )}
                    {user.status === 'rejected' && (
                      <span className="text-xs text-slate-500">Rejected</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
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
