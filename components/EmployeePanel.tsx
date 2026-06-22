'use client';
import React, { useEffect, useState } from 'react';
import { api, User } from '@/lib/api';
import toast from 'react-hot-toast';
import { UserPlus, Mail, User as UserIcon, Lock, CheckCircle, XCircle } from 'lucide-react';

interface Employee extends User {
  is_active: boolean;
  total_assigned: number;
  new_count: number;
  contacted_count: number;
  converted_count: number;
}

export default function EmployeePanel() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const data = await api.getEmployees();
      setEmployees(data.employees as any);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      const res = await api.toggleEmployee(id) as any;
      toast.success(`${res.employee.name} is now ${res.employee.is_active ? 'active' : 'inactive'}`);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle employee status');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      return toast.error('Please fill in all fields');
    }

    setCreating(true);
    try {
      await api.createEmployee({ name, email, password });
      toast.success('Employee created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Create Employee Form */}
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-md">Add New Employee</h3>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>

      {/* Employees List */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm h-full flex flex-col">
        <h3 className="font-bold text-slate-800 text-md mb-6">Employees Directory</h3>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">No employees found. Create one using the form.</div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[500px]">
            {employees.map(emp => (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Employee details */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                      {emp.name}
                      {emp.is_active ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{emp.email}</p>
                  </div>
                </div>

                {/* Lead stats */}
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                  <div className="text-center px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned</p>
                    <p className="text-sm font-bold text-slate-700">{emp.total_assigned || 0}</p>
                  </div>
                  <div className="text-center px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">New</p>
                    <p className="text-sm font-bold text-blue-700">{emp.new_count || 0}</p>
                  </div>
                  <div className="text-center px-3 py-1 bg-green-50/50 border border-green-100 rounded-lg">
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Won</p>
                    <p className="text-sm font-bold text-green-700">{emp.converted_count || 0}</p>
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => handleToggle(emp.id)}
                    className={`ml-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      emp.is_active
                        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                    }`}
                  >
                    {emp.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
