const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return res.json();
}

// --- Dashboard Stats ---

export async function getStats(token: string) {
  const res = await fetch(`${API_URL}/api/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.json();
}

// --- Project Managers ---

export async function getManagers(token: string) {
  const res = await fetch(`${API_URL}/api/admin/project-managers`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.json();
}

export async function addManager(token: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/project-managers`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function updateManager(token: string, id: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/project-managers/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteManager(token: string, id: string) {
  const res = await fetch(`${API_URL}/api/admin/project-managers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function toggleManagerAccess(token: string, id: string) {
  const res = await fetch(`${API_URL}/api/admin/project-managers/${id}/access`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// --- Projects ---

export async function getProjects(token: string) {
  const res = await fetch(`${API_URL}/api/admin/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.json();
}

export async function addProject(token: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/projects`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function assignManager(token: string, data: any) {
  const res = await fetch(`${API_URL}/api/admin/projects/assign`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });

  return res.json();
}

// --- Mobile Users ---

export async function getMobileUsers(token: string) {
  const res = await fetch(`${API_URL}/api/admin/mobile-users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function approveMobileUser(token: string, userId: string) {
  const res = await fetch(`${API_URL}/api/admin/mobile-users/${userId}/approve`, {
    method: "POST",
    headers: getHeaders(token)
  });
  return res.json();
}

export async function rejectMobileUser(token: string, userId: string) {
  const res = await fetch(`${API_URL}/api/admin/mobile-users/${userId}/reject`, {
    method: "POST",
    headers: getHeaders(token)
  });
  return res.json();
}
