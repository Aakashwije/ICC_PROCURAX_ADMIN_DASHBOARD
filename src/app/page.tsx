import Link from 'next/link';
import Image from "next/image";
import { LayoutDashboard } from "lucide-react";



export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center mx-auto mb-6 overflow-hidden">
  <Image
    src="/icc_logo.jpg"
    alt="ICC Logo"
    width={90}
    height={90}
    className="object-contain"
    priority
  />
</div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <LayoutDashboard className="text-blue-400" size={32} />
            <h1 className="text-5xl font-bold text-white">ICC PROCURAX ADMIN DASHBOARD</h1>
          </div>
          <p className="text-xl text-slate-300 mb-8">
            Admin Dashboard for Managing Project Managers and Mobile App Access
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="text-left">
              <p className="text-blue-400 font-semibold mb-2">✓ Project Manager Management</p>
              <p className="text-slate-400 text-sm">Add, edit, and manage project managers</p>
            </div>
            <div className="text-left">
              <p className="text-blue-400 font-semibold mb-2">✓ Mobile App Access Control</p>
              <p className="text-slate-400 text-sm">Grant or revoke access to the mobile app</p>
            </div>
            <div className="text-left">
              <p className="text-blue-400 font-semibold mb-2">✓ Permission Management</p>
              <p className="text-slate-400 text-sm">Configure role-based permissions</p>
            </div>
            <div className="text-left">
              <p className="text-blue-400 font-semibold mb-2">✓ Activity Monitoring</p>
              <p className="text-slate-400 text-sm">Track all access requests and changes</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="border border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-slate-700 transition"
          >
            Admin Access
          </Link>
        </div>

        <p className="text-slate-400 text-sm mt-8">
          This is a demo application. Use any credentials to log in.
        </p>
      </div>
    </div>
  );
}
