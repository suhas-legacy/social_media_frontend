'use client';
import React, { useEffect, useState } from 'react';
import { api, Lead, LeadDetail, User } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { X, Calendar, Phone, Mail, Globe, MapPin, Briefcase, Plus, Eye, EyeOff } from 'lucide-react';

interface Props {
  leadId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function LeadDetailModal({ leadId, onClose, onUpdate }: Props) {
  const { user: currentUser } = useAuth();
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    fetchDetail();
    if (currentUser?.role === 'admin') {
      api.getEmployees().then(({ employees }) => {
        setEmployees(employees.filter(e => e.is_active !== false) as any);
      }).catch(() => {});
    }
  }, [leadId]);

  async function fetchDetail() {
    setLoading(true);
    try {
      const data = await api.getLead(leadId);
      setDetail(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load lead details');
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    try {
      await api.addNote(leadId, newNote);
      toast.success('Note added');
      setNewNote('');
      fetchDetail(); // Refresh notes list
      onUpdate();    // Update note count in dashboard
    } catch (err: any) {
      toast.error(err.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  }

  async function handleAssign(employeeId: string) {
    try {
      await api.assignLead(leadId, employeeId || null);
      toast.success('Lead assignment updated');
      fetchDetail();
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign lead');
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await api.updateStatus(leadId, status);
      toast.success('Status updated');
      fetchDetail();
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  }

  if (loading || !detail) {
    return (
      <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-4xl h-[600px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Fetching details...</p>
          </div>
        </div>
      </div>
    );
  }

  const { lead, notes, history } = detail;

  return (
    <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shadow-sm">
              {lead.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">{lead.full_name || 'Unknown Lead'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{lead.job_title ? `${lead.job_title} at ` : ''}{lead.company || 'Unknown Company'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Details & Metadata */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-650">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {lead.email ? <a href={`mailto:${lead.email}`} className="hover:underline text-blue-600 font-medium">{lead.email}</a> : <span className="text-slate-400">No email</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-650">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {lead.phone ? <span className="font-semibold text-slate-700">{lead.phone}</span> : <span className="text-slate-400">No phone</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-650">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {lead.location ? <span className="font-semibold text-slate-700">{lead.location}</span> : <span className="text-slate-400">No location</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-650">
                  <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {lead.website ? <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 font-medium truncate">{lead.website}</a> : <span className="text-slate-400">No website</span>}
                </div>
                {lead.linkedin_url && (
                  <div className="flex items-center gap-3 text-sm text-slate-650">
                    <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 font-medium truncate">{lead.linkedin_url}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Priority Selection */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lead Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={lead.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-705 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {currentUser?.role === 'admin' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">Assignee</label>
                    <select
                      value={lead.assigned_to || ''}
                      onChange={e => handleAssign(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-705 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Source Meta Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap gap-4 text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Source</p>
                <p className="font-semibold text-slate-700 mt-0.5 capitalize">{lead.source}</p>
              </div>
              {lead.apify_run_id && (
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Apify Run ID</p>
                  <p className="font-mono text-slate-600 mt-0.5">{lead.apify_run_id}</p>
                </div>
              )}
              <div>
                <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Created At</p>
                <p className="font-semibold text-slate-700 mt-0.5">{new Date(lead.created_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Raw data view toggle */}
            <div>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {showRaw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showRaw ? 'Hide Raw Apify Data' : 'View Raw Apify Data'}
              </button>
              {showRaw && (
                <pre className="mt-3 p-4 rounded-xl bg-slate-950 text-emerald-450 text-xxs font-mono overflow-auto max-h-48 border border-slate-900 shadow-inner">
                  {JSON.stringify(lead.raw_data, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Column 2: Notes & Activities log */}
          <div className="flex flex-col space-y-6 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8">
            {/* Notes Section */}
            <div className="flex-1 flex flex-col min-h-[250px]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Activity Notes</h3>
              
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add details, call logs, next steps..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingNote || !newNote.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Notes list */}
              <div className="flex-1 overflow-y-auto max-h-48 space-y-3 pr-1 bg-slate-50/30 border border-slate-100 rounded-xl p-3">
                {notes.length === 0 ? (
                  <p className="text-center text-xs text-slate-400/80 py-8 font-medium">No notes added yet</p>
                ) : (
                  notes.map(n => (
                    <div key={n.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-xxs">
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-700">{n.author_name}</span>
                        <span className="text-[9px] font-medium text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-650 font-medium leading-relaxed break-words">{n.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* History Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status Transitions</h3>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No status updates logged</p>
                ) : (
                  history.map(h => (
                    <div key={h.id} className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{new Date(h.changed_at).toLocaleDateString()}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600 font-bold">{h.changed_by_name || 'System'}</span>
                      <span>moved lead from</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold capitalize">{h.from_status ? h.from_status.replace('_', ' ') : 'None'}</span>
                      <span>→</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold capitalize">{h.to_status.replace('_', ' ')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
