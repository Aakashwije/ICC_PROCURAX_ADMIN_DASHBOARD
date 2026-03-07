// 'use client' directive — marks this as a Client Component (renders in the browser)
'use client';

// Import layout components used on every dashboard page
import Header from '@/components/Header';   // Top header bar with date, health status, user info
import Sidebar from '@/components/Sidebar'; // Left navigation sidebar

// Import the ProjectManagersTable component that displays the managers data table
import ProjectManagersTable from '@/components/ProjectManagersTable';

// Import Next.js Link for client-side navigation (used for the "Add Manager" button)
import Link from 'next/link';

// Import icons from lucide-react
import { Plus, Users } from 'lucide-react';
// Plus — icon for the "Add Manager" button
// Users — icon for the page title header

// Main page component for the Project Managers section (/dashboard/managers)
export default function ManagersPage() {
  return (
    // Outer flex container — sidebar on the left, main content on the right
    <div className="flex">

      {/* Left sidebar navigation panel */}
      <Sidebar />

      {/* Main content area — pushed right by the sidebar width (ml-64 = margin-left: 16rem) */}
      <div className="flex-1 ml-64">

        {/* Top header bar */}
        <Header />

        {/* Page content area with light gray background */}
        <main className="p-8 bg-slate-50 min-h-screen">

          {/* Page header row — title on the left, "Add Manager" button on the right */}
          <div className="flex items-center justify-between mb-8">

            {/* Left side: page title and description */}
            <div>
              {/* Title with Users icon */}
              <div className="flex items-center gap-3">
                <Users size={24} className="text-blue-600" />
                <h1 className="text-3xl font-bold text-slate-900">Project Managers</h1>
              </div>
              {/* Subtitle describing the page purpose */}
              <p className="text-slate-600 mt-2">Manage project managers and their mobile app access</p>
            </div>

            {/* Right side: navigation link styled as a button to add a new manager */}
            <Link
              href="/dashboard/add-manager"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add Manager
            </Link>
          </div>

          {/* Managers data table — wrapped in a white card with shadow */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* ProjectManagersTable handles all the data fetching, display, edit, and delete logic */}
            <ProjectManagersTable />
          </div>
        </main>
      </div>
    </div>
  );
}
