import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import type { Lead, LeadsResponse } from '../types';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, Download, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', source: 'Website' as const, status: 'New' as const });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<LeadsResponse>('/leads', {
        params: { search: searchTerm, status, source, page, limit: 10 }
      });
      setLeads(response.data.leads);
      setTotalPages(response.data.metadata.totalPages);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, status, source, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      setIsModalOpen(false);
      setEditingLead(null);
      setFormData({ name: '', email: '', source: 'Website', status: 'New' });
      fetchLeads();
    } catch (err) {
      console.error('Error saving lead:', err);
      alert('Failed to save lead');
    }
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({ name: lead.name, email: lead.email, source: lead.source, status: lead.status });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingLead(null);
    setFormData({ name: '', email: '', source: 'Website', status: 'New' });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeads();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, status, source, page, fetchLeads]);

  const handleExport = async () => {
    try {
      const response = await api.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      alert('Only admins can delete leads');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-indigo-100 text-indigo-700 dark:bg-teal-900/30 dark:text-teal-400';
      case 'Contacted': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Qualified': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Lost': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">The Dashboard</h2>
          <p className="text-indigo-600 dark:text-teal-500 font-bold uppercase tracking-widest text-[10px] mt-2">Managing your success</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-[#131A2B] border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 shadow-sm"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-3 px-8 py-3 bg-indigo-600 dark:bg-teal-500 text-white dark:text-slate-900 rounded-2xl hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 dark:shadow-teal-500/20"
          >
            <Plus size={20} />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-[#131A2B] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">
              {editingLead ? 'Update Lead' : 'New Lead'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter lead name..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-500 transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Source</label>
                <select 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-500 transition-all appearance-none cursor-pointer"
                  value={formData.source}
                  onChange={e => setFormData({...formData, source: e.target.value as any})}
                >
                  <option value="Website">Website</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
              {editingLead && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Status</label>
                  <select 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-500 transition-all appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              )}
              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 dark:bg-teal-500 text-white dark:text-slate-900 rounded-2xl hover:bg-indigo-700 dark:hover:bg-teal-400 transition-all font-bold shadow-lg shadow-indigo-500/20 dark:shadow-teal-500/20"
                >
                  {editingLead ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white dark:bg-[#131A2B] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-teal-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-indigo-400 dark:focus:border-teal-500 outline-none transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-400 dark:focus:border-teal-500 transition-all cursor-pointer font-bold text-slate-700 dark:text-slate-300"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
        <select
          className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-400 dark:focus:border-teal-500 transition-all cursor-pointer font-bold text-slate-700 dark:text-slate-300"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Instagram">Instagram</option>
          <option value="Referral">Referral</option>
        </select>
        <div className="flex items-center justify-center md:justify-end text-[10px] font-black text-indigo-600 dark:text-teal-500 uppercase tracking-widest">
          <Filter size={14} className="mr-2" />
          <span>Filters Active</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#131A2B] rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                <th className="px-10 py-7">Lead Name</th>
                <th className="px-10 py-7">Contact</th>
                <th className="px-10 py-7">Status</th>
                <th className="px-10 py-7">Source</th>
                <th className="px-10 py-7">Joined</th>
                <th className="px-10 py-7 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center text-slate-400 dark:text-slate-600 italic font-medium">Curating your leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center text-slate-400 dark:text-slate-600 italic font-medium">No results found today</td>
                </tr>
              ) : leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-10 py-6 font-black text-slate-900 dark:text-slate-50">{lead.name}</td>
                  <td className="px-10 py-6 text-slate-600 dark:text-slate-400 font-bold text-sm">{lead.email}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-slate-600 dark:text-slate-400 font-bold text-sm uppercase tracking-tighter">{lead.source}</td>
                  <td className="px-10 py-6 text-slate-400 dark:text-slate-600 text-[11px] font-black uppercase tracking-widest">
                    {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => openEditModal(lead)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg shadow-sm transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg shadow-sm transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#131A2B]">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Page {page} / {totalPages}</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-3 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm text-slate-500 dark:text-slate-400"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-3 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm text-slate-500 dark:text-slate-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
