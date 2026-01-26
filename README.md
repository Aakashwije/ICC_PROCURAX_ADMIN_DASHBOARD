# Construction Management Admin Dashboard

A modern, responsive admin dashboard built with **Next.js 16** and **Tailwind CSS** for managing project managers and controlling access to a mobile construction management application.

## 🎯 Features

### Dashboard Overview
- **Statistics Cards**: Real-time metrics for project managers, active projects, mobile app access rates, and pending approvals
- **Recent Activity Feed**: Track all actions and changes in the system
- **Quick Stats Panel**: At-a-glance overview of pending approvals and access grants

### Project Manager Management
- **Add New Managers**: Easy form to add project managers with contact details
- **Manager Directory**: Complete table view of all project managers
- **Status Management**: Track manager status (Active, Pending, Inactive)
- **Mobile App Access Control**: Grant or revoke access to the mobile application with a single click

### Access Control System
- **Fine-grained Permissions**: Manage specific features and capabilities for each manager
- **Permission Templates**: Pre-built permission sets for different roles
- **Feature Access**: Control access to:
  - View Projects
  - Edit Project Details
  - Assign Workers
  - Upload Documents
  - View Budget
  - Generate Reports

### Additional Sections
- **Projects Page**: View all construction projects with progress tracking
- **Permissions Management**: Configure role-based permissions (Project Manager, Site Manager, Administrator)
- **Reports**: Generate and download system activity reports
- **Settings**: Configure API endpoints, session timeouts, and notification preferences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

1. Navigate to the project directory:
```bash
cd construction-dashboard
```

2. Install dependencies:
```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home/landing page
│   ├── login/
│   │   └── page.tsx             # Admin login page
│   ├── dashboard/               # Main dashboard layout
│   │   ├── page.tsx             # Dashboard home
│   │   ├── managers/            # Project managers page
│   │   ├── add-manager/         # Add new manager form
│   │   ├── access/              # Access control page
│   │   ├── projects/            # Projects listing
│   │   ├── permissions/         # Permission management
│   │   ├── reports/             # Reports page
│   │   └── settings/            # System settings
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
└── components/                   # Reusable React components
    ├── Sidebar.tsx              # Navigation sidebar
    ├── Header.tsx               # Page header
    ├── StatsCards.tsx           # Statistics dashboard
    ├── ProjectManagersTable.tsx  # Managers table component
    ├── AccessControlPanel.tsx    # Permission controls
    └── AddManagerForm.tsx        # Manager creation form
```

## 🎨 Tech Stack

- **Frontend Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4.0
- **Language**: TypeScript
- **State Management**: React Hooks (useState)
- **Routing**: Next.js App Router
- **Linting**: ESLint

## 🔐 Authentication

The dashboard includes a login page at `/login`. For this demo version:
- Any valid email and password will grant access
- Test credentials: `admin@example.com` / `password`

## 📱 Responsive Design

The dashboard is fully responsive and works seamlessly on:
- Desktop browsers
- Tablets
- Mobile devices

## 🎯 Key Components

### Sidebar Navigation
- Collapsible navigation with smooth transitions
- Quick menu for all admin functions
- Hover tooltips for collapsed state

### Dashboard Tables
- Interactive project manager listing
- Editable status fields
- One-click access grant/revoke buttons
- Sortable columns (extensible)

### Permission Controls
- Toggle-based permission management
- Manager-specific access control
- Real-time feedback

### Forms
- Add new project managers
- Configure system settings
- Intuitive validation and feedback

## 🔄 Managing Project Manager Access

1. **Add Manager**: Navigate to "Project Managers" → "Add Manager" button
2. **Grant Access**: Select manager → Toggle "Mobile Access" button to green
3. **Configure Permissions**: Go to "Access Control" → Select manager → Toggle permissions
4. **Monitor Activity**: View "Dashboard" for recent access changes

## 📊 Customization

### Adding New Pages
1. Create a new folder in `src/app/dashboard/`
2. Add a `page.tsx` file
3. Import `Header` and `Sidebar` components
4. Add menu item in `Sidebar.tsx`

### Styling
All components use Tailwind CSS utility classes. Customize colors by modifying the Tailwind config or updating class names.

### Database Integration
Replace mock data in components with real API calls:
```typescript
// Example: Replace static data with API
const [managers, setManagers] = useState([])

useEffect(() => {
  fetch('/api/managers')
    .then(res => res.json())
    .then(data => setManagers(data))
}, [])
```

## 📝 License

This project is provided as-is for demonstration purposes.

## 🤝 Support

For questions or improvements, please refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Version**: 0.1.0  
**Last Updated**: January 2026
# ICC_PROCURAX_ADMIN_DASHBOARD
