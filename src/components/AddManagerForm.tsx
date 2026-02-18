'use client';

import { useEffect, useState } from 'react';
import { addActivity } from '@/utils/activityLogger';
import { getToken } from '@/utils/auth';
import { addManager, assignManager, getProjects } from '@/services/api';

interface AddManagerFormData {
  name: string;
  email: string;
  phone: string;
  projectId: string;
  grantAccess: boolean;
}

interface Project {
  id: string;
  name: string;
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
  const token = getToken();

  useEffect(() => {
    const loadProjects = async () => {
      if (!token) return;
      try {
        const data = await getProjects(token);
        setProjects(
          data.map((project) => ({
            id: project._id,
            name: project.name,
          }))
        );
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };

    void loadProjects();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const submit = async () => {
      try {
        const response = await addManager(token, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          isActive: formData.grantAccess,
          isApproved: true,
        });

        const managerId = response?.manager?._id;
        addActivity('New Manager Added', formData.name, 'manager_added');

        if (formData.projectId && managerId) {
          await assignManager(token, {
            projectId: formData.projectId,
            managerId,
          });
          const assignedProject = projects.find(
            (project) => project.id === formData.projectId
          );
          if (assignedProject) {
            addActivity(
              `Manager Assigned to ${assignedProject.name}`,
              formData.name,
              'project_assigned'
            );
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
      } catch (err) {
        console.error('Failed to add manager', err);
      }
    };

    void submit();
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
            <label
              htmlFor="manager-name"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Full Name *
            </label>
            <input
              id="manager-name"
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
            <label
              htmlFor="manager-email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Email *
            </label>
            <input
              id="manager-email"
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
            <label
              htmlFor="manager-phone"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Phone Number *
            </label>
            <input
              id="manager-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1-555-0000"
            />
          </div>
          <div>
            <label
              htmlFor="manager-project"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Assign to Project *
            </label>
            <select
              id="manager-project"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
            >
              <option value="">Select a Project</option>
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
