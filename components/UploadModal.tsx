'use client';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Upload, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Employee { id: string; name: string; email: string; }
interface Props { onClose: () => void; onSuccess: () => void; }

export default function UploadModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [employees, setEmployees]         = useState<Employee[]>([]);
  const [selectedEmployees, setSelected]  = useState<string[]>([]);
  const [file, setFile]                   = useState<File | null>(null);
  const [source, setSource]               = useState('other');
  const [loading, setLoading]             = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.getEmployees().then(({ employees }) => {
        // Only active employees
        setEmployees(employees.filter(e => e.is_active !== false) as any);
      }).catch(() => {});
    }
  }, [user]);

  function toggleEmployee(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  }

  function selectAll()   { setSelected(employees.map(e => e.id)); }
  function selectNone()  { setSelected([]); }

  async function handleSubmit() {
    if (!file) return toast.error('Please select a file');
    if (user?.role === 'admin' && !selectedEmployees.length) {
      return toast.error('Select at least one employee to assign leads');
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('source_platform', source);
      if (user?.role === 'admin') {
        fd.append('employee_ids', JSON.stringify(selectedEmployees));
        fd.append('assign_equally', 'true');
      }

      const result = await api.uploadLeads(fd) as any;
      if (user?.role === 'admin') {
        toast.success(`${result.total} leads uploaded and distributed!`);
      } else {
        toast.success(`${result.total} leads uploaded successfully!`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload leads');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-800">Upload Leads Batch</h2>
            <p className="text-xs text-slate-400 mt-0.5">Parse CSV/JSON and distribute to employees</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Source Platform */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lead Source Platform</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="web_scrape">Web Scrape</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">File Upload (CSV or JSON)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-colors group"
            >
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
              {file ? (
                <div>
                  <p className="text-sm font-semibold text-blue-600 truncate">{file.name}</p>
                  <p className="text-xxs text-slate-400 mt-1 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-600">Click to select CSV or JSON</p>
                  <p className="text-xxs text-slate-400 mt-1">Preserves original raw data payload in DB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Employee Selection */}
          {user?.role === 'admin' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  Assign To Employees (divided equally)
                </label>
                <div className="flex gap-2">
                  <button onClick={selectAll}  className="text-xxs font-bold text-blue-600 hover:underline cursor-pointer">Select All</button>
                  <span className="text-slate-300 text-xxs">|</span>
                  <button onClick={selectNone} className="text-xxs font-bold text-slate-400 hover:underline cursor-pointer">Clear</button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto bg-slate-50/50">
                {employees.map(emp => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="rounded text-blue-600 border-slate-300 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700 truncate">{emp.name}</p>
                      <p className="text-xxs text-slate-400 truncate">{emp.email}</p>
                    </div>
                  </label>
                ))}
                {employees.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">No active employees found. Create active employees first.</p>
                )}
              </div>

              {selectedEmployees.length > 0 && (
                <p className="text-xxs font-semibold text-slate-400 mt-2">
                  {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''} selected. Leads will be distributed evenly.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-150 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !file || (user?.role === 'admin' && !selectedEmployees.length)}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? 'Uploading...' : user?.role === 'admin' ? 'Upload & Assign' : 'Upload Leads'}
          </button>
        </div>
      </div>
    </div>
  );
}
