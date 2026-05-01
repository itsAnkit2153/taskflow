import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import {
  ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon,
  ExclamationTriangleIcon, FolderIcon, UsersIcon,
} from '@heroicons/react/24/outline';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-orange-100 text-orange-600',
  high: 'bg-red-100 text-red-600',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  const { stats, recentTasks } = data;

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: ClipboardDocumentListIcon, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-500/10' },
    { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
    { label: 'In Progress', value: stats.inProgress, icon: ClockIcon, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Overdue', value: stats.overdue, icon: ExclamationTriangleIcon, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { label: 'Projects', value: stats.projects, icon: FolderIcon, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    ...(user.role === 'admin' ? [{ label: 'Team Members', value: stats.memberCount, icon: UsersIcon, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
            <span className="text-sm font-bold text-brand-500">{Math.round((stats.completed / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{stats.completed} completed</span>
            <span>{stats.inProgress} in progress</span>
            <span>{stats.pending} pending</span>
          </div>
        </div>
      )}

      {/* Recent tasks */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-brand-500 hover:underline">View all</Link>
        </div>
        {recentTasks.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">No tasks yet</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentTasks.map((task) => (
              <div key={task._id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{task.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {task.project?.title} {task.deadline && `· Due ${format(new Date(task.deadline), 'MMM d')}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
