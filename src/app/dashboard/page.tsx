'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';

export default function DashboardPage() {
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
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: 'Access Granted', user: 'Sarah Johnson', time: '2 hours ago', icon: '✓' },
                  { action: 'New Manager Added', user: 'Mike Davis', time: '4 hours ago', icon: '+' },
                  { action: 'Permission Updated', user: 'John Smith', time: '1 day ago', icon: '⚙️' },
                  { action: 'Access Revoked', user: 'Alex Brown', time: '2 days ago', icon: '✗' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-200 last:border-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {item.icon}
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
              <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Stats</h2>
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
