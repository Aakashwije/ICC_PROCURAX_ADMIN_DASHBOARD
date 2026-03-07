'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import {
  Bell,
  UserPlus,
  UserCog,
  XCircle,
  FolderKanban,
  CheckCircle2,
  Settings as SettingsIcon,
  Trash2,
  Filter,
  Search,
  CheckCheck,
  BellOff,
  Clock,
} from 'lucide-react';

interface ActivityItem {
  action: string;
  user: string;
  time: string;
  timestamp: number;
  type: string;
  read?: boolean;
}

type FilterType = 'all' | 'unread' | 'managers' | 'projects' | 'access';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(() => Date.now());

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    const stored = localStorage.getItem('recentActivities');
    if (stored) {
      const activities: ActivityItem[] = JSON.parse(stored);
      // Add read status from separate storage
      const readStatus = JSON.parse(localStorage.getItem('notificationReadStatus') || '{}');
      const enriched = activities.map((a) => ({
        ...a,
        read: readStatus[a.timestamp] === true,
      }));
      setNotifications(enriched);
    } else {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      setNow(Date.now());
      loadNotifications();
    }, 2000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Time ago helper
  const getTimeAgo = (timestamp: number) => {
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Full date for tooltip
  const getFullDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Icon mapping
  const getNotificationMeta = (type: string) => {
    switch (type) {
      case 'manager_added':
        return {
          Icon: UserPlus,
          gradient: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          label: 'Manager',
        };
      case 'manager_edited':
        return {
          Icon: UserCog,
          gradient: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-100',
          label: 'Manager',
        };
      case 'manager_deleted':
        return {
          Icon: XCircle,
          gradient: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          label: 'Manager',
        };
      case 'project_added':
        return {
          Icon: FolderKanban,
          gradient: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          label: 'Project',
        };
      case 'project_assigned':
        return {
          Icon: CheckCircle2,
          gradient: 'from-teal-500 to-teal-600',
          bgColor: 'bg-teal-50',
          borderColor: 'border-teal-100',
          label: 'Project',
        };
      case 'project_unassigned':
        return {
          Icon: XCircle,
          gradient: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-100',
          label: 'Project',
        };
      case 'access_granted':
        return {
          Icon: CheckCircle2,
          gradient: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
          label: 'Access',
        };
      case 'access_revoked':
        return {
          Icon: XCircle,
          gradient: 'from-rose-500 to-rose-600',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-100',
          label: 'Access',
        };
      default:
        return {
          Icon: SettingsIcon,
          gradient: 'from-amber-500 to-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          label: 'System',
        };
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !n.action.toLowerCase().includes(q) &&
        !n.user.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    // Type filter
    switch (filter) {
      case 'unread':
        return !n.read;
      case 'managers':
        return n.type.startsWith('manager_');
      case 'projects':
        return n.type.startsWith('project_');
      case 'access':
        return n.type.startsWith('access_');
      default:
        return true;
    }
  });

  // Stats
  const unreadCount = notifications.filter((n) => !n.read).length;
  const todayCount = notifications.filter(
    (n) => now - n.timestamp < 86400000
  ).length;

  // Mark single notification as read
  const markAsRead = (timestamp: number) => {
    const readStatus = JSON.parse(
      localStorage.getItem('notificationReadStatus') || '{}'
    );
    readStatus[timestamp] = true;
    localStorage.setItem('notificationReadStatus', JSON.stringify(readStatus));
    loadNotifications();
  };

  // Mark all as read
  const markAllAsRead = () => {
    const readStatus = JSON.parse(
      localStorage.getItem('notificationReadStatus') || '{}'
    );
    notifications.forEach((n) => {
      readStatus[n.timestamp] = true;
    });
    localStorage.setItem('notificationReadStatus', JSON.stringify(readStatus));
    loadNotifications();
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    localStorage.removeItem('recentActivities');
    localStorage.removeItem('notificationReadStatus');
    setNotifications([]);
  };

  // Group notifications by date
  const groupByDate = (items: ActivityItem[]) => {
    const groups: { label: string; items: ActivityItem[] }[] = [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    const grouped: Record<string, ActivityItem[]> = {};

    items.forEach((item) => {
      const dateStr = new Date(item.timestamp).toDateString();
      let label: string;
      if (dateStr === todayStr) {
        label = 'Today';
      } else if (dateStr === yesterdayStr) {
        label = 'Yesterday';
      } else {
        label = new Date(item.timestamp).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
      }
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    });

    Object.entries(grouped).forEach(([label, items]) => {
      groups.push({ label, items });
    });

    return groups;
  };

  const filterOptions: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'managers', label: 'Managers' },
    { key: 'projects', label: 'Projects' },
    { key: 'access', label: 'Access' },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bell size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Notifications
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Stay updated with all system activities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCheck size={16} />
                  Mark all read
                </button>
                <button
                  onClick={clearAllNotifications}
                  disabled={notifications.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  Clear all
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {notifications.length}
                </p>
                <p className="text-xs text-slate-500">Total Notifications</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <BellOff size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {unreadCount}
                </p>
                <p className="text-xs text-slate-500">Unread</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Clock size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {todayCount}
                </p>
                <p className="text-xs text-slate-500">Today</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition outline-none"
                />
              </div>
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5">
                <Filter size={16} className="text-slate-400 mr-1" />
                {filterOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setFilter(opt.key)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                      filter === opt.key
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                    {opt.count !== undefined && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          filter === opt.key
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notification List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-6">
              {groupByDate(filteredNotifications).map((group) => (
                <div key={group.label}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {group.label}
                    </h3>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400">
                      {group.items.length} notification
                      {group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Notification Cards */}
                  <div className="space-y-2">
                    {group.items.map((notification) => {
                      const meta = getNotificationMeta(notification.type);
                      const Icon = meta.Icon;
                      return (
                        <div
                          key={`${notification.timestamp}-${notification.type}`}
                          onClick={() => markAsRead(notification.timestamp)}
                          className={`group relative bg-white rounded-xl border p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                            notification.read
                              ? 'border-slate-100 opacity-75'
                              : `${meta.borderColor} border-l-4`
                          }`}
                        >
                          {/* Unread dot */}
                          {!notification.read && (
                            <div className="absolute top-4 right-4">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                              </span>
                            </div>
                          )}

                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${meta.gradient} rounded-xl flex items-center justify-center shadow-sm`}
                          >
                            <Icon size={18} className="text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p
                                  className={`text-sm leading-snug ${
                                    notification.read
                                      ? 'text-slate-600'
                                      : 'text-slate-900 font-semibold'
                                  }`}
                                >
                                  {notification.action}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {notification.user}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${meta.bgColor} text-slate-600`}
                              >
                                {meta.label}
                              </span>
                              <span
                                className="text-xs text-slate-400 flex items-center gap-1"
                                title={getFullDate(notification.timestamp)}
                              >
                                <Clock size={11} />
                                {getTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                          </div>

                          {/* Action */}
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.timestamp);
                              }}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 rounded-lg"
                              title="Mark as read"
                            >
                              <CheckCircle2
                                size={16}
                                className="text-slate-400"
                              />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bell size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {searchQuery || filter !== 'all'
                  ? 'No matching notifications'
                  : 'All caught up!'}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your search or filter to find what you\'re looking for.'
                  : 'You have no notifications yet. Activities will appear here as they happen.'}
              </p>
              {(searchQuery || filter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
