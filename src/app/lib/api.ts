export type AuthUser = {
  id: number;
  name: string;
  username: string;
  role: "student" | "admin";
  className: string | null;
  active: boolean;
  accountNumber?: string;
};

export type StudentAccount = {
  accountNumber: string;
  balance: number;
  updatedAt: string;
  name: string;
  className: string | null;
};

export type StudentTransaction = {
  id: number;
  amount: number;
  type: "in" | "out";
  category: string;
  note: string | null;
  status: "pending" | "completed" | "rejected";
  created_at: string;
};

export type StudentContact = {
  id: number;
  name: string;
  accountNumber: string;
  className: string | null;
};

const TOKEN_KEY = "tabungan-swad-token";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, "")
  : "http://localhost:3001";

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken()
        ? {
            Authorization: `Bearer ${getToken()}`,
          }
        : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "Permintaan ke server gagal.");
  }

  return body as T;
}

/* =========================
   AUTH
========================= */

export async function login(
  username: string,
  password: string,
  role: AuthUser["role"],
) {
  const response = await request<{
    token: string;
    user: AuthUser;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
      role,
    }),
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

/* =========================
   SISWA
========================= */

export async function getStudentAccount() {
  return request<{ account: StudentAccount }>(
    "/api/student/account",
  );
}

export async function getStudentTransactions() {
  return request<{
    transactions: StudentTransaction[];
  }>("/api/student/transactions");
}

export async function getStudentContacts() {
  return request<{
    contacts: StudentContact[];
  }>("/api/student/contacts");
}

/* =========================
   TRANSAKSI SISWA
========================= */

export async function createDeposit(amount: number, note = "") {
  return request<{
    message: string;
    balance: number;
    transaction: StudentTransaction;
  }>("/api/student/deposit", {
    method: "POST",
    body: JSON.stringify({
      amount,
      note,
    }),
  });
}

export async function createPayment(
  amount: number,
  category: string,
  note = "",
) {
  return request<{
    message: string;
    balance: number;
    transaction: StudentTransaction;
  }>("/api/student/payment", {
    method: "POST",
    body: JSON.stringify({
      amount,
      category,
      note,
    }),
  });
}

export async function createTransfer(
  accountNumber: string,
  amount: number,
  note = "",
) {
  return request<{
    message: string;
    balance: number;
    recipient: {
      name: string;
      accountNumber: string;
    };
    transaction: StudentTransaction;
  }>("/api/student/transfer", {
    method: "POST",
    body: JSON.stringify({
      accountNumber,
      amount,
      note,
    }),
  });
}

/* =========================
   ADMIN
========================= */

export type AdminSummary = {
  totalBalance: number;
  activeStudents: number;
  pendingAccounts: number;
  pendingTransactions: number;
};

export type AdminStudent = {
  id: number;
  name: string;
  nis: string;
  className: string;
  active: boolean;
  balance: number;
  accountNumber: string;
};

export type AdminTransaction = {
  id: number;
  student: string;
  amount: number;
  type: "in" | "out";
  category: string;
  note: string | null;
  status: "pending" | "completed" | "rejected";
  created_at: string;
};

export const getAdminDashboard = () =>
  request<AdminSummary>("/api/admin/dashboard");

export const getAdminStudents = () =>
  request<{ students: AdminStudent[] }>("/api/admin/students");

export const getAdminTransactions = () =>
  request<{ transactions: AdminTransaction[] }>(
    "/api/admin/transactions",
  );

export const setStudentStatus = (
  id: number,
  active: boolean,
) =>
  request<{ message: string }>(
    `/api/admin/students/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ active }),
    },
  );

export const approveTransaction = (id: number) =>
  request<{ message: string }>(
    `/api/admin/transactions/${id}/approve`,
    {
      method: "PATCH",
    },
  );

export const addStudent = (data: {
  name: string;
  username: string;
  className: string;
  password: string;
}) =>
  request<{ message: string }>(
    "/api/admin/students",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

export async function importStudents(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/import-students`,
    {
      method: "POST",
      headers: {
        ...(getToken()
          ? {
              Authorization: `Bearer ${getToken()}`,
            }
          : {}),
      },
      body: formData,
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "Import siswa gagal.");
  }

  return body;
}
