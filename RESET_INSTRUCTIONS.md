# Reset Admin Dashboard

To reset the dashboard and clear all data, open your browser's Developer Console (F12) and run this command:

```javascript
localStorage.clear();
location.reload();
```

This will:
- Clear all project managers
- Clear all projects
- Clear all recent activities
- Reset all stats to zero
- Reload the page

After running this, you'll have a fresh dashboard to test adding new project managers and projects.
