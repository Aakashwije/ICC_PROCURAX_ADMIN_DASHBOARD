'use client';

import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { BarChart3, Download } from 'lucide-react';
import { getManagers, getProjects, getStats } from '@/services/api';
import { getToken } from '@/utils/auth';

export default function ReportsPage() {
  const [totals, setTotals] = useState({
    totalManagers: 0,
    accessRequests: 0,
    activeSessions: 0,
  });

  const token = getToken();

  const fetchTotals = useCallback(async () => {
    if (!token) return;
    try {
      const [stats, managers, projects] = await Promise.all([
        getStats(token),
        getManagers(token),
        getProjects(token),
      ]);

      setTotals({
        totalManagers: stats.totalManagers,
        accessRequests: stats.pendingApprovals,
        activeSessions: Math.max(projects.length, managers.length),
      });
    } catch (err) {
      console.error('Failed to load report metrics', err);
    }
  }, [token]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const reports = [
    { name: 'Access Requests Summary', date: 'Jan 25, 2026', type: 'PDF', size: '2.4 MB' },
    { name: 'Project Manager Activity Report', date: 'Jan 24, 2026', type: 'PDF', size: '1.8 MB' },
    { name: 'Mobile App Usage Statistics', date: 'Jan 23, 2026', type: 'CSV', size: '512 KB' },
    { name: 'Permission Changes Log', date: 'Jan 22, 2026', type: 'PDF', size: '3.1 MB' },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 size={24} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            </div>
            <p className="text-slate-600 mt-2">Generate and download system reports</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-slate-600 text-sm font-medium mb-1">Total Managers</p>
              <p className="text-3xl font-bold text-slate-900">{totals.totalManagers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-slate-600 text-sm font-medium mb-1">Access Requests</p>
              <p className="text-3xl font-bold text-slate-900">{totals.accessRequests}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-slate-600 text-sm font-medium mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-slate-900">{totals.activeSessions}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Reports</h2>
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <div>
                    <p className="font-medium text-slate-900">{report.name}</p>
                    <p className="text-xs text-slate-600">{report.date} • {report.size}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded">{report.type}</span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2">
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
