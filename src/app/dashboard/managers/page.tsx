'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProjectManagersTable from '@/components/ProjectManagersTable';
import Link from 'next/link';

export default function ManagersPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Project Managers</h1>
              <p className="text-slate-600 mt-2">Manage project managers and their mobile app access</p>
            </div>
            <Link
              href="/dashboard/add-manager"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              + Add Manager
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ProjectManagersTable />
          </div>
        </main>
      </div>
    </div>
  );
}
