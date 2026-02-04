'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import AddManagerForm from '@/components/AddManagerForm';
import { UserPlus } from 'lucide-react';

export default function AddManagerPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <UserPlus size={24} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Add Project Manager</h1>
            </div>
            <p className="text-slate-600 mt-2">Create a new project manager account and set permissions</p>
          </div>

          <AddManagerForm />
        </main>
      </div>
    </div>
  );
}
