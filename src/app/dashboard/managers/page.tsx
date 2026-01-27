'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProjectManagersTable from '@/components/ProjectManagersTable';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';

export default function ManagersPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <Users size={24} className="text-blue-600" />
                <h1 className="text-3xl font-bold text-slate-900">Project Managers</h1>
              </div>
              <p className="text-slate-600 mt-2">Manage project managers and their mobile app access</p>
            </div>
            <Link
              href="/dashboard/add-manager"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add Manager
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
