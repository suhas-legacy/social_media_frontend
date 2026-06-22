'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LayoutGrid, Table2, Users, LogOut, Shield } from 'lucide-react';

interface Props {
  currentTab: 'kanban' | 'table' | 'employees';
  setTab: (tab: 'kanban' | 'table' | 'employees') => void;
  stats: { total: number; converted: number } | null;
}

export default function Sidebar({ currentTab, setTab, stats }: Props) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 z-30 border-r border-slate-800">
      {/* Brand logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-sm">L</span>
        </div>
        <div>
          <h1 className="font-bold text-white text-md tracking-tight">LeadsBoard</h1>
          <p className="text-xs text-slate-500">CRM & Distribution</p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Views
        </div>
        <button
          onClick={() => setTab('kanban')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'kanban'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
              : 'hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Kanban Board
        </button>

        <button
          onClick={() => setTab('table')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'table'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
              : 'hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <Table2 className="w-4 h-4" />
          Spreadsheet Table
        </button>

        {user?.role === 'admin' && (
          <>
            <div className="px-3 pt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Management
            </div>
            <button
              onClick={() => setTab('employees')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'employees'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Employees Panel
            </button>
          </>
        )}
      </nav>

      {/* Pipeline Summary Stats */}
      {stats && (
        <div className="m-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">My Pipeline</p>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-slate-400">Total Leads</span>
            <span className="text-sm font-semibold text-white">{stats.total}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Converted</span>
            <span className="text-sm font-semibold text-green-400">{stats.converted}</span>
          </div>
        </div>
      )}

      {/* User profile section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 font-semibold border border-slate-700">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
              {user?.role === 'admin' && <Shield className="w-3 h-3 text-blue-400" />}
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
