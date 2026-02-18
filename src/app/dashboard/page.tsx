'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import {
  Activity,
  CheckCircle2,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  UserPlus,
  XCircle,
  FolderKanban,
  UserCog,
} from 'lucide-react';

interface ActivityItem {
  action: string;
  user: string;
  time: string;
  timestamp: number;
  type: string;
}

interface Project {
  id: number;
  name: string;
  manager: string;
  status: string;
}

export default function DashboardPage() {
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(() => Date.now());

  // Generate calendar days
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: { key: string; day: number | null }[] = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ key: `empty-${year}-${month}-${i}`, day: null });
    }
    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ key: `day-${year}-${month}-${day}`, day });
    }
    return days;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Load activities from localStorage
    const storedActivities = localStorage.getItem('recentActivities');
    if (storedActivities) {
      const activities = JSON.parse(storedActivities);
      setActivityItems(activities.slice(0, 5)); // Show only latest 5
    }

    // Load projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const projectsData = JSON.parse(storedProjects);
      setProjects(projectsData);
    }

    // Update every second to reflect changes
    const interval = setInterval(() => {
      setNow(Date.now());
      const storedActivities = localStorage.getItem('recentActivities');
      if (storedActivities) {
        const activities = JSON.parse(storedActivities);
        setActivityItems(activities.slice(0, 5));
      } else {
        setActivityItems([]);
      }

      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const projectsData = JSON.parse(storedProjects);
        setProjects(projectsData);
      } else {
        setProjects([]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Function to get time difference
  const getTimeAgo = (timestamp: number) => {
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    const pluralize = (value: number, unit: string) =>
      `${value} ${unit}${value === 1 ? '' : 's'} ago`;

    if (minutes < 60) return pluralize(minutes, 'minute');
    if (hours < 24) return pluralize(hours, 'hour');
    return pluralize(days, 'day');
  };

  const getDayClass = (day: number | null) => {
    if (!day) return '';
    if (isToday(day)) {
      return 'bg-blue-600 text-white font-bold';
    }
    return 'bg-slate-50 text-slate-900 hover:bg-slate-100';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'manager_added':
        return { Icon: UserPlus, bgClass: 'bg-blue-100', iconClass: 'text-blue-600' };
      case 'manager_edited':
        return { Icon: UserCog, bgClass: 'bg-purple-100', iconClass: 'text-purple-600' };
      case 'manager_deleted':
        return { Icon: XCircle, bgClass: 'bg-red-100', iconClass: 'text-red-600' };
      case 'project_added':
        return { Icon: FolderKanban, bgClass: 'bg-green-100', iconClass: 'text-green-600' };
      case 'project_assigned':
        return { Icon: CheckCircle2, bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' };
      case 'project_unassigned':
        return { Icon: XCircle, bgClass: 'bg-orange-100', iconClass: 'text-orange-600' };
      case 'access_granted':
        return { Icon: CheckCircle2, bgClass: 'bg-green-100', iconClass: 'text-green-600' };
      case 'access_revoked':
        return { Icon: XCircle, bgClass: 'bg-red-100', iconClass: 'text-red-600' };
      default:
        return { Icon: SettingsIcon, bgClass: 'bg-amber-100', iconClass: 'text-amber-600' };
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {activityItems.length > 0 ? (
                  activityItems.map((item) => {
                    const { Icon, bgClass, iconClass } = getActivityIcon(item.type);
                    return (
                      <div
                        key={`${item.timestamp}-${item.type}`}
                        className="flex items-center gap-4 pb-4 border-b border-slate-200 last:border-0"
                      >
                        <div className={`w-10 h-10 ${bgClass} rounded-full flex items-center justify-center`}>
                          <Icon size={18} className={iconClass} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{item.action}</p>
                          <p className="text-xs text-slate-600">{item.user}</p>
                        </div>
                        <p className="text-xs text-slate-500">{getTimeAgo(item.timestamp)}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-sm">No recent activities</p>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Calendar</h2>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  ← Prev
                </button>
                <h3 className="text-lg font-semibold text-slate-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Next →
                </button>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="w-full mb-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
              >
                Today
              </button>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateCalendar().map(({ key, day }) => (
                  <div
                    key={key}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg ${getDayClass(
                      day
                    )}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Projects Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FolderKanban size={20} className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Active Projects</h2>
            </div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{project.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        project.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">Manager: {project.manager}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No projects available</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
