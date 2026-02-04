interface Activity {
  action: string;
  user: string;
  time: string;
  timestamp: number;
  type: string;
}

export function addActivity(action: string, user: string, type: string) {
  const storedActivities = localStorage.getItem('recentActivities');
  const activities: Activity[] = storedActivities ? JSON.parse(storedActivities) : [];

  const newActivity: Activity = {
    action,
    user,
    time: new Date().toLocaleString(),
    timestamp: Date.now(),
    type,
  };

  // Add to beginning of array (most recent first)
  activities.unshift(newActivity);

  // Keep only last 50 activities
  const trimmedActivities = activities.slice(0, 50);

  localStorage.setItem('recentActivities', JSON.stringify(trimmedActivities));
}
