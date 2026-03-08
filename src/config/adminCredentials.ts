/**
 * Admin Credentials for ICC ProcuraX Admin Dashboard
 * 5 authorized administrators with full system access
 * 
 * IMPORTANT: For production, use a proper authentication service (Firebase, Auth0, etc.)
 * and do NOT store credentials in the codebase.
 */

export const ADMIN_CREDENTIALS = [
  {
    id: 1,
    username: "admin1@icc.com",
    email: "admin1@icc.com",
    password: "Admin@2026#Secure1",
    fullName: "Project Admin",
    role: "Admin",
    permissions: ["all"],
  },
  {
    id: 2,
    username: "admin2@icc.com",
    email: "admin2@icc.com",
    password: "Admin@2026#Secure2",
    fullName: "System Admin",
    role: "Admin",
    permissions: ["all"],
  },
  {
    id: 3,
    username: "admin3@icc.com",
    email: "admin3@icc.com",
    password: "Admin@2026#Secure3",
    fullName: "Finance Admin",
    role: "Admin",
    permissions: ["all"],
  },
  {
    id: 4,
    username: "manager@icc.com",
    email: "manager@icc.com",
    password: "Manager@2026#Access1",
    fullName: "Access Manager",
    role: "Manager",
    permissions: ["all"],
  },
  {
    id: 5,
    username: "supervisor@icc.com",
    email: "supervisor@icc.com",
    password: "Supervisor@2026#Control1",
    fullName: "Supervisor",
    role: "Supervisor",
    permissions: ["all"],
  },
];

/**
 * Validate admin credentials
 * @param email - Admin email address
 * @param password - Admin password
 * @returns Admin object if valid, null if invalid
 */
export function validateAdminCredentials(email: string, password: string) {
  return ADMIN_CREDENTIALS.find(
    (admin) => admin.email === email && admin.password === password
  ) || null;
}

/**
 * Get all authorized admin usernames and emails
 */
export function getAuthorizedAdmins() {
  return ADMIN_CREDENTIALS.map((admin) => ({
    username: admin.username,
    email: admin.email,
    fullName: admin.fullName,
  }));
}
