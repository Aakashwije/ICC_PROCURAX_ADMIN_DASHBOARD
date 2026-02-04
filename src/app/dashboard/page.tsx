'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import {
  Activity,
  CheckCircle2,
  Gauge,
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

export default function DashboardPage() {
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Load activities from localStorage
    const storedActivities = localStorage.getItem('recentActivities');
    if (storedActivities) {
      const activities = JSON.parse(storedActivities);
      setActivityItems(activities.slice(0, 10)); // Show only latest 10
    }
  }, []);

  // Function to get time difference
  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
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
                  activityItems.map((item, idx) => {
                    const { Icon, bgClass, iconClass } = getActivityIcon(item.type);
                    return (
                      <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-200 last:border-0">
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

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gauge size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Quick Stats</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Approval Pending</p>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Access Granted</p>
                  <p className="text-2xl font-bold text-green-600">22</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Pending Requests</p>
                  <p className="text-2xl font-bold text-orange-600">5</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
