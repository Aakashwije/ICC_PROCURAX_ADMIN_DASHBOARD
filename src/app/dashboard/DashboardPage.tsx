'use client';

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
} from 'lucide-react';

export default function DashboardPage() {
  const activityItems = [
    {
      action: 'Access Granted',
      user: 'Sarah Johnson',
      time: '2 hours ago',
      Icon: CheckCircle2,
      bgClass: 'bg-green-100',
      iconClass: 'text-green-600',
    },
    {
      action: 'New Manager Added',
      user: 'Mike Davis',
      time: '4 hours ago',
      Icon: UserPlus,
      bgClass: 'bg-blue-100',
      iconClass: 'text-blue-600',
    },
    {
      action: 'Permission Updated',
      user: 'John Smith',
      time: '1 day ago',
      Icon: SettingsIcon,
      bgClass: 'bg-amber-100',
      iconClass: 'text-amber-600',
    },
    {
      action: 'Access Revoked',
      user: 'Alex Brown',
      time: '2 days ago',
      Icon: XCircle,
      bgClass: 'bg-red-100',
      iconClass: 'text-red-600',
    },
  ];

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
                {activityItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-200 last:border-0">
                    <div
                      className={`w-10 h-10 ${item.bgClass} rounded-full flex items-center justify-center`}
                    >
                      <item.Icon size={18} className={item.iconClass} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.action}</p>
                      <p className="text-xs text-slate-600">{item.user}</p>
                    </div>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                ))}
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
