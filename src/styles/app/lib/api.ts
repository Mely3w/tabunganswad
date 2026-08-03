export type AuthUser = {
  id: number;
  name: string;
  username: string;
  role: "student" | "admin";
  className: string | null;
  active: boolean;
};

const TOKEN_KEY = "tabungan-swad-token";

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Permintaan ke server gagal.");
  return body as T;
}

export async function login(username: string, password: string, role: AuthUser["role"]) {
  const response = await request<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  });
  window.localStorage.setItem(TOKEN_KEY, response.token);
  return response.user;
}

export async function getCurrentUser() {
  return request<{ user: AuthUser }>("/api/auth/me");
}

export function logout() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export type AdminSummary = { totalBalance: number; activeStudents: number; pendingAccounts: number; pendingTransactions: number };
export type AdminStudent = { id: number; name: string; nis: string; className: string; active: boolean; balance: number; accountNumber: string };
export type AdminTransaction = { id: number; student: string; amount: number; type: "in" | "out"; category: string; note: string | null; status: "pending" | "completed" | "rejected"; created_at: string };

export const getAdminDashboard = () => request<AdminSummary>("/api/admin/dashboard");
export const getAdminStudents = () => request<{ students: AdminStudent[] }>("/api/admin/students");
export const getAdminTransactions = () => request<{ transactions: AdminTransaction[] }>("/api/admin/transactions");
export const setStudentStatus = (id: number, active: boolean) => request<{ message: string }>(`/api/admin/students/${id}/status`, { method: "PATCH", body: JSON.stringify({ active }) });
export const approveTransaction = (id: number) => request<{ message: string }>(`/api/admin/transactions/${id}/approve`, { method: "PATCH" });
