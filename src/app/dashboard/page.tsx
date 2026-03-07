// 'use client' directive — tells Next.js this is a Client Component (runs in the browser, not the server)
'use client';

// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';

// Import layout components — Header (top bar) and Sidebar (left navigation)
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Import StatsCards component — displays summary statistics at the top of the dashboard
import StatsCards from '@/components/StatsCards';

// Import icons from lucide-react icon library
import {
  Activity,          // Icon for Recent Activity section header
  CheckCircle2,      // Icon for approved/granted activity types
  Calendar as CalendarIcon,  // Calendar icon (aliased to avoid naming conflict)
  Settings as SettingsIcon,  // Settings icon (aliased to avoid naming conflict)
  UserPlus,          // Icon for "manager added" activity type
  XCircle,           // Icon for deleted/revoked activity types
  FolderKanban,      // Icon for project-related activity types
  UserCog,           // Icon for "manager edited" activity type
} from 'lucide-react';

// TypeScript interface defining the shape of an activity/notification item
interface ActivityItem {
  action: string;      // Description of the activity (e.g., "New Manager Added")
  user: string;        // Name or email of the user who performed the action
  time: string;        // Human-readable time string (stored but not displayed)
  timestamp: number;   // Unix timestamp in milliseconds, used for "time ago" calculation
  type: string;        // Activity type identifier (e.g., "manager_added", "access_granted")
}

// TypeScript interface defining the shape of a project item
interface Project {
  id: number;          // Unique project identifier
  name: string;        // Project name
  manager: string;     // Name of the assigned manager
  status: string;      // Current status (e.g., "Active", "Pending")
}

// Main Dashboard Page component — the default view after logging in
export default function DashboardPage() {
  // State: list of recent activity items loaded from localStorage
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

  // State: list of active projects loaded from localStorage
  const [projects, setProjects] = useState<Project[]>([]);

  // State: the currently displayed month/year for the calendar widget
  const [currentDate, setCurrentDate] = useState(new Date());

  // State: current timestamp in ms — updated every second to keep "time ago" labels fresh
  const [now, setNow] = useState(() => Date.now());

  // ─────────────────────────────────────────────
  // CALENDAR HELPER: Generate an array of day cells for the calendar grid
  // ─────────────────────────────────────────────
  const generateCalendar = () => {
    // Get the year and month from the currently viewed calendar date
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Find the first day of the month (to know which weekday it starts on)
    const firstDay = new Date(year, month, 1);

    // Find the last day of the month (to know how many days there are)
    const lastDay = new Date(year, month + 1, 0);

    // Total number of days in this month
    const daysInMonth = lastDay.getDate();

    // Which day of the week the 1st falls on (0 = Sunday, 6 = Saturday)
    const startingDayOfWeek = firstDay.getDay();
    
    // Array to hold all calendar cells (some are empty placeholders)
    const days: { key: string; day: number | null }[] = [];

    // Add empty cells before the 1st day to align the calendar grid
    // For example, if the month starts on Wednesday (day 3), we add 3 empty cells
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ key: `empty-${year}-${month}-${i}`, day: null });
    }

    // Add the actual numbered days of the month (1, 2, 3, ... 28/29/30/31)
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ key: `day-${year}-${month}-${day}`, day });
    }

    // Return the complete array of calendar cells
    return days;
  };

  // ─────────────────────────────────────────────
  // CALENDAR HELPER: Check if a given day number is today's date
  // ─────────────────────────────────────────────
  const isToday = (day: number | null) => {
    // Null days are empty calendar cells — they can't be "today"
    if (!day) return false;

    // Get today's actual date for comparison
    const today = new Date();

    // A day is "today" only if the day number, month, AND year all match
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Array of full month names for displaying in the calendar header
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Array of abbreviated day names for the calendar column headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // ─────────────────────────────────────────────
  // EFFECT: Load data from localStorage and set up auto-refresh interval
  // Runs once on component mount (empty dependency array [])
  // ─────────────────────────────────────────────
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // --- Initial Load ---

    // Load recent activities from localStorage (saved by addActivity utility)
    const storedActivities = localStorage.getItem('recentActivities');
    if (storedActivities) {
      const activities = JSON.parse(storedActivities);
      // Only display the latest 5 activities on the dashboard
      setActivityItems(activities.slice(0, 5));
    }

    // Load projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const projectsData = JSON.parse(storedProjects);
      setProjects(projectsData);
    }

    // --- Auto-Refresh ---
    // Set up a 1-second interval to keep the dashboard data fresh
    // This ensures new activities show up without needing a page refresh
    const interval = setInterval(() => {
      // Update "now" timestamp so "time ago" labels recalculate
      setNow(Date.now());

      // Re-read activities from localStorage (another tab/page may have added new ones)
      const storedActivities = localStorage.getItem('recentActivities');
      if (storedActivities) {
        const activities = JSON.parse(storedActivities);
        setActivityItems(activities.slice(0, 5));
      } else {
        // If localStorage was cleared, show empty list
        setActivityItems([]);
      }

      // Re-read projects from localStorage
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const projectsData = JSON.parse(storedProjects);
        setProjects(projectsData);
      } else {
        setProjects([]);
      }
    }, 1000); // Runs every 1000ms (1 second)

    // Cleanup function: clear the interval when the component unmounts
    // Prevents memory leaks and unnecessary background work
    return () => clearInterval(interval);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ─────────────────────────────────────────────
  // HELPER: Convert a timestamp into a human-readable "time ago" string
  // Example: 120000ms ago → "2 minutes ago"
  // ─────────────────────────────────────────────
  const getTimeAgo = (timestamp: number) => {
    // Calculate the difference between now and the event timestamp
    const diff = now - timestamp;

    // Convert milliseconds to minutes, hours, and days
    const minutes = Math.floor(diff / 60000);    // 60,000ms = 1 minute
    const hours = Math.floor(diff / 3600000);     // 3,600,000ms = 1 hour
    const days = Math.floor(diff / 86400000);     // 86,400,000ms = 1 day

    // Helper to add "s" for plural (e.g., "1 minute ago" vs "2 minutes ago")
    const pluralize = (value: number, unit: string) =>
      `${value} ${unit}${value === 1 ? '' : 's'} ago`;

    // Return the most appropriate time unit
    if (minutes < 60) return pluralize(minutes, 'minute');  // Under 1 hour → show minutes
    if (hours < 24) return pluralize(hours, 'hour');         // Under 1 day → show hours
    return pluralize(days, 'day');                            // Otherwise → show days
  };

  // ─────────────────────────────────────────────
  // CALENDAR HELPER: Return the CSS classes for a calendar day cell
  // Today gets a blue highlight, other days get a subtle hover effect
  // ─────────────────────────────────────────────
  const getDayClass = (day: number | null) => {
    // Empty cells (before the 1st of the month) get no styling
    if (!day) return '';

    // Today's date gets a blue background with white text
    if (isToday(day)) {
      return 'bg-blue-600 text-white font-bold';
    }

    // All other days get a light background with hover effect
    return 'bg-slate-50 text-slate-900 hover:bg-slate-100';
  };

  // ─────────────────────────────────────────────
  // HELPER: Map activity type strings to their corresponding icon and color scheme
  // Each activity type gets a unique icon, background color, and icon color
  // ─────────────────────────────────────────────
  const getActivityIcon = (type: string) => {
    switch (type) {
      // Manager was added to the system
      case 'manager_added':
        return { Icon: UserPlus, bgClass: 'bg-blue-100', iconClass: 'text-blue-600' };

      // Manager's information was edited/updated
      case 'manager_edited':
        return { Icon: UserCog, bgClass: 'bg-purple-100', iconClass: 'text-purple-600' };

      // Manager was deleted from the system
      case 'manager_deleted':
        return { Icon: XCircle, bgClass: 'bg-red-100', iconClass: 'text-red-600' };

      // A new project was created
      case 'project_added':
        return { Icon: FolderKanban, bgClass: 'bg-green-100', iconClass: 'text-green-600' };

      // A manager was assigned to a project
      case 'project_assigned':
        return { Icon: CheckCircle2, bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' };

      // A manager was unassigned from a project
      case 'project_unassigned':
        return { Icon: XCircle, bgClass: 'bg-orange-100', iconClass: 'text-orange-600' };

      // Mobile access was granted to a user
      case 'access_granted':
        return { Icon: CheckCircle2, bgClass: 'bg-green-100', iconClass: 'text-green-600' };

      // Mobile access was revoked from a user
      case 'access_revoked':
        return { Icon: XCircle, bgClass: 'bg-red-100', iconClass: 'text-red-600' };

      // Fallback for any unknown/other activity types
      default:
        return { Icon: SettingsIcon, bgClass: 'bg-amber-100', iconClass: 'text-amber-600' };
    }
  };

  // ─────────────────────────────────────────────
  // RENDER: The main dashboard layout
  // ─────────────────────────────────────────────
  return (
    // Outer flex container — sidebar sits on the left, content on the right
    <div className="flex">

      {/* Left sidebar navigation panel */}
      <Sidebar />

      {/* Main content area — pushed right by the sidebar's width (ml-64 = margin-left: 16rem) */}
      <div className="flex-1 ml-64">

        {/* Top header bar with date, health status, and user info */}
        <Header />

        {/* Main content section with light gray background */}
        <main className="p-8 bg-slate-50 min-h-screen">

          {/* Stats Cards — shows Total Managers, Active Projects, Pending Approvals */}
          <StatsCards />

          {/* Two-column grid layout: Recent Activity (2/3 width) + Calendar (1/3 width) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ═══════════════════════════════════════ */}
            {/* RECENT ACTIVITY SECTION (spans 2 columns on large screens) */}
            {/* ═══════════════════════════════════════ */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">

              {/* Section header with Activity icon and title */}
              <div className="flex items-center gap-3 mb-4">
                <Activity size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              </div>

              {/* Activity items list */}
              <div className="space-y-4">
                {activityItems.length > 0 ? (
                  // Map through each activity item and render it
                  activityItems.map((item) => {
                    // Get the icon component and color classes based on activity type
                    const { Icon, bgClass, iconClass } = getActivityIcon(item.type);
                    return (
                      // Individual activity row with icon, description, and time ago
                      <div
                        key={`${item.timestamp}-${item.type}`}
                        className="flex items-center gap-4 pb-4 border-b border-slate-200 last:border-0"
                      >
                        {/* Color-coded circular icon representing the activity type */}
                        <div className={`w-10 h-10 ${bgClass} rounded-full flex items-center justify-center`}>
                          <Icon size={18} className={iconClass} />
                        </div>

                        {/* Activity description and user name */}
                        <div className="flex-1">
                          {/* Main action text (e.g., "New Manager Added") */}
                          <p className="font-medium text-slate-900">{item.action}</p>
                          {/* User who performed the action */}
                          <p className="text-xs text-slate-600">{item.user}</p>
                        </div>

                        {/* Human-readable time ago (e.g., "5 minutes ago") */}
                        <p className="text-xs text-slate-500">{getTimeAgo(item.timestamp)}</p>
                      </div>
                    );
                  })
                ) : (
                  // Empty state — shown when there are no activities yet
                  <p className="text-slate-500 text-sm">No recent activities</p>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* CALENDAR WIDGET SECTION (spans 1 column) */}
            {/* ═══════════════════════════════════════ */}
            <div className="bg-white rounded-lg shadow-md p-6">

              {/* Section header with Calendar icon and title */}
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Calendar</h2>
              </div>

              {/* Month navigation bar — Previous / Current Month / Next */}
              <div className="mb-4 flex items-center justify-between">
                {/* Previous month button — moves calendar back 1 month */}
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  ← Prev
                </button>

                {/* Current month and year label */}
                <h3 className="text-lg font-semibold text-slate-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>

                {/* Next month button — moves calendar forward 1 month */}
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Next →
                </button>
              </div>

              {/* "Today" button — quickly jump back to the current month */}
              <button
                onClick={() => setCurrentDate(new Date())}
                className="w-full mb-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
              >
                Today
              </button>

              {/* Day-of-week column headers (Sun, Mon, Tue, ...) */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar day grid — 7 columns, each cell is a day or empty placeholder */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendar().map(({ key, day }) => (
                  <div
                    key={key}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg ${getDayClass(
                      day
                    )}`}
                  >
                    {/* Display the day number (null = empty placeholder cell) */}
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* ACTIVE PROJECTS SECTION (full width, below the 2-column grid) */}
          {/* ═══════════════════════════════════════ */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">

            {/* Section header with project folder icon and title */}
            <div className="flex items-center gap-3 mb-4">
              <FolderKanban size={20} className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Active Projects</h2>
            </div>

            {/* Conditional rendering: show project cards if any exist, otherwise show empty state */}
            {projects.length > 0 ? (
              // Responsive grid of project cards (1 col on mobile, 2 on tablet, 3 on desktop)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  // Individual project card with name, status badge, and manager info
                  <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      {/* Project name */}
                      <h3 className="font-semibold text-slate-900">{project.name}</h3>

                      {/* Status badge — green for "Active", blue for all other statuses */}
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        project.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    {/* Assigned manager name */}
                    <p className="text-sm text-slate-600">Manager: {project.manager}</p>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state — shown when no projects exist in localStorage
              <p className="text-slate-500 text-sm">No projects available</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
