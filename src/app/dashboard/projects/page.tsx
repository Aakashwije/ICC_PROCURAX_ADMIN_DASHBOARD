'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { FolderKanban, Plus, X, ExternalLink } from 'lucide-react';

export default function ProjectsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  
  const [projects, setProjects] = useState([
    { id: 1, name: 'City Tower Construction', manager: 'John Smith', progress: 65, status: 'Active', sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123' },
    { id: 2, name: 'Highway Bridge Project', manager: 'Sarah Johnson', progress: 45, status: 'Active', sheetUrl: 'https://docs.google.com/spreadsheets/d/def456' },
    { id: 3, name: 'Residential Complex A', manager: 'John Smith', progress: 80, status: 'Active', sheetUrl: 'https://docs.google.com/spreadsheets/d/ghi789' },
    { id: 4, name: 'Shopping Mall Extension', manager: 'Mike Davis', progress: 30, status: 'Planning', sheetUrl: 'https://docs.google.com/spreadsheets/d/jkl012' },
  ]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject = {
      id: projects.length + 1,
      name: projectTitle,
      manager: 'Unassigned',
      progress: 0,
      status: 'Planning',
      sheetUrl: googleSheetUrl,
    };
    
    setProjects([...projects, newProject]);
    setProjectTitle('');
    setGoogleSheetUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <FolderKanban size={24} className="text-blue-600" />
                  <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
                </div>
                <p className="text-slate-600 mt-2">View and manage all construction projects</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-lg"
              >
                <Plus size={20} />
                Add Project
              </button>
            </div>
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
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink size={16} className="text-slate-400" />
                  <a 
                    href={project.sheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Google Sheet
                  </a>
                </div>
                <button className="w-full text-blue-600 font-medium hover:text-blue-800 transition">
                  View Details →
                </button>
              </div>
            ))}
          </div>

          {/* Add Project Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Add New Project</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label htmlFor="projectTitle" className="block text-sm font-medium text-slate-700 mb-2">
                      Project Title
                    </label>
                    <input
                      id="projectTitle"
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="googleSheetUrl" className="block text-sm font-medium text-slate-700 mb-2">
                      Google Sheet URL
                    </label>
                    <input
                      id="googleSheetUrl"
                      type="url"
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
                    >
                      Add Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
