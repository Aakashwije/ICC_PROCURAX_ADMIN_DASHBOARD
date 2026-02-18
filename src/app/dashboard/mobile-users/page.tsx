'use client';

import MobileUsersTable from '@/components/MobileUsersTable';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Users } from 'lucide-react';

export default function MobileUsersPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="flex items-center gap-3 mb-6">
            <Users size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">
              App Users Management
            </h1>
          </div>
          <p className="text-slate-600 mb-8">
            Manage users registered on the mobile application. Approve new registrations to grant access.
          </p>

          <MobileUsersTable />
        </main>
      </div>
    </div>
  );
}
