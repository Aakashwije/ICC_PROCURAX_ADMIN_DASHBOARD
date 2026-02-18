'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Clock, FolderKanban, Smartphone, Users } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: ReactNode;
  color: string;
}

import { getStats } from '@/services/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalManagers: 0,
    activeProjects: 0,
    accessGrantedPercent: 0,
    pendingApprovals: 0,
  });

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  // ------------------------------------
  // Fetch dashboard stats from backend
  // ------------------------------------
  // ------------------------------------
  // Fetch dashboard stats from backend
  // ------------------------------------
  const fetchStats = async () => {
    if (!token) return;
    try {
      const data = await getStats(token);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards: StatCard[] = [
    {
      title: 'Total Project Managers',
      value: stats.totalManagers,
      change: 12,
      icon: <Users size={24} className="text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      change: 8,
      icon: <FolderKanban size={24} className="text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: 'Mobile App Access',
      value: `${stats.accessGrantedPercent}%`,
      change: 5,
      icon: <Smartphone size={24} className="text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      change: -2,
      icon: <Clock size={24} className="text-orange-600" />,
      color: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.color} rounded-lg shadow-md p-6 border-l-4 border-slate-400`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p
                className={`text-xs mt-2 ${
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% from last
                month
              </p>
            </div>
            <div className="text-4xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
