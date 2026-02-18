const API_URL = '/api';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number => typeof value === 'number';

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const parseJson = async <T>(
  res: Response,
  validator: (value: unknown) => value is T
): Promise<T> => {
  const data: unknown = await res.json();
  if (!res.ok) {
    throw new Error((data as { message?: string })?.message || 'Request failed');
  }
  if (!validator(data)) {
    throw new Error('Unexpected API response');
  }
  return data;
};

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export type StatsResponse = {
  totalManagers: number;
  activeProjects: number;
  pendingApprovals: number;
};

export type ManagerResponse = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isApproved?: boolean;
  isActive?: boolean;
  createdAt?: string;
};

export type ManagerPayload = {
  name?: string;
  email?: string;
  phone?: string;
  isApproved?: boolean;
  isActive?: boolean;
};

export type ProjectResponse = {
  _id: string;
  name: string;
  managerId?: string | null;
  managerName?: string;
  sheetUrl: string;
  status?: string;
  createdAt?: string;
};

export type ProjectPayload = {
  name: string;
  sheetUrl: string;
};

export type AssignManagerPayload = {
  projectId: string;
  managerId: string | null;
};

export type SettingsData = {
  theme?: string;
  timezone?: string;
  notifications_email?: boolean;
  notifications_alerts?: boolean;
  apiEndpoint?: string;
  sessionTimeout?: string;
  twoFactorAuth?: boolean;
  emailNotifications?: boolean;
  smsAlerts?: boolean;
};

type SettingsResponse = {
  success: boolean;
  data: SettingsData;
};

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/admin-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return res.json();
}

// --- Dashboard Stats ---

export async function getStats(token: string): Promise<StatsResponse> {
  const res = await fetch(`${API_URL}/admin-stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return parseJson(res, (value): value is StatsResponse => {
    if (!isObject(value)) return false;
    return (
      isNumber(value.totalManagers) &&
      isNumber(value.activeProjects) &&
      isNumber(value.pendingApprovals)
    );
  });
}

// --- Project Managers ---

export async function getManagers(token: string): Promise<ManagerResponse[]> {
  const res = await fetch(`${API_URL}/admin-managers`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return parseJson(res, (value): value is ManagerResponse[] => Array.isArray(value));
}

export async function addManager(token: string, data: ManagerPayload) {
  const res = await fetch(`${API_URL}/admin-managers`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function updateManager(token: string, id: string, data: ManagerPayload) {
  const res = await fetch(`${API_URL}/admin-managers/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteManager(token: string, id: string) {
  const res = await fetch(`${API_URL}/admin-managers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function toggleManagerAccess(token: string, id: string) {
  const res = await fetch(`${API_URL}/admin-managers/${id}/access`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// --- Projects ---

export async function getProjects(token: string): Promise<ProjectResponse[]> {
  const res = await fetch(`${API_URL}/admin-projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return parseJson(res, (value): value is ProjectResponse[] => Array.isArray(value));
}

export async function addProject(token: string, data: ProjectPayload) {
  const res = await fetch(`${API_URL}/admin-projects`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function assignManager(token: string, data: AssignManagerPayload) {
  const res = await fetch(`${API_URL}/admin-projects/assign`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function deleteProject(token: string, id: string) {
  const res = await fetch(`${API_URL}/admin-projects/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateProject(
  token: string,
  id: string,
  data: Partial<ProjectPayload> & { status?: string }
) {
  const res = await fetch(`${API_URL}/admin-projects/${id}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

// --- Mobile Users ---

export async function getMobileUsers(token: string) {
  const res = await fetch(`${API_URL}/admin-users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function approveMobileUser(token: string, userId: string) {
  const res = await fetch(`${API_URL}/admin-users/${userId}/approve`, {
    method: "PATCH",
    headers: getHeaders(token)
  });
  return res.json();
}

export async function rejectMobileUser(token: string, userId: string) {
  const res = await fetch(`${API_URL}/admin-users/${userId}/reject`, {
    method: "PATCH",
    headers: getHeaders(token)
  });
  return res.json();
}

export async function getSettings(): Promise<SettingsData> {
  const res = await fetch(`${API_URL}/api/settings`);
  const parsed = await parseJson(res, (value): value is SettingsResponse => {
    if (!isObject(value)) return false;
    return isBoolean(value.success) && isObject(value.data);
  });

  return parsed.data;
}

export async function updateSettings(settings: SettingsData): Promise<SettingsData> {
  const res = await fetch(`${API_URL}/api/settings/bulk`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });

  const parsed = await parseJson(res, (value): value is SettingsResponse => {
    if (!isObject(value)) return false;
    return isBoolean(value.success) && isObject(value.data);
  });

  return parsed.data;
}
