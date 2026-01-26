'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ReportsPage() {
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
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-600 mt-2">Generate and download system reports</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-slate-600 text-sm font-medium mb-1">Total Managers</p>
              <p className="text-3xl font-bold text-slate-900">24</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-slate-600 text-sm font-medium mb-1">Access Requests</p>
              <p className="text-3xl font-bold text-slate-900">127</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-slate-600 text-sm font-medium mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-slate-900">18</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Reports</h2>
            <div className="space-y-3">
              {reports.map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <div>
                    <p className="font-medium text-slate-900">{report.name}</p>
                    <p className="text-xs text-slate-600">{report.date} • {report.size}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded">{report.type}</span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Download</button>
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
