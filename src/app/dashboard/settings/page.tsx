'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useCallback, useEffect, useState } from 'react';
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Users,
  BarChart3,
  Globe,
  Clock,
  Mail,
  Phone,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { getSettings, updateSettings } from '@/services/api';

type TabKey =
  | 'profile'
  | 'company'
  | 'users'
  | 'notifications'
  | 'display'
  | 'reports'
  | 'security';

const tabs: { key: TabKey; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'profile', label: 'Admin Profile', icon: User, description: 'Your account details' },
  { key: 'company', label: 'Company Info', icon: Building2, description: 'Organization details' },
  { key: 'users', label: 'User Management', icon: Users, description: 'Approval & access rules' },
  { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts & emails' },
  { key: 'display', label: 'Display', icon: Globe, description: 'Language & date format' },
  { key: 'reports', label: 'Reports & Data', icon: BarChart3, description: 'Export & retention' },
  { key: 'security', label: 'Security', icon: Shield, description: 'Password & login' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Profile settings ──
  const [profile, setProfile] = useState({
    fullName: 'Admin User',
    email: 'admin@icc-procurax.com',
    phone: '+94 77 123 4567',
    role: 'Administrator',
    department: 'Operations',
  });

  // ── Company settings ──
  const [company, setCompany] = useState({
    companyName: 'ICC (Pvt) Ltd',
    industry: 'Construction',
    address: 'Colombo, Sri Lanka',
    website: 'https://icc-procurax.com',
    taxId: '',
    companySize: '50-100',
  });

  // ── User management settings ──
  const [userMgmt, setUserMgmt] = useState({
    autoApproveManagers: false,
    autoApproveMobileUsers: false,
    requirePhoneVerification: true,
    maxProjectsPerManager: '10',
    allowManagerSelfRegister: true,
    inactiveAccountDays: '90',
  });

  // ── Notification settings ──
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsAlerts: false,
    newManagerAlert: true,
    newUserAlert: true,
    projectStatusAlert: true,
    dailyDigest: false,
    weeklyReport: true,
    accessChangeAlert: true,
  });

  // ── Display settings ──
  const [display, setDisplay] = useState({
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'Asia/Colombo',
    itemsPerPage: '25',
    defaultDashboardView: 'overview',
    showWelcomeBanner: true,
  });

  // ── Reports settings ──
  const [reports, setReports] = useState({
    defaultExportFormat: 'pdf',
    includeCompanyHeader: true,
    autoGenerateMonthlyReport: false,
    dataRetentionMonths: '24',
    activityLogRetention: '12',
    includeCharts: true,
  });

  // ── Security settings ──
  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    minPasswordLength: '8',
    lockAfterAttempts: '5',
    ipWhitelisting: false,
  });

  // Load API settings and merge
  const loadSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      setNotifications((prev) => ({
        ...prev,
        emailNotifications: data.notifications_email ?? data.emailNotifications ?? prev.emailNotifications,
        smsAlerts: data.smsAlerts ?? prev.smsAlerts,
      }));
      setSecurity((prev) => ({
        ...prev,
        twoFactorAuth: data.twoFactorAuth ?? prev.twoFactorAuth,
        sessionTimeout: data.sessionTimeout ?? prev.sessionTimeout,
      }));
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Load local settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('adminSettings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.profile) setProfile((p) => ({ ...p, ...parsed.profile }));
        if (parsed.company) setCompany((c) => ({ ...c, ...parsed.company }));
        if (parsed.userMgmt) setUserMgmt((u) => ({ ...u, ...parsed.userMgmt }));
        if (parsed.notifications) setNotifications((n) => ({ ...n, ...parsed.notifications }));
        if (parsed.display) setDisplay((d) => ({ ...d, ...parsed.display }));
        if (parsed.reports) setReports((r) => ({ ...r, ...parsed.reports }));
        if (parsed.security) setSecurity((s) => ({ ...s, ...parsed.security }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Save to API (the fields the API supports)
      await updateSettings({
        notifications_email: notifications.emailNotifications,
        notifications_alerts: notifications.smsAlerts,
        sessionTimeout: security.sessionTimeout,
        twoFactorAuth: security.twoFactorAuth,
        emailNotifications: notifications.emailNotifications,
        smsAlerts: notifications.smsAlerts,
      });

      // Save everything locally
      localStorage.setItem(
        'adminSettings',
        JSON.stringify({ profile, company, userMgmt, notifications, display, reports, security })
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Reusable components ──

  const SectionCard = ({
    title,
    description,
    children,
  }: {
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );

  const InputField = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder,
    icon: Icon,
    hint,
    disabled,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    icon?: React.ElementType;
    hint?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );

  const SelectField = ({
    label,
    name,
    value,
    onChange,
    options,
    hint,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    hint?: string;
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition outline-none appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );

  const ToggleField = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  // ── Tab content renderers ──

  const renderProfile = () => (
    <>
      <SectionCard title="Personal Information" description="Your account details visible to the system.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Full Name"
            name="fullName"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            icon={User}
            placeholder="Enter your full name"
          />
          <InputField
            label="Email Address"
            name="profileEmail"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            icon={Mail}
            type="email"
            placeholder="admin@company.com"
          />
          <InputField
            label="Phone Number"
            name="phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            icon={Phone}
            placeholder="+94 77 123 4567"
          />
          <InputField
            label="Role"
            name="role"
            value={profile.role}
            onChange={() => {}}
            icon={Shield}
            disabled
            hint="Role is assigned by the system"
          />
        </div>
        <SelectField
          label="Department"
          name="department"
          value={profile.department}
          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
          options={[
            { value: 'Operations', label: 'Operations' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Engineering', label: 'Engineering' },
            { value: 'Procurement', label: 'Procurement' },
            { value: 'Management', label: 'Management' },
            { value: 'HR', label: 'Human Resources' },
          ]}
        />
      </SectionCard>
    </>
  );

  const renderCompany = () => (
    <>
      <SectionCard title="Organization Details" description="Information about your company that appears on reports and documents.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Company Name"
            name="companyName"
            value={company.companyName}
            onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
            icon={Building2}
            placeholder="Your company name"
          />
          <SelectField
            label="Industry"
            name="industry"
            value={company.industry}
            onChange={(e) => setCompany({ ...company, industry: e.target.value })}
            options={[
              { value: 'Construction', label: 'Construction' },
              { value: 'Real Estate', label: 'Real Estate' },
              { value: 'Infrastructure', label: 'Infrastructure' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Manufacturing', label: 'Manufacturing' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <InputField
            label="Address"
            name="address"
            value={company.address}
            onChange={(e) => setCompany({ ...company, address: e.target.value })}
            placeholder="Street, City, Country"
          />
          <InputField
            label="Website"
            name="website"
            value={company.website}
            onChange={(e) => setCompany({ ...company, website: e.target.value })}
            icon={Globe}
            placeholder="https://yourcompany.com"
          />
          <InputField
            label="Tax / Registration ID"
            name="taxId"
            value={company.taxId}
            onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
            placeholder="Optional"
            hint="Used on official reports and invoices"
          />
          <SelectField
            label="Company Size"
            name="companySize"
            value={company.companySize}
            onChange={(e) => setCompany({ ...company, companySize: e.target.value })}
            options={[
              { value: '1-10', label: '1–10 employees' },
              { value: '11-50', label: '11–50 employees' },
              { value: '50-100', label: '50–100 employees' },
              { value: '100-500', label: '100–500 employees' },
              { value: '500+', label: '500+ employees' },
            ]}
          />
        </div>
      </SectionCard>
    </>
  );

  const renderUserManagement = () => (
    <>
      <SectionCard title="Approval Workflow" description="Control how new managers and mobile app users are approved.">
        <ToggleField
          label="Auto-approve Project Managers"
          description="New managers get instant access without manual approval"
          checked={userMgmt.autoApproveManagers}
          onChange={() => setUserMgmt({ ...userMgmt, autoApproveManagers: !userMgmt.autoApproveManagers })}
        />
        <ToggleField
          label="Auto-approve Mobile App Users"
          description="Mobile users can start using the app immediately after signup"
          checked={userMgmt.autoApproveMobileUsers}
          onChange={() => setUserMgmt({ ...userMgmt, autoApproveMobileUsers: !userMgmt.autoApproveMobileUsers })}
        />
        <ToggleField
          label="Allow Manager Self-Registration"
          description="Managers can sign up on their own without being invited"
          checked={userMgmt.allowManagerSelfRegister}
          onChange={() => setUserMgmt({ ...userMgmt, allowManagerSelfRegister: !userMgmt.allowManagerSelfRegister })}
        />
        <ToggleField
          label="Require Phone Verification"
          description="Users must verify their phone number before gaining access"
          checked={userMgmt.requirePhoneVerification}
          onChange={() => setUserMgmt({ ...userMgmt, requirePhoneVerification: !userMgmt.requirePhoneVerification })}
        />
      </SectionCard>

      <SectionCard title="Limits & Policies" description="Set boundaries for user activity and account management.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Max Projects per Manager"
            name="maxProjectsPerManager"
            value={userMgmt.maxProjectsPerManager}
            onChange={(e) => setUserMgmt({ ...userMgmt, maxProjectsPerManager: e.target.value })}
            options={[
              { value: '5', label: '5 projects' },
              { value: '10', label: '10 projects' },
              { value: '15', label: '15 projects' },
              { value: '20', label: '20 projects' },
              { value: '50', label: '50 projects (unlimited)' },
            ]}
            hint="Maximum number of active projects a single manager can handle"
          />
          <SelectField
            label="Deactivate Inactive Accounts After"
            name="inactiveAccountDays"
            value={userMgmt.inactiveAccountDays}
            onChange={(e) => setUserMgmt({ ...userMgmt, inactiveAccountDays: e.target.value })}
            options={[
              { value: '30', label: '30 days' },
              { value: '60', label: '60 days' },
              { value: '90', label: '90 days' },
              { value: '180', label: '6 months' },
              { value: '365', label: '1 year' },
              { value: 'never', label: 'Never' },
            ]}
            hint="Accounts without login activity will be flagged for review"
          />
        </div>
      </SectionCard>
    </>
  );

  const renderNotifications = () => (
    <>
      <SectionCard title="Notification Channels" description="Choose how you want to receive alerts.">
        <ToggleField
          label="Email Notifications"
          description="Receive notifications via email"
          checked={notifications.emailNotifications}
          onChange={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
        />
        <ToggleField
          label="SMS Alerts"
          description="Get text messages for critical alerts"
          checked={notifications.smsAlerts}
          onChange={() => setNotifications({ ...notifications, smsAlerts: !notifications.smsAlerts })}
        />
      </SectionCard>

      <SectionCard title="Alert Preferences" description="Choose which events trigger a notification.">
        <ToggleField
          label="New Manager Registration"
          description="Get notified when a new project manager signs up"
          checked={notifications.newManagerAlert}
          onChange={() => setNotifications({ ...notifications, newManagerAlert: !notifications.newManagerAlert })}
        />
        <ToggleField
          label="New Mobile User Signup"
          description="Alert when a new user registers on the mobile app"
          checked={notifications.newUserAlert}
          onChange={() => setNotifications({ ...notifications, newUserAlert: !notifications.newUserAlert })}
        />
        <ToggleField
          label="Project Status Changes"
          description="Notify when a project is created, assigned, or its status changes"
          checked={notifications.projectStatusAlert}
          onChange={() => setNotifications({ ...notifications, projectStatusAlert: !notifications.projectStatusAlert })}
        />
        <ToggleField
          label="Access Changes"
          description="Alert when access is granted or revoked for any user"
          checked={notifications.accessChangeAlert}
          onChange={() => setNotifications({ ...notifications, accessChangeAlert: !notifications.accessChangeAlert })}
        />
      </SectionCard>

      <SectionCard title="Digest & Summary" description="Periodic summary reports delivered to your inbox.">
        <ToggleField
          label="Daily Activity Digest"
          description="Receive a daily summary of all system activities"
          checked={notifications.dailyDigest}
          onChange={() => setNotifications({ ...notifications, dailyDigest: !notifications.dailyDigest })}
        />
        <ToggleField
          label="Weekly Report"
          description="A weekly overview of projects, users, and key metrics"
          checked={notifications.weeklyReport}
          onChange={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })}
        />
      </SectionCard>
    </>
  );

  const renderDisplay = () => (
    <>
      <SectionCard title="Regional Preferences" description="Customize how dates, times, and content are displayed.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Language"
            name="language"
            value={display.language}
            onChange={(e) => setDisplay({ ...display, language: e.target.value })}
            options={[
              { value: 'en', label: 'English' },
              { value: 'si', label: 'Sinhala (සිංහල)' },
              { value: 'ta', label: 'Tamil (தமிழ்)' },
            ]}
          />
          <SelectField
            label="Timezone"
            name="timezone"
            value={display.timezone}
            onChange={(e) => setDisplay({ ...display, timezone: e.target.value })}
            options={[
              { value: 'Asia/Colombo', label: 'Asia/Colombo (UTC+5:30)' },
              { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC+5:30)' },
              { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
              { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
              { value: 'America/New_York', label: 'America/New York (UTC-5)' },
            ]}
          />
          <SelectField
            label="Date Format"
            name="dateFormat"
            value={display.dateFormat}
            onChange={(e) => setDisplay({ ...display, dateFormat: e.target.value })}
            options={[
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
            ]}
          />
          <SelectField
            label="Items Per Page"
            name="itemsPerPage"
            value={display.itemsPerPage}
            onChange={(e) => setDisplay({ ...display, itemsPerPage: e.target.value })}
            options={[
              { value: '10', label: '10 items' },
              { value: '25', label: '25 items' },
              { value: '50', label: '50 items' },
              { value: '100', label: '100 items' },
            ]}
            hint="Number of rows shown in tables across the dashboard"
          />
        </div>
      </SectionCard>

      <SectionCard title="Dashboard Preferences">
        <SelectField
          label="Default Dashboard View"
          name="defaultDashboardView"
          value={display.defaultDashboardView}
          onChange={(e) => setDisplay({ ...display, defaultDashboardView: e.target.value })}
          options={[
            { value: 'overview', label: 'Overview (Stats + Activity)' },
            { value: 'projects', label: 'Projects Focus' },
            { value: 'managers', label: 'Manager Focus' },
          ]}
          hint="What you see first when opening the dashboard"
        />
        <ToggleField
          label="Show Welcome Banner"
          description="Display a greeting banner with today's date on the dashboard"
          checked={display.showWelcomeBanner}
          onChange={() => setDisplay({ ...display, showWelcomeBanner: !display.showWelcomeBanner })}
        />
      </SectionCard>
    </>
  );

  const renderReports = () => (
    <>
      <SectionCard title="Export Settings" description="Configure the default format and style for exported reports.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Default Export Format"
            name="defaultExportFormat"
            value={reports.defaultExportFormat}
            onChange={(e) => setReports({ ...reports, defaultExportFormat: e.target.value })}
            options={[
              { value: 'pdf', label: 'PDF Document' },
              { value: 'excel', label: 'Excel Spreadsheet (.xlsx)' },
              { value: 'csv', label: 'CSV File' },
            ]}
          />
        </div>
        <ToggleField
          label="Include Company Header"
          description="Add your company name and logo at the top of exported reports"
          checked={reports.includeCompanyHeader}
          onChange={() => setReports({ ...reports, includeCompanyHeader: !reports.includeCompanyHeader })}
        />
        <ToggleField
          label="Include Charts & Graphs"
          description="Embed visual charts in exported PDF reports"
          checked={reports.includeCharts}
          onChange={() => setReports({ ...reports, includeCharts: !reports.includeCharts })}
        />
        <ToggleField
          label="Auto-generate Monthly Report"
          description="Automatically create and email a monthly summary on the 1st"
          checked={reports.autoGenerateMonthlyReport}
          onChange={() => setReports({ ...reports, autoGenerateMonthlyReport: !reports.autoGenerateMonthlyReport })}
        />
      </SectionCard>

      <SectionCard title="Data Retention" description="How long the system keeps historical data.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Project Data Retention"
            name="dataRetentionMonths"
            value={reports.dataRetentionMonths}
            onChange={(e) => setReports({ ...reports, dataRetentionMonths: e.target.value })}
            options={[
              { value: '6', label: '6 months' },
              { value: '12', label: '1 year' },
              { value: '24', label: '2 years' },
              { value: '36', label: '3 years' },
              { value: '60', label: '5 years' },
              { value: 'forever', label: 'Keep forever' },
            ]}
            hint="Completed projects older than this will be archived"
          />
          <SelectField
            label="Activity Log Retention"
            name="activityLogRetention"
            value={reports.activityLogRetention}
            onChange={(e) => setReports({ ...reports, activityLogRetention: e.target.value })}
            options={[
              { value: '3', label: '3 months' },
              { value: '6', label: '6 months' },
              { value: '12', label: '1 year' },
              { value: '24', label: '2 years' },
            ]}
            hint="System activity logs will be cleaned up after this period"
          />
        </div>
      </SectionCard>
    </>
  );

  const renderSecurity = () => (
    <>
      <SectionCard title="Authentication" description="Control how admins and managers sign in.">
        <ToggleField
          label="Two-Factor Authentication"
          description="Require a verification code in addition to password for login"
          checked={security.twoFactorAuth}
          onChange={() => setSecurity({ ...security, twoFactorAuth: !security.twoFactorAuth })}
        />
        <ToggleField
          label="IP Whitelisting"
          description="Only allow logins from pre-approved IP addresses"
          checked={security.ipWhitelisting}
          onChange={() => setSecurity({ ...security, ipWhitelisting: !security.ipWhitelisting })}
        />
      </SectionCard>

      <SectionCard title="Session & Password Policy" description="Set rules for login sessions and password strength.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Auto Logout After"
            name="sessionTimeout"
            value={security.sessionTimeout}
            onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
            options={[
              { value: '15', label: '15 minutes of inactivity' },
              { value: '30', label: '30 minutes of inactivity' },
              { value: '60', label: '1 hour of inactivity' },
              { value: '120', label: '2 hours of inactivity' },
            ]}
            hint="Automatically logs out admin after this period of inactivity"
          />
          <SelectField
            label="Password Expiry"
            name="passwordExpiry"
            value={security.passwordExpiry}
            onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value })}
            options={[
              { value: '30', label: 'Every 30 days' },
              { value: '60', label: 'Every 60 days' },
              { value: '90', label: 'Every 90 days' },
              { value: '180', label: 'Every 6 months' },
              { value: 'never', label: 'Never expire' },
            ]}
            hint="Users will be prompted to change their password periodically"
          />
          <SelectField
            label="Minimum Password Length"
            name="minPasswordLength"
            value={security.minPasswordLength}
            onChange={(e) => setSecurity({ ...security, minPasswordLength: e.target.value })}
            options={[
              { value: '6', label: '6 characters' },
              { value: '8', label: '8 characters' },
              { value: '10', label: '10 characters' },
              { value: '12', label: '12 characters' },
            ]}
          />
          <SelectField
            label="Lock Account After"
            name="lockAfterAttempts"
            value={security.lockAfterAttempts}
            onChange={(e) => setSecurity({ ...security, lockAfterAttempts: e.target.value })}
            options={[
              { value: '3', label: '3 failed attempts' },
              { value: '5', label: '5 failed attempts' },
              { value: '10', label: '10 failed attempts' },
            ]}
            hint="Account will be temporarily locked after this many wrong passwords"
          />
        </div>
      </SectionCard>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfile();
      case 'company': return renderCompany();
      case 'users': return renderUserManagement();
      case 'notifications': return renderNotifications();
      case 'display': return renderDisplay();
      case 'reports': return renderReports();
      case 'security': return renderSecurity();
    }
  };

  const activeTabData = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-700/20">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage your account, preferences, and system configuration
                </p>
              </div>
            </div>
          </div>

          {/* Layout: Sidebar Tabs + Content */}
          <div className="flex gap-6">
            {/* Tab Navigation */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-8">
                <nav className="p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all duration-150 mb-0.5 ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon
                          size={18}
                          className={isActive ? 'text-blue-600' : 'text-slate-400'}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : ''}`}>
                            {tab.label}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{tab.description}</p>
                        </div>
                        {isActive && <ChevronRight size={14} className="text-blue-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Tab Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <activeTabData.icon size={20} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">{activeTabData.label}</h2>
                </div>
              </div>

              {/* Tab Content */}
              {renderTabContent()}

              {/* Save Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between sticky bottom-4 shadow-lg shadow-slate-200/50">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className="text-green-600 font-medium">Settings saved successfully!</span>
                    </>
                  ) : (
                    <>
                      <Clock size={14} />
                      <span>Changes are saved when you click Save.</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => loadSettings()}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 shadow-md shadow-blue-600/20"
                  >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
