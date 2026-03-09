// 'use client' directive — indicates this component renders in the browser
'use client';

// Import the main data table component that handles mobile users
import MobileUsersTable from '@/components/MobileUsersTable';

// Import layout components used across the dashboard
import Header from '@/components/Header';   // Top bar with date and profile
import Sidebar from '@/components/Sidebar'; // Left navigation menu

// Import the Users icon from lucide-react for the page title
import { Users } from 'lucide-react';

// Main page component for the Mobile App Users section (/dashboard/mobile-users)
export default function MobileUsersPage() {
  return (
    // Outer flex container — sidebar on the left, main content taking remaining space
    <div suppressHydrationWarning className="flex">

      {/* Left sidebar navigation panel */}
      <Sidebar />

      {/* Main content area — pushed to the right by the fixed sidebar width (ml-64 = 16rem) */}
      <div className="flex-1 ml-64">

        {/* Top header navigation and status bar */}
        <Header />

        {/* The primary content view with a light gray background spanning at least full height */}
        <main className="p-8 bg-slate-50 min-h-screen">

          {/* Page header section containing the icon and title */}
          <div className="flex items-center gap-3 mb-6">
            <Users size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">
              App Users Management
            </h1>
          </div>

          {/* Subtitle explaining the purpose of the page */}
          <p className="text-slate-600 mb-8">
            Manage users registered on the mobile application. Approve new registrations to grant access.
          </p>

          {/* Render the complex data table that fetches and manages the users */}
          <MobileUsersTable />

        </main>
      </div>
    </div>
  );
}
