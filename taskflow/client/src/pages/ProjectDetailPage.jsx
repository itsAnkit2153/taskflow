import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`).then((r) => setProject(r.data.project)),
      api.get(`/tasks?project=${id}`).then((r) => setTasks(r.data.tasks)),
    ]).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-16 text-slate-500">Project not found</div>;

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-500 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="h-2" style={{ backgroundColor: project.color }} />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
          {project.description && <p className="text-slate-500 dark:text-slate-400 mt-2">{project.description}</p>}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Owner: <strong className="text-slate-900 dark:text-white">{project.owner?.name}</strong></span>
            <span>{tasks.length} tasks · {completed} completed</span>
          </div>

          {tasks.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500 dark:text-slate-400">Progress</span>
                <span className="font-bold text-brand-500">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {project.members.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Team:</span>
              <div className="flex -space-x-2">
                {project.members.map((m) => (
                  <div key={m._id} title={m.name}
                    className="w-8 h-8 rounded-full bg-brand-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold">
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Tasks</h2>
        </div>
        {tasks.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-10">No tasks in this project</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {task.assignedTo ? `Assigned to ${task.assignedTo.name}` : 'Unassigned'}
                    {task.deadline && ` · Due ${format(new Date(task.deadline), 'MMM d, yyyy')}`}
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
