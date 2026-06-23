const BASE = process.env.NEXT_PUBLIC_API_URL!;

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('leads_token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Something went wrong');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('POST', '/auth/login', { email, password }),
  me: () => request<{ user: User }>('GET', '/auth/me'),

  // Leads
  getLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<LeadsResponse>('GET', `/leads${qs}`);
  },
  getLead: (id: string) => request<LeadDetail>('GET', `/leads/${id}`),
  updateLead: (id: string, data: Partial<Lead>) =>
    request('PATCH', `/leads/${id}`, data),
  updateStatus: (id: string, status: string) =>
    request('PATCH', `/leads/${id}/status`, { status }),
  addNote: (id: string, note: string) =>
    request('POST', `/leads/${id}/notes`, { note }),
  assignLead: (id: string, employee_id: string | null) =>
    request('PATCH', `/leads/${id}/assign`, { employee_id }),

  // Kanban
  getKanban: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<KanbanResponse>('GET', `/kanban${qs}`);
  },
  getStats: () => request<StatsResponse>('GET', '/kanban/stats'),

  // Employees (admin)
  getEmployees: () => request<EmployeesResponse>('GET', '/employees'),
  createEmployee: (data: { name: string; email: string; password: string }) =>
    request('POST', '/employees', data),
  toggleEmployee: (id: string) => request('PATCH', `/employees/${id}/toggle`, {}),

  // Upload
  uploadLeads: (formData: FormData) =>
    request('POST', '/leads/upload', formData, true),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted' | 'lost';
export type LeadSource = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'web_scrape' | 'other';

export interface User {
  id: string; name: string; email: string; role: 'admin' | 'employee'; is_active?: boolean;
}

export interface Lead {
  id: string; full_name: string; email: string; phone: string;
  company: string; job_title: string; location: string;
  website: string; linkedin_url: string; profile_image: string;
  source: LeadSource; status: LeadStatus; priority: number;
  tags: string[]; assigned_to: string; assigned_to_name: string;
  source_url?: string; apify_run_id?: string; raw_data?: any;
  note_count?: number; created_at: string; updated_at?: string;
  contacted_at: string | null; converted_at?: string | null;
}

export interface LeadDetail {
  lead: Lead;
  notes: Array<{ id: string; note: string; author_name: string; created_at: string }>;
  history: Array<{ id: string; from_status: string; to_status: string; changed_by_name: string; changed_at: string }>;
}

export interface KanbanColumn { status: LeadStatus; leads: Lead[]; count: number; }
export interface KanbanResponse { columns: KanbanColumn[]; }
export interface LeadsResponse  { leads: Lead[]; total: number; page: number; pages: number; }
export interface StatsResponse  { stats: Record<LeadStatus, number>; total: number; }
export interface EmployeesResponse { employees: Array<User & { total_assigned: number; new_count: number; contacted_count: number; converted_count: number }> }
