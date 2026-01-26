'use client';

import { useState } from 'react';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}

export default function StatsCards() {
  const stats: StatCard[] = [
    {
      title: 'Total Project Managers',
      value: 24,
      change: 12,
      icon: '👥',
      color: 'bg-blue-50',
    },
    {
      title: 'Active Projects',
      value: 18,
      change: 8,
      icon: '🏗️',
      color: 'bg-green-50',
    },
    {
      title: 'Mobile App Access',
      value: '92%',
      change: 5,
      icon: '📱',
      color: 'bg-purple-50',
    },
    {
      title: 'Pending Approvals',
      value: 3,
      change: -2,
      icon: '⏳',
      color: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.color} rounded-lg shadow-md p-6 border-l-4 border-slate-400`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className={`text-xs mt-2 ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% from last month
              </p>
            </div>
            <div className="text-4xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
