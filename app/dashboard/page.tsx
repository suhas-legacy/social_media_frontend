'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import KanbanBoard from '@/components/KanbanBoard';
import TableView from '@/components/TableView';
import UploadModal from '@/components/UploadModal';
import LeadDetailModal from '@/components/LeadDetailModal';
import EmployeePanel from '@/components/EmployeePanel';
import { api, StatsResponse, Lead } from '@/lib/api';
import { RefreshCw, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'employees'>('kanban');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.getStats().then(setStats).catch(() => {});
    }
  }, [refreshKey, user]);

  function refresh() {
    setRefreshKey(k => k + 1);
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Authorizing...</p>
        </div>
      </div>
    );
  }

  // Map stats object to sidebar stats
  const sidebarStats = stats ? { total: stats.total, converted: stats.stats.converted } : null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar navigation */}
      <Sidebar currentTab={activeTab} setTab={setActiveTab} stats={sidebarStats} />

      {/* Main dashboard content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              {activeTab === 'kanban' && 'Kanban Pipeline'}
              {activeTab === 'table' && 'Leads Database'}
              {activeTab === 'employees' && 'Employee Directory'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'kanban' && 'Drag and drop leads to update statuses'}
              {activeTab === 'table' && 'Search and filter full metadata parameters'}
              {activeTab === 'employees' && 'Track employee stats and manage accounts'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all cursor-pointer shadow-sm bg-white"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload Leads
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-8 overflow-y-auto min-h-0 bg-transparent text-foreground">
          {activeTab === 'kanban' && (
            <KanbanBoard
              key={refreshKey}
              onLeadClick={setSelectedLead}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'table' && (
            <TableView
              key={refreshKey}
              onLeadClick={setSelectedLead}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'employees' && user.role === 'admin' && (
            <EmployeePanel key={refreshKey} />
          )}
        </div>
      </div>

      {/* Upload batch modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={refresh}
        />
      )}

      {/* Lead details detail slide-over modal */}
      {selectedLead && (
        <LeadDetailModal
          leadId={selectedLead.id}
          onClose={() => setSelectedLead(null)}
          onUpdate={refresh}
        />
      )}
    </div>
  );
}
