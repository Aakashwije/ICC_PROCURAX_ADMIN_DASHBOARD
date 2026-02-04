'use client';

import { useState, useEffect } from 'react';
import { addActivity } from '@/utils/activityLogger';

interface AddManagerFormData {
  name: string;
  email: string;
  phone: string;
  projectId: string;
  grantAccess: boolean;
}

interface Project {
  id: number;
  name: string;
  managerId: string | null;
}

export default function AddManagerForm() {
  const [formData, setFormData] = useState<AddManagerFormData>({
    name: '',
    email: '',
    phone: '',
    projectId: '',
    grantAccess: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load projects from localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get existing managers from localStorage
    const storedManagers = localStorage.getItem('projectManagers');
    const managers = storedManagers ? JSON.parse(storedManagers) : [];
    
    // Create new manager object
    const newManagerId = String(Date.now());
    const newManager = {
      id: newManagerId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      projects: formData.projectId ? 1 : 0,
      status: 'active' as const,
      accessGranted: formData.grantAccess,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    
    // Add new manager and save to localStorage
    managers.push(newManager);
    localStorage.setItem('projectManagers', JSON.stringify(managers));
    
    // Log activity
    addActivity('New Manager Added', formData.name, 'manager_added');
    
    // If a project was selected, assign this manager to it
    if (formData.projectId) {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        const updatedProjects = projects.map((project: any) =>
          String(project.id) === formData.projectId
            ? { ...project, manager: formData.name, managerId: newManagerId }
            : project
        );
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        
        // Log activity for project assignment
        const assignedProject = projects.find(p => String(p.id) === formData.projectId);
        if (assignedProject) {
          addActivity(`Manager Assigned to ${assignedProject.name}`, formData.name, 'project_assigned');
        }
      }
    }
    
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({
      name: '',
      email: '',
      phone: '',
      projectId: '',
      grantAccess: false,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Project Manager</h2>

      {submitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Project manager added successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1-555-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Assign to Project</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
            >
              <option value="">No Project (Unassigned)</option>
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
          <input
            type="checkbox"
            name="grantAccess"
            id="grantAccess"
            checked={formData.grantAccess}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="grantAccess" className="text-sm font-medium text-slate-700">
            Grant immediate access to mobile application
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Add Project Manager
          </button>
          <button
            type="reset"
            className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
