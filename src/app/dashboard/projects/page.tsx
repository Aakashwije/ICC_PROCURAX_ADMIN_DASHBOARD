'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { FolderKanban } from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    { id: 1, name: 'City Tower Construction', manager: 'John Smith', progress: 65, status: 'Active' },
    { id: 2, name: 'Highway Bridge Project', manager: 'Sarah Johnson', progress: 45, status: 'Active' },
    { id: 3, name: 'Residential Complex A', manager: 'John Smith', progress: 80, status: 'Active' },
    { id: 4, name: 'Shopping Mall Extension', manager: 'Mike Davis', progress: 30, status: 'Planning' },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <FolderKanban size={24} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
            </div>
            <p className="text-slate-600 mt-2">View and manage all construction projects</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                    <p className="text-sm text-slate-600">Manager: {project.manager}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Progress</span>
                    <span className="text-sm font-bold text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button className="w-full text-blue-600 font-medium hover:text-blue-800 transition">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
