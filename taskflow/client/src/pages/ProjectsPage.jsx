import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { PlusIcon, FolderIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#14b8a6'];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', members: [], color: COLORS[0] });

  const fetchProjects = () => api.get('/projects').then((r) => setProjects(r.data.projects));

  useEffect(() => {
    Promise.all([
      fetchProjects(),
      user.role === 'admin' ? api.get('/users').then((r) => setUsers(r.data.users)) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', members: [], color: COLORS[0] }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ title: p.title, description: p.description, members: p.members.map((m) => m._id), color: p.color }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/projects/${editing._id}`, form);
        toast.success('Project updated');
      } else {
        await api.post('/projects', form);
        toast.success('Project created');
      }
      await fetchProjects();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{projects.length} project{projects.length !== 1 && 's'}</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors">
            <PlusIcon className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <FolderIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No projects yet</p>
          {user.role === 'admin' && <button onClick={openCreate} className="mt-4 text-brand-500 hover:underline text-sm">Create your first project</button>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-1.5" style={{ backgroundColor: p.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <Link to={`/projects/${p._id}`} className="font-semibold text-slate-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-1">{p.title}</Link>
                  {user.role === 'admin' && (
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button onClick={() => openEdit(p)} className="p-1 text-slate-400 hover:text-brand-500 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{p.description || 'No description'}</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {p.members.slice(0, 4).map((m) => (
                      <div key={m._id} className="w-7 h-7 rounded-full bg-brand-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold">
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{p.members.length} member{p.members.length !== 1 && 's'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">{editing ? 'Edit Project' : 'New Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              {user.role === 'admin' && users.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Members</label>
                  <div className="max-h-32 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-600 rounded-lg p-2">
                    {users.filter((u) => u.role === 'member').map((u) => (
                      <label key={u._id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                        <input type="checkbox" checked={form.members.includes(u._id)}
                          onChange={(e) => setForm({ ...form, members: e.target.checked ? [...form.members, u._id] : form.members.filter((id) => id !== u._id) })}
                          className="rounded" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{u.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
