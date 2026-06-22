'use client';
import React, { useEffect, useState } from 'react';
import { api, KanbanColumn, Lead, LeadStatus } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  new:            { label: 'New',           color: 'text-blue-700',   bg: 'bg-blue-50/50', border: 'border-blue-200' },
  contacted:      { label: 'Contacted',     color: 'text-amber-700',  bg: 'bg-amber-50/50', border: 'border-amber-200' },
  interested:     { label: 'Interested',    color: 'text-purple-700', bg: 'bg-purple-50/50', border: 'border-purple-200' },
  not_interested: { label: 'Not Interested',color: 'text-slate-600',  bg: 'bg-slate-100/50', border: 'border-slate-200' },
  converted:      { label: 'Converted',     color: 'text-green-700',  bg: 'bg-green-50/50', border: 'border-green-200' },
  lost:           { label: 'Lost',          color: 'text-red-700',    bg: 'bg-red-50/50', border: 'border-red-200' },
};

const SOURCE_ICONS: Record<string, string> = {
  linkedin: '💼', twitter: '🐦', instagram: '📸',
  facebook: '👥', web_scrape: '🌐', other: '📌',
};

interface Props {
  filterEmployee?: string;
  onLeadClick: (lead: Lead) => void;
  refreshTrigger?: number;
}

export default function KanbanBoard({ filterEmployee, onLeadClick, refreshTrigger }: Props) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<Lead | null>(null);

  useEffect(() => { fetchBoard(); }, [filterEmployee, refreshTrigger]);

  async function fetchBoard() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterEmployee) params.assigned_to = filterEmployee;
      const { columns } = await api.getKanban(params);
      setColumns(columns);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDrop(targetStatus: LeadStatus) {
    if (!dragging || dragging.status === targetStatus) return;
    try {
      await api.updateStatus(dragging.id, targetStatus);
      toast.success(`Moved to ${STATUS_CONFIG[targetStatus].label}`);
      fetchBoard();
    } catch (err: any) {
      toast.error(err.message);
    }
    setDragging(null);
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-72 flex-shrink-0 bg-slate-200/50 rounded-2xl h-[500px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)] items-start">
      {columns.map(col => {
        const cfg = STATUS_CONFIG[col.status as LeadStatus];
        return (
          <div
            key={col.status}
            className={`w-72 flex-shrink-0 rounded-2xl border ${cfg.border} ${cfg.bg} flex flex-col max-h-[calc(100vh-160px)] shadow-sm`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.status as LeadStatus)}
          >
            {/* Column Header */}
            <div className={`p-4 border-b ${cfg.border} flex items-center justify-between`}>
              <span className={`font-bold text-sm tracking-tight ${cfg.color}`}>{cfg.label}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border shadow-sm text-slate-700">
                {col.count}
              </span>
            </div>

            {/* Cards list */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px]">
              {col.leads.map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragging(lead)}
                  onDragEnd={() => setDragging(null)}
                  onClick={() => onLeadClick(lead)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 cursor-grab hover:shadow-md hover:border-slate-200 transition-all duration-200 active:opacity-60 active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {lead.full_name || 'Unknown'}
                      </p>
                      {lead.company && (
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{lead.company}</p>
                      )}
                    </div>
                    <span className="text-base flex-shrink-0" title={lead.source}>
                      {SOURCE_ICONS[lead.source] || '📌'}
                    </span>
                  </div>

                  {lead.job_title && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{lead.job_title}</p>
                  )}

                  {lead.email && (
                    <p className="text-xs text-blue-500 mt-1.5 truncate">{lead.email}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <div className="flex gap-1.5">
                      {lead.priority > 0 && (
                        <span className={`text-xxs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          lead.priority === 2 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {lead.priority === 2 ? 'Urgent' : 'High'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {lead.note_count !== undefined && lead.note_count > 0 && (
                        <span className="text-xxs font-medium text-slate-400 flex items-center gap-1">
                          💬 {lead.note_count}
                        </span>
                      )}
                    </div>
                  </div>

                  {lead.assigned_to_name && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        {lead.assigned_to_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 truncate">
                        {lead.assigned_to_name}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {col.leads.length === 0 && (
                <div className="text-center py-10 text-slate-400/80 text-xs select-none border-2 border-dashed border-slate-200/50 rounded-xl">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
