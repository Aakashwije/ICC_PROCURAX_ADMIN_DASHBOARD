'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import AccessControlPanel from '@/components/AccessControlPanel';
import { ShieldCheck } from 'lucide-react';

export default function AccessPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Access Control</h1>
            </div>
            <p className="text-slate-600 mt-2">Configure permissions for project managers</p>
          </div>

          <AccessControlPanel />
        </main>
      </div>
    </div>
  );
}
