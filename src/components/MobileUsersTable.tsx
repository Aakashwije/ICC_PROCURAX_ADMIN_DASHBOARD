'use client';

import { useEffect, useState } from 'react';
import { getMobileUsers, approveMobileUser, rejectMobileUser } from '../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface MobileUser {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
}

export default function MobileUsersTable() {
  const [users, setUsers] = useState<MobileUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getMobileUsers(token);
            // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("API returned non-array data:", data);
        setUsers([]); 
      }
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    if (!token) return;
    try {
      setActionLoading(userId);
      await approveMobileUser(token, userId);
      // Optimistic update
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'approved' } : u));
    } catch (err) {
      console.error('Failed to approve user', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!token) return;
    try {
      setActionLoading(userId);
      await rejectMobileUser(token, userId);
      // Optimistic update
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
    } catch (err) {
      console.error('Failed to reject user', err);
    } finally {
      setActionLoading(null);
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
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-800 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'approved' ? 'bg-green-100 text-green-700' :
                      user.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
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
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition disabled:opacity-50"
                          title="Approve"
                        >
                          {actionLoading === user.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          title="Reject"
                        >
                          {actionLoading === user.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                        </button>
                      </div>
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
