'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { api, Lead, LeadStatus } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

const STATUS_BADGE: Record<LeadStatus, string> = {
  new:            'bg-blue-50 text-blue-700 border-blue-100',
  contacted:      'bg-amber-50 text-amber-700 border-amber-100',
  interested:     'bg-purple-50 text-purple-700 border-purple-100',
  not_interested: 'bg-slate-100 text-slate-600 border-slate-200',
  converted:      'bg-green-50 text-green-700 border-green-100',
  lost:           'bg-red-50 text-red-600 border-red-100',
};

const SOURCE_BADGE: Record<string, string> = {
  linkedin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  twitter: 'bg-sky-50 text-sky-700 border-sky-100',
  instagram: 'bg-pink-50 text-pink-700 border-pink-100',
  facebook: 'bg-blue-50 text-blue-700 border-blue-100',
  web_scrape: 'bg-teal-50 text-teal-700 border-teal-100',
  other: 'bg-slate-50 text-slate-700 border-slate-100',
};

interface Props {
  onLeadClick: (lead: Lead) => void;
  filterEmployee?: string;
  refreshTrigger?: number;
}

export default function TableView({ onLeadClick, filterEmployee, refreshTrigger }: Props) {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '50' };
      if (search)        params.search      = search;
      if (statusFilter)  params.status      = statusFilter;
      if (sourceFilter)  params.source      = sourceFilter;
      if (filterEmployee) params.assigned_to = filterEmployee;

      const data = await api.getLeads(params);
      setLeads(data.leads);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sourceFilter, filterEmployee]);

  useEffect(() => { fetchLeads(); }, [fetchLeads, refreshTrigger]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-150 shadow-sm p-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name, email, company..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="interested">Interested</option>
          <option value="not_interested">Not Interested</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>

        <select
          value={sourceFilter}
          onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
          className="text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <option value="">All Sources</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="web_scrape">Web Scrape</option>
          <option value="other">Other</option>
        </select>

        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg ml-auto">
          {total} leads total
        </span>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
              {['Name', 'Email', 'Company', 'Job Title', 'Source', 'Status', 'Assigned To', 'Created'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xxs font-bold uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-slate-400 font-medium">
                  No leads found. Modify filters or upload some leads.
                </td>
              </tr>
            ) : (
              leads.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap group-hover:text-blue-600 transition-colors">
                    {lead.full_name || '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate">
                    {lead.email || '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-[150px] truncate font-medium">
                    {lead.company || '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-[150px] truncate">
                    {lead.job_title || '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border capitalize ${SOURCE_BADGE[lead.source] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${STATUS_BADGE[lead.status]}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap font-medium">
                    {lead.assigned_to_name ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                          {lead.assigned_to_name.charAt(0).toUpperCase()}
                        </div>
                        {lead.assigned_to_name}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-normal">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-sm text-slate-500">
        <span className="font-medium text-slate-400">
          Showing {leads.length} of {total} leads
        </span>
        <div className="flex gap-2.5">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="px-4 py-2 font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl select-none">
            Page {page}
          </span>
          <button
            disabled={leads.length < 50}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
