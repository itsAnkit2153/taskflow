import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const statusOptions = ['pending', 'in_progress', 'completed'];
const priorityOptions = ['low', 'medium', 'high'];

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const emptyForm = { title: '', description: '', status: 'pending', priority: 'medium', deadline: '', assignedTo: '', project: '', tags: '' };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ search: '', status: '', project: '', priority: '' });

  const buildQuery = () => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString();
  };

  const fetchTasks = useCallback(() =>
    api.get(`/tasks?${buildQuery()}`).then((r) => setTasks(r.data.tasks)), [filters]);

  useEffect(() => {
    Promise.all([
      fetchTasks(),
      api.get('/projects').then((r) => setProjects(r.data.projects)),
      user.role === 'admin' ? api.get('/users').then((r) => setUsers(r.data.users)) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [filters]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, status: t.status, priority: t.priority,
      deadline: t.deadline ? format(new Date(t.deadline), 'yyyy-MM-dd') : '',
      assignedTo: t.assignedTo?._id || '', project: t.project?._id || '', tags: (t.tags || []).join(', ') });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map((s) => s.trim()) : [] };
    try {
      if (editing) {
        if (user.role === 'member') {
          await api.put(`/tasks/${editing._id}`, { status: form.status });
        } else {
          await api.put(`/tasks/${editing._id}`, payload);
        }
        toast.success('Task updated');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created');
      }
      await fetchTasks();
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${id}`); toast.success('Task deleted'); fetchTasks(); }
    catch { toast.error('Failed to delete'); }
  };

  const quickStatus = async (task, status) => {
    try { await api.put(`/tasks/${task._id}`, { status }); fetchTasks(); }
    catch { toast.error('Failed to update'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{tasks.length} task{tasks.length !== 1 && 's'}</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors">
            <PlusIcon className="w-4 h-4" /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-slate-200 dark:border-slate-600 rounded-lg px-3">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input placeholder="Search tasks…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full py-2 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Priority</option>
          {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <ClipboardDocumentListIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No tasks found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
          {tasks.map((task) => {
            const overdue = task.deadline && !task.isOverdue === false && isPast(new Date(task.deadline)) && task.status !== 'completed';
            return (
              <div key={task._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 dark:text-white text-sm">{task.title}</span>
                    {task.project && (
                      <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: task.project.color }}>{task.project.title}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {task.assignedTo && <span>→ {task.assignedTo.name}</span>}
                    {task.deadline && (
                      <span className={overdue ? 'text-red-500 font-medium' : ''}>
                        {overdue ? '⚠ ' : ''}Due {format(new Date(task.deadline), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                  <select value={task.status}
                    onChange={(e) => quickStatus(task, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${statusColors[task.status]}`}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <button onClick={() => openEdit(task)} className="p-1 text-slate-400 hover:text-brand-500 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                  {user.role === 'admin' && <button onClick={() => handleDelete(task._id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">{editing ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={user.role === 'member'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition">
                  {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              {user.role === 'admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                      <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition">
                        {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Deadline</label>
                      <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project *</label>
                    <select required value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition">
                      <option value="">Select project</option>
                      {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign to</label>
                    <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition">
                      <option value="">Unassigned</option>
                      {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tags (comma separated)</label>
                    <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="frontend, bug, urgent"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition" />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors">
                  {editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
