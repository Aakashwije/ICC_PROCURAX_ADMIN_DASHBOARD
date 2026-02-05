const API = "http://localhost:5000";

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API}/admin-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return res.json();
}

export async function getManagers(token: string) {
  const res = await fetch(`${API}/admin-managers`, {
    headers: { Authorization: token }
  });

  return res.json();
}

export async function addManager(token: string, data: any) {
  const res = await fetch(`${API}/admin-managers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function getProjects(token: string) {
  const res = await fetch(`${API}/admin-projects`, {
    headers: { Authorization: token }
  });

  return res.json();
}

export async function addProject(token: string, data: any) {
  const res = await fetch(`${API}/admin-projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function assignManager(token: string, data: any) {
  const res = await fetch(`${API}/admin-projects/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function getStats(token: string) {
  const res = await fetch(`${API}/admin-stats`, {
    headers: { Authorization: token }
  });

  return res.json();
}
