import React, { useEffect, useState } from "react";
import logoBankMini from "../../logo-bank-mini.png";
import HistoryScreen from "./components/HistoryScreen";
import { 
  approveTransaction, 
  getAdminDashboard, 
  getAdminStudents, 
  getAdminTransactions, 
  login, 
  logout, 
  setStudentStatus, 
  addStudent,
  importStudents,
  getStudentAccount, 
  getStudentTransactions,
  createDeposit,
  createPayment,
  type AuthUser
} from "./lib/api";
import {
  Home,
  ArrowLeftRight,
  Clock,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ChevronRight,
  Bell,
  Eye,
  EyeOff,
  Send,
  CreditCard,
  Shield,
  LogOut,
  X,
  Check,
  AlarmClock,
  Flame,
  Star,
  ToggleLeft,
  ArrowUp,
  ToggleRight,
  RefreshCw,
  Users,
  WalletCards,
  ChartNoAxesCombined,
  Search,
  UserCheck,
  ClipboardList,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

type Screen = "home" | "transfer" | "history" | "profile";
type UserRole = "student" | "admin";

type Transaction = {
  id: number;
  name: string;
  type: "in" | "out";
  amount: number;
  date: string;
  category: string;
};

type NewTransaction = Omit<Transaction, "id" | "date">;

const transactions: Transaction[] = [
  { id: 1, name: "Dari Budi Santoso", type: "in", amount: 50000, date: "Hari ini, 10:23", category: "Transfer Masuk" },
  { id: 2, name: "Kantin Sekolah", type: "out", amount: 15000, date: "Hari ini, 08:45", category: "Pembayaran" },
  { id: 3, name: "Dari Ibu Guru Sari", type: "in", amount: 100000, date: "Kemarin, 14:12", category: "Transfer Masuk" },
  { id: 4, name: "Buku & Alat Tulis", type: "out", amount: 32500, date: "Kemarin, 09:30", category: "Pembelian" },
  { id: 5, name: "Dari Ahmad Rizki", type: "in", amount: 25000, date: "Sen, 11:00", category: "Transfer Masuk" },
  { id: 6, name: "Iuran Kelas", type: "out", amount: 20000, date: "Sen, 07:55", category: "Pembayaran" },
  { id: 7, name: "Dari Orang Tua", type: "in", amount: 200000, date: "Ming, 18:00", category: "Top Up" },
  { id: 8, name: "Jajan Siang", type: "out", amount: 12000, date: "Sab, 12:15", category: "Pembelian" },
];

const contacts = [
  { id: 1, name: "Budi Santoso", account: "1023-4567", initial: "BS", color: "#3B82F6" },
  { id: 2, name: "Ahmad Rizki", account: "1045-8901", initial: "AR", color: "#8B5CF6" },
  { id: 3, name: "Siti Nurhaliza", account: "1067-2345", initial: "SN", color: "#EC4899" },
  { id: 4, name: "Dimas Prayoga", account: "1089-6789", initial: "DP", color: "#F59E0B" },
];

const navItems = [
  { id: "home" as Screen, label: "Beranda", icon: Home },
  { id: "transfer" as Screen, label: "Transfer", icon: ArrowLeftRight },
  { id: "history" as Screen, label: "Riwayat", icon: Clock },
  { id: "profile" as Screen, label: "Profil", icon: User },
];

function formatRupiah(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

function Avatar({ initial, color, size = 40 }: { initial: string; color: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.35 }}
    >
      {initial}
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setMessage("Masukkan NIS/NISN atau nomor rekening dan password terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      const user = await login(username, password, role);
      onLogin(user);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tidak dapat masuk. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center p-0 sm:p-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <main className="w-full max-w-[375px] min-h-[100dvh] sm:min-h-0 bg-background rounded-none sm:rounded-[36px] shadow-none sm:shadow-2xl overflow-hidden">
        <div className="px-7 pt-10 pb-8">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-3xl bg-white border border-blue-100 shadow-sm flex items-center justify-center overflow-hidden">
              <img src={logoBankMini} alt="Ilustrasi siswa Tabungan Swad" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: "#2563EB" }}>SMK Swadaya Semarang</p>
            <h1 className="text-2xl font-bold text-foreground mt-2">Mobile Banking</h1>
            <p className="text-sm font-semibold" style={{ color: "#1A3A6B" }}>Tabungan Swad</p>
            <p className="text-xs text-muted-foreground mt-3">{role === "admin" ? "Masuk untuk mengelola Tabungan Swad." : "Masuk untuk melihat tabunganmu."}</p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => { setRole("student"); setMessage(""); }}
              className={`rounded-xl py-2 text-xs font-bold transition-colors ${role === "student" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
            >
              Siswa
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setMessage(""); }}
              className={`rounded-xl py-2 text-xs font-bold transition-colors ${role === "admin" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
            >
              Admin / Petugas
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="text-xs font-semibold text-muted-foreground block mb-2">{role === "admin" ? "ID Petugas" : "Username"}</label>
              <input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(event) => { setUsername(event.target.value); setMessage(""); }}
                placeholder={role === "admin" ? "Masukkan ID petugas" : "NIS/NISN atau nomor rekening"}
                className="w-full rounded-2xl border border-border bg-muted/60 px-4 py-3.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground block mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setMessage(""); }}
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-border bg-muted/60 px-4 py-3.5 pr-12 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {message && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{message}</p>}

            <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-70" style={{ background: "linear-gradient(135deg, #1A3A6B, #2563EB)" }}>
              {isSubmitting ? "Memeriksa akun..." : `Masuk sebagai ${role === "admin" ? "Admin" : "Siswa"}`}
            </button>
          </form>

          <div className="mt-5 text-center space-y-3">
            <button type="button" onClick={() => setMessage("Hubungi petugas Tabungan Swad untuk mengatur ulang password.")} className="text-xs font-semibold" style={{ color: "#2563EB" }}>
              Lupa Password?
            </button>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-2">{role === "admin" ? "Butuh akses petugas?" : "Belum memiliki akun?"}</p>
              <button type="button" onClick={() => setMessage("Silakan hubungi petugas Tabungan Swad untuk daftar atau aktivasi akun.")} className="text-xs font-bold" style={{ color: "#1A3A6B" }}>
                {role === "admin" ? "Hubungi administrator" : "Daftar / Aktivasi Akun"}
              </button>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 px-6 py-3 text-center">
          <p className="text-[10px] text-blue-700">Gunakan akun pribadi. Jangan bagikan password kepada siapa pun.</p>
        </div>
      </main>
    </div>
  );
}

type AdminTab = "ringkasan" | "siswa" | "transaksi";

const studentAccounts = [
  { id: 1, name: "Ahmad Rizki", nis: "1023-4567", className: "XI RPL 1", balance: 875000, status: "Aktif" },
  { id: 2, name: "Siti Nurhaliza", nis: "1045-8901", className: "XI AKL 2", balance: 640000, status: "Aktif" },
  { id: 3, name: "Budi Santoso", nis: "1067-2345", className: "X TJKT 1", balance: 320000, status: "Aktif" },
  { id: 4, name: "Dimas Prayoga", nis: "1089-6789", className: "XII RPL 2", balance: 0, status: "Menunggu" },
];

const adminTransactions = [
  { id: 1, student: "Ahmad Rizki", activity: "Setoran tunai", amount: 100000, time: "Hari ini, 09:15", status: "Selesai", type: "in" },
  { id: 2, student: "Siti Nurhaliza", activity: "Pengajuan penarikan", amount: 50000, time: "Hari ini, 08:42", status: "Perlu ditinjau", type: "out" },
  { id: 3, student: "Budi Santoso", activity: "Pembayaran koperasi", amount: 25000, time: "Kemarin, 12:10", status: "Selesai", type: "out" },
];

function ImportStudentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  const [students, setStudents] = useState<
    {
      name: string;
      nis: string;
      className: string;
      password: string;
    }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setStudents([]);
    setError("");

    try {
      const XLSX = await import("xlsx");

      const buffer = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<
        Record<string, unknown>
      >(worksheet, {
        defval: "",
      });

      const mappedStudents = rows.map((row) => ({
        name: String(
          row["Nama"] ??
            row["nama"] ??
            row["NAMA"] ??
            "",
        ).trim(),

        nis: String(
          row["NIS"] ??
            row["nis"] ??
            row["Nis"] ??
            "",
        ).trim(),

        className: String(
          row["Kelas"] ??
            row["kelas"] ??
            row["Class"] ??
            "",
        ).trim(),

        password: String(
          row["Password"] ??
            row["password"] ??
            "",
        ).trim(),
      }));

      const validStudents = mappedStudents.filter(
        (student) =>
          student.name &&
          student.nis &&
          student.className &&
          student.password,
      );

      if (validStudents.length === 0) {
        setError(
          "Tidak ditemukan data siswa yang valid. Pastikan kolom Excel adalah Nama, NIS, Kelas, dan Password.",
        );
        return;
      }

      setStudents(validStudents);
    } catch (err) {
      console.error(err);

      setError(
        "File Excel tidak dapat dibaca. Gunakan file .xlsx atau .xls yang valid.",
      );
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    if (students.length === 0) {
      setError("Tidak ada data siswa yang dapat diimport.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await importStudents(file);

      onSuccess(
        result.message ||
          `${students.length} siswa berhasil diimport.`,
      );

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Import siswa gagal.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">
              Upload Siswa Massal
            </h2>

            <p className="text-sm text-gray-500">
              Import banyak akun siswa menggunakan file Excel.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Format Excel
            </p>

            <p className="mt-1 text-sm text-blue-700">
              Gunakan kolom berikut:
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Nama",
                "NIS",
                "Kelas",
                "Password",
              ].map((column) => (
                <span
                  key={column}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-blue-700"
                >
                  {column}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pilih File Excel
            </label>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full rounded-xl border border-gray-300 p-3 text-sm"
            />
          </div>

          {file && (
            <div className="rounded-xl border bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">
                File: {file.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {students.length} data siswa ditemukan.
              </p>
            </div>
          )}

          {students.length > 0 && (
            <div className="overflow-hidden rounded-xl border">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">
                        No
                      </th>

                      <th className="p-3 text-left">
                        Nama
                      </th>

                      <th className="p-3 text-left">
                        NIS
                      </th>

                      <th className="p-3 text-left">
                        Kelas
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students
                      .slice(0, 50)
                      .map((student, index) => (
                        <tr
                          key={`${student.nis}-${index}`}
                          className="border-t"
                        >
                          <td className="p-3">
                            {index + 1}
                          </td>

                          <td className="p-3">
                            {student.name}
                          </td>

                          <td className="p-3">
                            {student.nis}
                          </td>

                          <td className="p-3">
                            {student.className}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {students.length > 50 && (
                <p className="border-t p-3 text-xs text-gray-500">
                  Menampilkan 50 data pertama dari{" "}
                  {students.length} siswa.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={loading || students.length === 0}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "Mengimport..."
              : `Import ${students.length} Siswa`}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddStudentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const response = await addStudent({ name, username, className, password });
      onSuccess(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data siswa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Tambah Siswa Baru</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Nama Lengkap</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Misal: Bintang Pradana" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">NIS / Nomor Rekening</label>
            <input required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Misal: 1089-6789" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Kelas</label>
            <input required value={className} onChange={(e) => setClassName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Misal: XII RPL 2" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Password Awal Akun</label>
            <input required type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Buat password (misal: Siswa123!)" />
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isSubmitting ? "Menyimpan..." : "Simpan Siswa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("ringkasan");
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState(studentAccounts);
  const [adminRows, setAdminRows] = useState(adminTransactions);
  const [summary, setSummary] = useState({ totalBalance: 18750000, activeStudents: 3, pendingAccounts: 1, pendingTransactions: 1 });
  const [notice, setNotice] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const visibleAccounts = accounts.filter((student) =>
    `${student.name} ${student.nis} ${student.className}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pendingCount = accounts.filter((student) => student.status === "Menunggu").length;

  const loadAdminData = async () => {
    try {
      const [nextSummary, studentResponse, transactionResponse] = await Promise.all([getAdminDashboard(), getAdminStudents(), getAdminTransactions()]);
      setSummary(nextSummary);
      setAccounts(studentResponse.students.map((student) => ({ ...student, status: student.active ? "Aktif" : "Menunggu" })));
      setAdminRows(transactionResponse.transactions.map((transaction) => ({
        id: transaction.id,
        student: transaction.student,
        activity: transaction.category,
        amount: transaction.amount,
        time: new Date(`${transaction.created_at}Z`).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
        status: transaction.status === "pending" ? "Perlu ditinjau" : transaction.status === "completed" ? "Selesai" : "Ditolak",
        type: transaction.type,
      })));
    } catch (error) {
      if (error instanceof Error) setNotice(error.message);
    }
  };

  useEffect(() => { void loadAdminData(); }, []);

  const activateStudent = async (id: number) => {
    try {
      const response = await setStudentStatus(id, true);
      setAccounts((current) => current.map((student) => student.id === id ? { ...student, status: "Aktif" } : student));
      setSummary((current) => ({ ...current, activeStudents: current.activeStudents + 1, pendingAccounts: Math.max(0, current.pendingAccounts - 1) }));
      setNotice(response.message);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Aktivasi akun gagal.");
    }
  };

  const approvePendingTransaction = async (id: number) => {
    try {
      const response = await approveTransaction(id);
      setAdminRows((current) => current.map((transaction) => transaction.id === id ? { ...transaction, status: "Selesai" } : transaction));
      setSummary((current) => ({ ...current, pendingTransactions: Math.max(0, current.pendingTransactions - 1) }));
      setNotice(response.message);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Persetujuan transaksi gagal.");
    }
  };

  const nav = [
    { id: "ringkasan" as const, label: "Ringkasan", icon: ChartNoAxesCombined },
    { id: "siswa" as const, label: "Siswa", icon: Users },
    { id: "transaksi" as const, label: "Transaksi", icon: ClipboardList },
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="bg-[#12325f] px-5 py-5 text-white shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-blue-200 uppercase">SMK Swadaya Semarang</p>
            <h1 className="mt-1 text-lg font-bold">Panel Petugas Tabungan Swad</h1>
          </div>
          <button onClick={onLogout} className="rounded-xl border border-white/25 px-3 py-2 text-xs font-bold hover:bg-white/10">Keluar</button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 pb-10 sm:px-6">
        <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-white p-1 shadow-sm">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => { setTab(item.id); setNotice(""); }} className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-bold ${tab === item.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>

        {notice && <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Tutup notifikasi"><X size={16} /></button></div>}

        {tab === "ringkasan" && <>
          <div className="mb-5">
            <h2 className="text-xl font-bold">Selamat pagi, Petugas</h2>
            <p className="mt-1 text-sm text-slate-500">Pantau tabungan dan pekerjaan yang perlu ditindaklanjuti.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <AdminMetric icon={WalletCards} label="Total saldo siswa" value={formatRupiah(summary.totalBalance)} tone="blue" />
            <AdminMetric icon={Users} label="Akun aktif" value={`${summary.activeStudents} siswa`} tone="violet" />
            <AdminMetric icon={CircleDollarSign} label="Menunggu persetujuan" value={`${summary.pendingAccounts + summary.pendingTransactions} permintaan`} tone="amber" />
          </div>
          <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><div><h3 className="font-bold">Tindakan diperlukan</h3><p className="mt-1 text-xs text-slate-500">Permintaan yang menunggu verifikasi petugas.</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">{summary.pendingAccounts + summary.pendingTransactions} baru</span></div>
            <div className="mt-4 divide-y divide-slate-100">
              {summary.pendingTransactions > 0 && <div className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-bold">Pengajuan penarikan siswa</p><p className="mt-1 text-xs text-slate-500">Menunggu persetujuan petugas</p></div><button onClick={() => { setTab("transaksi"); setNotice("Silakan tinjau dan verifikasi transaksi."); }} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Tinjau</button></div>}
              {summary.pendingAccounts > 0 && <div className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-bold">Aktivasi akun siswa</p><p className="mt-1 text-xs text-slate-500">Pendaftaran baru menunggu verifikasi</p></div><button onClick={() => { setTab("siswa"); setQuery("Dimas"); }} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Buka akun</button></div>}
            </div>
          </section>
        </>}

        {tab === "siswa" && (
          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-lg font-bold">Data siswa</h2>
    <p className="mt-1 text-xs text-slate-500">
      Kelola akun dan status tabungan siswa.
    </p>
  </div>

  <div className="flex flex-col gap-2 sm:flex-row">
    <button
      onClick={() => setIsImportOpen(true)}
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
    >
      ↑ Upload Excel
    </button>

    <button
      onClick={() => setIsAddOpen(true)}
      className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 shadow-sm"
    >
      + Tambah siswa
    </button>
  </div>
</div>
            <div className="relative mt-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input 
                value={query} 
                onChange={(event) => setQuery(event.target.value)} 
                placeholder="Cari nama, NIS, atau kelas" 
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
              />
            </div>
            
            <div className="mt-4 divide-y divide-slate-100">
              {visibleAccounts.map((student) => (
                <div key={student.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar initial={student.name.split(" ").map((word) => word[0]).join("").slice(0, 2)} color={student.status === "Aktif" ? "#2563EB" : "#D97706"} />
                    <div>
                      <p className="text-sm font-bold">{student.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{student.nis} · {student.className}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatRupiah(student.balance)}</p>
                      <span className={`text-xs font-semibold ${student.status === "Aktif" ? "text-emerald-600" : "text-amber-600"}`}>{student.status}</span>
                    </div>
                    {student.status === "Menunggu" && (
                      <button onClick={() => activateStudent(student.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                        Aktifkan
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {visibleAccounts.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Siswa tidak ditemukan.</p>}
            </div>
          </section>
        )}

                {tab === "transaksi" && (
          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Data transaksi</h2>
              <p className="mt-1 text-xs text-slate-500">
                Tinjau dan setujui transaksi siswa.
              </p>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {adminRows.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold">{tx.student}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {tx.activity} · {tx.time}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          tx.type === "in"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {tx.type === "in" ? "+" : "-"}
                        {formatRupiah(tx.amount)}
                      </p>

                      <span
                        className={`text-xs font-semibold ${
                          tx.status === "Selesai"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>

                    {tx.status === "Perlu ditinjau" && (
                      <button
                        onClick={() =>
                          approvePendingTransaction(tx.id)
                        }
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"
                      >
                        Setujui
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {adminRows.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  Tidak ada transaksi.
                </p>
              )}
            </div>
          </section>
        )}

        {isAddOpen && (
          <AddStudentModal
            onClose={() => setIsAddOpen(false)}
            onSuccess={(message) => {
              setIsAddOpen(false);
              setNotice(message);
              void loadAdminData();
            }}
          />
        )}

        {isImportOpen && (
          <ImportStudentModal
            onClose={() => setIsImportOpen(false)}
            onSuccess={(message) => {
              setIsImportOpen(false);
              setNotice(message);
              void loadAdminData();
            }}
          />
        )}
      </main>
    </div>
  );
}
function AdminMetric({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: "blue" | "violet" | "amber" }) {
  const colors = { blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600" };
  return <div className="rounded-2xl bg-white p-4 shadow-sm"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}><Icon size={20} /></div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>;
}

function BalanceCard({
  balance,
  visible,
  onToggle,
  lastUpdated,
  onRefresh,
  totalMasuk,
  totalKeluar,
}: {
  balance: number;
  visible: boolean;
  onToggle: () => void;
  lastUpdated: Date;
  onRefresh: () => void;
  totalMasuk: number;
  totalKeluar: number;
}) {
  return (
    <div className="mx-4 rounded-2xl overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #1A3A6B 0%, #2563EB 60%, #3B82F6 100%)" }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-blue-200 text-xs font-medium tracking-wide uppercase">Saldo Tabungan</span>
          <div className="flex items-center gap-1">
            <button onClick={onRefresh} aria-label="Perbarui saldo" className="text-blue-200 hover:text-white transition-colors p-1">
              <RefreshCw size={15} />
            </button>
            <button onClick={onToggle} aria-label={visible ? "Sembunyikan saldo" : "Tampilkan saldo"} className="text-blue-200 hover:text-white transition-colors p-1">
              {visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>
        <div className="text-white text-3xl font-bold tracking-tight mt-1">
          {visible ? formatRupiah(balance) : "Rp ••••••"}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <CreditCard size={14} className="text-blue-300" />
          <span className="text-blue-200 text-xs font-mono tracking-widest">1023 - 9182</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          <span>Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>
      </div>
      <div className="flex border-t border-white/10">
        <div className="flex-1 px-6 py-3 text-center border-r border-white/10">
          <div className="text-blue-200 text-xs mb-0.5">Masuk Bulan Ini</div>
          <div className="text-white text-sm font-semibold">+{formatRupiah(totalMasuk)}</div>
        </div>
        <div className="flex-1 px-6 py-3 text-center">
          <div className="text-blue-200 text-xs mb-0.5">Keluar Bulan Ini</div>
          <div className="text-white text-sm font-semibold">-{formatRupiah(totalKeluar)}</div>
        </div>
      </div>
    </div>
  );
}

function LiveBalanceInfo({ balance, lastUpdated }: { balance: number; lastUpdated: Date }) {
  return (
    <div className="mx-4 mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow-sm flex-shrink-0">
            <CreditCard size={18} color="#2563EB" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-blue-950">Saldo Real-Time</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> AKTIF
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight text-foreground mt-1">{formatRupiah(balance)}</p>
          </div>
        </div>
        <div className="text-right pt-0.5 flex-shrink-0">
          <p className="text-[10px] text-muted-foreground">Diperbarui</p>
          <p className="text-xs font-semibold text-blue-800 mt-0.5">{lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Rekening Tabungan Swad</span>
        <span className="font-mono font-semibold text-blue-900">1023 - 9182</span>
      </div>
    </div>
  );
}

function QuickActions({ onTransfer, onTabung, onBayar, onTarik }: {
  onTransfer: () => void;
  onTabung: () => void;
  onBayar: () => void;
  onTarik: () => void;
}) {
  const actions = [
    { label: "Transfer", icon: Send, color: "#1A3A6B", bg: "#D6E4F7", action: onTransfer },
    { label: "Tabung", icon: Plus, color: "#16A34A", bg: "#DCFCE7", action: onTabung },
    { label: "Tarik", icon: ArrowUp, color: "#B45309", bg: "#FEF3C7", action: onTarik },
    { label: "Bayar", icon: CreditCard, color: "#7C3AED", bg: "#EDE9FE", action: onBayar },
  ];
  return (
    <div className="mx-4 mt-5">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.action}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
              style={{ backgroundColor: a.bg }}
            >
              <a.icon size={22} color={a.color} />
            </div>
            <span className="text-xs font-medium text-foreground/70">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TransactionItem({ tx }: { tx: typeof transactions[0] }) {
  const isIn = tx.type === "in";
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isIn ? "#DCFCE7" : "#FEE2E2" }}
      >
        {isIn
          ? <ArrowDownLeft size={18} color="#16A34A" />
          : <ArrowUpRight size={18} color="#DC2626" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">{tx.name}</div>
        <div className="text-xs text-muted-foreground">{tx.date}</div>
      </div>
      <div className={`text-sm font-bold ${isIn ? "text-green-600" : "text-red-500"}`}>
        {isIn ? "+" : "-"}{formatRupiah(tx.amount)}
      </div>
    </div>
  );
}

type TabungStep = "input" | "konfirmasi" | "bukti";

function TabungModal({
  onClose,
  onDeposit,
}: {
  onClose: () => void;
  onDeposit: (amount: number) => Promise<void>;
}) {
  const [step, setStep] = useState<TabungStep>("input");
  const [amount, setAmount] = useState("");

  const noRef = `TAB-${Date.now().toString().slice(-8)}`;

  const now = new Date();

  const tgl = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const stepTitle: Record<TabungStep, string> = {
    input: "Tabung Sekarang",
    konfirmasi: "Konfirmasi Tabungan",
    bukti: "Bukti Tabungan",
  };

  const handleConfirm = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Masukkan nominal tabungan terlebih dahulu.");
      return;
    }

    try {
      await onDeposit(Number(amount));
      setStep("bukti");
    } catch (error) {
      console.error("Gagal melakukan setoran:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Setoran gagal dilakukan."
      );
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={step === "bukti" ? onClose : undefined}
    >
      <div
        className="w-full bg-card rounded-t-3xl px-6 pt-6 pb-10 max-h-[88%] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {stepTitle[step]}
            </h3>

            <p className="text-xs text-muted-foreground mt-1">
              {step === "input"
                ? "Masukkan nominal tabungan"
                : step === "konfirmasi"
                  ? "Periksa kembali setoranmu"
                  : "Setoran berhasil dibuat"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1"
            aria-label="Tutup"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {step === "input" && (
          <>
            <div className="mb-5">
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                Nominal Tabungan
              </label>

              <div className="flex items-center bg-muted rounded-2xl px-4 py-4 gap-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  Rp
                </span>

                <input
                  className="flex-1 bg-transparent text-2xl font-bold outline-none text-foreground"
                  placeholder="0"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[10000, 20000, 50000, 100000, 200000, 500000].map(
                (value) => (
                  <button
                    key={value}
                    onClick={() => setAmount(String(value))}
                    className="rounded-xl py-2.5 text-xs font-semibold border transition-colors"
                    style={{
                      borderColor:
                        amount === String(value)
                          ? "#1A3A6B"
                          : "var(--border)",
                      backgroundColor:
                        amount === String(value)
                          ? "#D6E4F7"
                          : "transparent",
                      color:
                        amount === String(value)
                          ? "#1A3A6B"
                          : "var(--foreground)",
                    }}
                  >
                    {formatRupiah(value)}
                  </button>
                )
              )}
            </div>

            <div className="rounded-2xl bg-blue-50 px-4 py-3 mb-5">
              <p className="text-xs text-blue-700 leading-relaxed">
                Setoran dilakukan melalui petugas Tabungan Swad
                sesuai jam operasional sekolah.
              </p>
            </div>

            <button
              onClick={() => setStep("konfirmasi")}
              disabled={!amount || Number(amount) <= 0}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, #1A3A6B, #2563EB)",
              }}
            >
              Lanjutkan
            </button>
          </>
        )}

        {step === "konfirmasi" && (
          <>
            <div className="rounded-2xl bg-muted px-5 py-5 mb-5">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  Nominal
                </span>

                <span className="text-sm font-bold text-foreground">
                  {formatRupiah(Number(amount))}
                </span>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  Metode
                </span>

                <span className="text-sm font-semibold text-foreground">
                  Setoran Tunai
                </span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-sm font-bold text-foreground">
                  Total
                </span>

                <span
                  className="text-sm font-bold"
                  style={{ color: "#1A3A6B" }}
                >
                  {formatRupiah(Number(amount))}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("input")}
                className="flex-1 py-4 rounded-2xl text-sm font-bold border border-border text-foreground"
              >
                Kembali
              </button>

              <button
                onClick={handleConfirm}
                className="flex-[2] py-4 rounded-2xl text-sm font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #1A3A6B, #2563EB)",
                }}
              >
                Konfirmasi
              </button>
            </div>
          </>
        )}

        {step === "bukti" && (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Check
                  size={32}
                  className="text-green-600"
                />
              </div>

              <h4 className="text-lg font-bold text-foreground">
                Setoran Berhasil
              </h4>

              <p className="text-xs text-muted-foreground mt-1">
                Setoranmu sudah dicatat.
              </p>
            </div>

            <div className="rounded-2xl border border-border px-4 py-4 mb-5">
              <div className="flex justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  Nominal
                </span>

                <span className="text-sm font-bold text-foreground">
                  {formatRupiah(Number(amount))}
                </span>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  Referensi
                </span>

                <span className="text-xs font-mono font-semibold text-foreground">
                  {noRef}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Waktu
                </span>

                <span className="text-xs font-semibold text-foreground">
                  {tgl}, {jam}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, #1A3A6B, #2563EB)",
              }}
            >
              Selesai
            </button>
          </>
        )}
      </div>
    </div>
  );
}

type Frekuensi = "harian" | "mingguan" | "bulanan";

interface ReminderConfig {
  aktif: boolean;
  frekuensi: Frekuensi;
  waktu: string;
  hari: number[];
  tanggal: number;
}

const hariList = [
  "Min",
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
];

function ReminderCard({ config, onOpen }: { config: ReminderConfig; onOpen: () => void }) {
  const streak = 7;
  const frekuensiLabel: Record<Frekuensi, string> = {
    harian: "Setiap hari",
    mingguan: config.hari.length > 0 ? hariList.filter((_, i) => config.hari.includes(i)).join(", ") : "Setiap minggu",
    bulanan: `Tgl ${config.tanggal} setiap bulan`,
  };

  return (
    <div className="mx-4 mt-5">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #064E3B, #059669)" }}
      >
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <AlarmClock size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Pengingat Menabung</p>
                <p className="text-emerald-200 text-[10px]">
                  {config.aktif ? `${frekuensiLabel[config.frekuensi]} · ${config.waktu}` : "Belum diaktifkan"}
                </p>
              </div>
            </div>
            <button
              onClick={onOpen}
              className="text-[10px] font-semibold bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-2 py-1 text-white"
            >
              Atur
            </button>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Flame size={18} color="#FCD34D" />
              <span className="text-white text-base font-bold">{streak}</span>
              <span className="text-emerald-200 text-xs">hari berturut-turut</span>
            </div>
            <div className="ml-auto flex items-center gap-0.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: i < streak % 7 || streak >= 7 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)" }}
                >
                  {(i < streak % 7 || streak >= 7) && <Check size={10} color="#059669" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Target progress */}
        <div className="px-5 pb-4 pt-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-emerald-200 text-[10px] font-medium">Target bulan ini</span>
            <span className="text-white text-[10px] font-semibold">Rp 375.000 / Rp 500.000</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: "75%", background: "linear-gradient(90deg, #FCD34D, #F59E0B)" }} />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Star size={10} color="#FCD34D" fill="#FCD34D" />
            <span className="text-emerald-200 text-[10px]">Kurang Rp 125.000 lagi untuk mencapai target!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type TarikTab = "ajukan" | "status" | "riwayat";

const alasanOptions = [
  "Keperluan sekolah",
  "Keperluan keluarga",
  "Biaya transportasi",
  "Keperluan kesehatan",
  "Lainnya",
];

function TarikModal({ user, onClose, onSubmit }: { user?: any; onClose: () => void; onSubmit?: (amount: number, alasan: string) => Promise<void> }) {
  const [tab, setTab] = useState<TarikTab>("ajukan");
  const [amount, setAmount] = useState("");
  const [alasan, setAlasan] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const noRef = `TRK-${Date.now().toString().slice(-6)}`;
  const now = new Date();
  const tgl = now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const jam = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const handleAjukan = async () => {
    if (!amount || !alasan) return;
    
    try {
      if (onSubmit) {
        const nominal = parseInt(amount.replace(/[^0-9]/g, ""), 10);
        await onSubmit(nominal, alasan);
      }
      setSubmitted(true);
      setTab("status");
    } catch (error: any) {
      alert(error.message || "Gagal mengajukan penarikan ke server.");
    }
  };
  const statusColor: Record<string, { bg: string; text: string; label: string }> = {
    disetujui: { bg: "#DCFCE7", text: "#16A34A", label: "Disetujui" },
    ditolak: { bg: "#FEE2E2", text: "#DC2626", label: "Ditolak" },
    menunggu: { bg: "#FEF9C3", text: "#CA8A04", label: "Menunggu" },
  };

  const tabs: { id: TarikTab; label: string }[] = [
    { id: "ajukan", label: "Ajukan" },
    { id: "status", label: "Status" },
    { id: "riwayat", label: "Riwayat" },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div
        className="w-full bg-card rounded-t-3xl pt-6 pb-10 max-h-[90%] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 mb-4">
          <h3 className="text-base font-bold text-foreground">Penarikan Tabungan</h3>
          <button onClick={onClose} className="p-1"><X size={20} className="text-muted-foreground" /></button>
        </div>

        {/* Tab bar */}
        <div className="flex mx-6 bg-muted rounded-2xl p-1 mb-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
              style={{
                backgroundColor: tab === t.id ? "#1A3A6B" : "transparent",
                color: tab === t.id ? "#fff" : "var(--muted-foreground)",
              }}
            >
              {t.label}
              {t.id === "status" && submitted && (
                <span className="ml-1 inline-flex w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        <div className="px-6">
          {/* TAB: AJUKAN */}
          {tab === "ajukan" && (
            <>
              {/* Info rekening */}
              <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1.5px solid #B4530922" }}>
                <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #92400E, #B45309)" }}>
                  <ArrowUp size={13} className="text-amber-200" />
                  <span className="text-white text-xs font-semibold">Penarikan dari Rekening</span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                  <p className="text-xs text-muted-foreground">{user?.name}</p>
                  <p className="text-base font-bold font-mono tracking-widest" style={{ color: "#92400E" }}>
                    {user?.nis}
                  </p>
                  </div>
                  <div className="text-right">
                  <p className="text-xs text-muted-foreground">Saldo tersedia</p>
                  <p className="text-sm font-bold" style={{ color: "#16A34A" }}>
                    {user?.saldo ? formatRupiah(user.saldo) : "Rp 0"}
                  </p>
                </div>
                </div>
              </div>

              {/* Nominal */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Jumlah Penarikan</label>
                <div className="flex items-center bg-muted rounded-2xl px-4 py-4 gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">Rp</span>
                  <input
                    className="flex-1 bg-transparent text-2xl font-bold outline-none"
                    placeholder="0"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ color: "#92400E" }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[20000, 50000, 100000, 150000, 200000, 500000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className="text-xs font-semibold rounded-xl py-2 border transition-all"
                      style={{
                        borderColor: amount === String(v) ? "#B45309" : "var(--border)",
                        backgroundColor: amount === String(v) ? "#FEF3C7" : "transparent",
                        color: amount === String(v) ? "#92400E" : "var(--foreground)",
                      }}
                    >
                      {formatRupiah(v)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alasan */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Alasan Penarikan</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {alasanOptions.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlasan(a)}
                      className="text-xs font-semibold rounded-xl px-3 py-2 border transition-all"
                      style={{
                        borderColor: alasan === a ? "#B45309" : "var(--border)",
                        backgroundColor: alasan === a ? "#FEF3C7" : "transparent",
                        color: alasan === a ? "#92400E" : "var(--foreground)",
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {alasan === "Lainnya" && (
                  <input
                    className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none"
                    placeholder="Jelaskan alasan penarikan..."
                  />
                )}
              </div>

              {/* Catatan petugas */}
              <div className="flex items-start gap-3 bg-amber-50 rounded-2xl px-4 py-3 mb-5">
                <Shield size={15} color="#D97706" className="flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Pengajuan penarikan memerlukan <strong>persetujuan petugas Tabungan Swad</strong> sebelum dana dapat diambil.
                </p>
              </div>

              <button
                onClick={handleAjukan}
                disabled={!amount || Number(amount) <= 0 || !alasan}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #92400E, #B45309)" }}
              >
                Ajukan Penarikan
              </button>
            </>
          )}

          {/* TAB: STATUS */}
          {tab === "status" && (
            <>
              {submitted ? (
                <>
                  {/* Status menunggu */}
                  <div className="flex flex-col items-center mb-5 pt-2">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                      <Clock size={30} color="#D97706" />
                    </div>
                    <p className="text-base font-bold text-foreground">Pengajuan Terkirim</p>
                    <p className="text-xs text-muted-foreground mt-1 text-center">Menunggu persetujuan petugas Tabungan Swad</p>
                  </div>

                  {/* Detail pengajuan */}
                  <div className="rounded-2xl border border-border overflow-hidden mb-4">
                    <div className="px-5 py-3 bg-muted border-b border-border flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Detail Pengajuan</p>
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: "#FEF9C3", color: "#CA8A04" }}
                      >
                        Menunggu
                      </span>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">No. Referensi</span>
                        <span className="text-sm font-mono font-bold text-foreground">{noRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tanggal Ajuan</span>
                        <span className="text-sm font-medium text-foreground">{tgl}, {jam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Alasan</span>
                        <span className="text-sm font-semibold text-foreground">{alasan}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-sm font-bold text-foreground">Jumlah</span>
                        <span className="text-sm font-bold" style={{ color: "#B45309" }}>{formatRupiah(Number(amount))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline proses */}
                  <div className="rounded-2xl border border-border px-5 py-4 mb-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Proses Persetujuan</p>
                    <div className="space-y-4">
                      {[
                        { label: "Pengajuan dikirim", sub: `${tgl}, ${jam}`, done: true },
                        { label: "Review petugas", sub: "Menunggu petugas memeriksa", done: false },
                        { label: "Dana dapat diambil", sub: "Setelah disetujui petugas", done: false },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: step.done ? "#1A3A6B" : "#DDE6F0",
                              }}
                            >
                              {step.done
                                ? <Check size={12} className="text-white" />
                                : <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>}
                            </div>
                            {i < 2 && <div className="w-px h-6 mt-1" style={{ backgroundColor: step.done ? "#1A3A6B" : "#DDE6F0" }} />}
                          </div>
                          <div className="pb-1">
                            <p className="text-sm font-semibold" style={{ color: step.done ? "var(--foreground)" : "var(--muted-foreground)" }}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{step.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setTab("riwayat")}
                    className="w-full py-4 rounded-2xl text-sm font-bold border border-border text-foreground"
                  >
                    Lihat Riwayat Penarikan
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <Clock size={26} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Belum ada pengajuan aktif</p>
                  <p className="text-xs text-muted-foreground text-center">Ajukan penarikan terlebih dahulu di tab Ajukan</p>
                  <button
                    onClick={() => setTab("ajukan")}
                    className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #92400E, #B45309)" }}
                  >
                    Ajukan Sekarang
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB: RIWAYAT */}
          {tab === "riwayat" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Riwayat Penarikan</p>
                <span className="text-xs font-semibold text-muted-foreground">{riwayatTarik.length} transaksi</span>
              </div>

              {/* Ringkasan */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 rounded-2xl px-4 py-3">
                  <p className="text-xs text-green-700 mb-1">Total Disetujui</p>
                  <p className="text-sm font-bold text-green-700">
                    {formatRupiah(riwayatTarik.filter(r => r.status === "disetujui").reduce((s, r) => s + r.jumlah, 0))}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-2xl px-4 py-3">
                  <p className="text-xs text-amber-700 mb-1">Jumlah Pengajuan</p>
                  <p className="text-sm font-bold text-amber-700">{riwayatTarik.length}× penarikan</p>
                </div>
              </div>

<div className="space-y-2">
  {liveTransactions && liveTransactions.filter((t: any) => t.type === 'out').length > 0 ? (
    liveTransactions
      .filter((t: any) => t.type === 'out')
      .map((t: any) => {
        const isApproved = t.status === 'approved';
        const isRejected = t.status === 'rejected';
        const statusLabel = isApproved ? 'Disetujui' : isRejected ? 'Ditolak' : 'Menunggu';
        const statusColor = isApproved 
          ? { bg: '#DCFCE7', text: '#16A34A' } 
          : isRejected 
          ? { bg: '#FEE2E2', text: '#DC2626' } 
          : { bg: '#FEF9C3', text: '#CA8A04' };

        return (
          <div key={t.id} className="rounded-2xl border border-border px-4 py-3">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-bold text-foreground">{formatRupiah(t.amount)}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
              >
                {statusLabel}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span className="text-[10px] font-mono text-muted-foreground">TRK-{t.id}</span>
              <span className="text-[10px] text-muted-foreground">Kategori: {t.category || 'Penarikan Tunai'}</span>
            </div>
          </div>
        );
      })
  ) : (
  <div className="text-center py-8 text-sm text-muted-foreground">
            Belum ada riwayat penarikan.
          </div>
        )}
      </div>
      </>
    )}
    </div>
    </div>
    </div>
  );
}              
type NotifKategori = "setoran" | "penarikan" | "transfer" | "saldo" | "spp";

interface Notif {
  id: number;
  kategori: NotifKategori;
  judul: string;
  pesan: string;
  waktu: string;
  dibaca: boolean;
  nominal?: number;
  positif?: boolean;
}

const notifAwal: Notif[] = [
  {
    id: 1,
    kategori: "spp",
    judul: "Pengingat Pembayaran SPP",
    pesan: "SPP bulan Juli 2024 belum dibayar. Segera bayar sebelum tanggal 10 Juli 2024.",
    waktu: "Baru saja",
    dibaca: false,
  },
  {
    id: 2,
    kategori: "setoran",
    judul: "Setoran Berhasil",
    pesan: "Tabungan kamu berhasil disetor. Saldo kamu bertambah.",
    waktu: "2 jam lalu",
    dibaca: false,
    nominal: 100000,
    positif: true,
  },
  {
    id: 3,
    kategori: "transfer",
    judul: "Transfer Berhasil",
    pesan: "Transfer ke Budi Santoso berhasil diproses.",
    waktu: "Kemarin, 10:23",
    dibaca: false,
    nominal: 50000,
    positif: false,
  },
  {
    id: 4,
    kategori: "saldo",
    judul: "Saldo Bertambah",
    pesan: "Uang saku dari orang tua telah masuk ke tabunganmu.",
    waktu: "Ming, 18:00",
    dibaca: true,
    nominal: 200000,
    positif: true,
  },
  {
    id: 5,
    kategori: "penarikan",
    judul: "Penarikan Berhasil",
    pesan: "Penarikan tabunganmu telah disetujui dan dapat diambil di petugas Tabungan Swad.",
    waktu: "15 Jun 2024",
    dibaca: true,
    nominal: 100000,
    positif: false,
  },
  {
    id: 6,
    kategori: "saldo",
    judul: "Saldo Berkurang",
    pesan: "Pembayaran SPP Juni 2024 berhasil dipotong dari saldo tabunganmu.",
    waktu: "1 Jun 2024",
    dibaca: true,
    nominal: 150000,
    positif: false,
  },
  {
    id: 7,
    kategori: "transfer",
    judul: "Transfer Masuk",
    pesan: "Kamu menerima transfer dari Ahmad Rizki.",
    waktu: "28 Mei 2024",
    dibaca: true,
    nominal: 25000,
    positif: true,
  },
  {
    id: 8,
    kategori: "spp",
    judul: "Pengingat Pembayaran SPP",
    pesan: "SPP bulan Juni 2024 belum dibayar. Segera selesaikan pembayaran.",
    waktu: "1 Jun 2024",
    dibaca: true,
  },
];

const notifIcon: Record<NotifKategori, { icon: React.ElementType; bg: string; color: string }> = {
  setoran: { icon: ArrowDownLeft, bg: "#DCFCE7", color: "#16A34A" },
  penarikan: { icon: ArrowUpRight, bg: "#FEE2E2", color: "#DC2626" },
  transfer: { icon: ArrowLeftRight, bg: "#DBEAFE", color: "#2563EB" },
  saldo: { icon: CreditCard, bg: "#EDE9FE", color: "#7C3AED" },
  spp: { icon: Bell, bg: "#FEF3C7", color: "#D97706" },
};

function NotifPanel({ notifications, onNotificationsChange, onClose }: any) {
  const [filter, setFilter] = useState<"semua" | "belum">("semua");

  const belumDibaca = notifications ? notifications.filter((n: any) => !n.dibaca).length : 0;
  const filtered = filter === "belum" ? notifications.filter((n: any) => !n.dibaca) : notifications;

  const bacaSemua = () => onNotificationsChange((prev: any[]) => prev.map((n) => ({ ...n, dibaca: true })));
  const bacaSatu = (id: number) => onNotificationsChange((prev: any[]) => prev.map((n) => n.id === id ? { ...n, dibaca: true } : n));

  
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background" style={{ borderRadius: 40 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-7 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 -ml-1">
            <ChevronRight size={20} className="text-foreground rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-foreground">Notifikasi</h2>
            {belumDibaca > 0 && (
              <p className="text-xs text-muted-foreground">{belumDibaca} belum dibaca</p>
            )}
          </div>
        </div>
        {belumDibaca > 0 && (
          <button onClick={bacaSemua} className="text-xs font-semibold" style={{ color: "#2563EB" }}>
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Filter tab */}
      <div className="flex mx-5 mt-3 bg-muted rounded-2xl p-1 mb-3">
        {([["semua", "Semua"], ["belum", "Belum Dibaca"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors relative"
            style={{
              backgroundColor: filter === id ? "#1A3A6B" : "transparent",
              color: filter === id ? "#fff" : "var(--muted-foreground)",
            }}
          >
            {label}
            {id === "belum" && belumDibaca > 0 && (
              <span
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                style={{ backgroundColor: filter === id ? "#fff" : "#EF4444", color: filter === id ? "#1A3A6B" : "#fff" }}
              >
                {belumDibaca}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ scrollbarWidth: "none" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Bell size={22} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const meta = notifIcon[n.kategori];
              const Icon = meta.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => bacaSatu(n.id)}
                  className="w-full flex items-start gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors"
                  style={{ backgroundColor: n.dibaca ? "var(--card)" : "#EEF5FF", border: `1.5px solid ${n.dibaca ? "var(--border)" : "#BFDBFE"}` }}
                >
                  {/* Ikon kategori */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: meta.bg }}
                  >
                    <Icon size={18} color={meta.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground leading-tight">{n.judul}</p>
                      {!n.dibaca && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.pesan}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">{n.waktu}</span>
                      {n.nominal !== undefined && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: n.positif ? "#16A34A" : "#DC2626" }}
                        >
                          {n.positif ? "+" : "-"}{formatRupiah(n.nominal)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const bayarCategories = [
  {
    id: "spp",
    label: "SPP Bulanan",
    desc: "Iuran wajib sekolah",
    amount: 150000,
    color: "#7C3AED",
    bg: "#EDE9FE",
    icon: Shield,
    bulan: ["Juli 2024 — Belum Dibayar", "Juni 2024 — Belum Dibayar", "Mei 2024 — Lunas"],
  },
  {
    id: "koperasi",
    label: "Koperasi Sekolah",
    desc: "Buku, alat tulis, seragam",
    color: "#0369A1",
    bg: "#E0F2FE",
    icon: CreditCard,
    items: [
      { name: "Buku Tulis Isi 38 (1 lusin)", price: 24000 },
      { name: "Pulpen Hitam (1 pack)", price: 18000 },
      { name: "Penggaris 30cm", price: 8000 },
      { name: "Seragam Olahraga", price: 120000 },
      { name: "Buku Pelajaran Akuntansi Kelas XI", price: 65000 },
      { name: "Map Plastik (5 pcs)", price: 12000 },
    ],
  },
];

type BayarStep = "menu" | "spp" | "koperasi" | "koperasi-confirm" | "success";

function BayarModal({ onClose, balance, onPayment }: { onClose: () => void; balance: number; onPayment: (entry: NewTransaction) => void }) {
  const [step, setStep] = useState<BayarStep>("menu");
  const [selectedBulan, setSelectedBulan] = useState<string[]>([]);
  const [cart, setCart] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  const koperasi = bayarCategories[1];
  const spp = bayarCategories[0];

  const toggleBulan = (b: string) => {
    if (b.includes("Lunas")) return;
    setSelectedBulan((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  };

  const toggleItem = (item: { name: string; price: number }) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.name === item.name);
      if (exists) return prev.filter((c) => c.name !== item.name);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const sppTotal = selectedBulan.filter((b) => !b.includes("Lunas")).length * spp.amount;

  const handlePaySpp = () => {
    if (sppTotal > balance) return;
    onPayment({ name: `Pembayaran SPP ${selectedBulan.length} bulan`, type: "out", amount: sppTotal, category: "Pembayaran SPP" });
    setSuccessMsg(`SPP ${selectedBulan.length} bulan senilai ${formatRupiah(sppTotal)} berhasil dibayar`);
    setStep("success");
  };

  const handlePayKoperasi = () => {
    if (cartTotal > balance) return;
    onPayment({ name: "Koperasi Sekolah", type: "out", amount: cartTotal, category: "Pembelian" });
    setSuccessMsg(`Pembelian koperasi senilai ${formatRupiah(cartTotal)} berhasil dibayar`);
    setStep("success");
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full bg-card rounded-t-3xl px-6 pt-6 pb-10 max-h-[85%] overflow-y-auto" style={{ scrollbarWidth: "none" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {step !== "menu" && step !== "success" && (
              <button onClick={() => setStep(step === "koperasi-confirm" ? "koperasi" : "menu")} className="p-1 -ml-1">
                <ChevronRight size={18} className="text-muted-foreground rotate-180" />
              </button>
            )}
            <h3 className="text-base font-bold text-foreground">
              {step === "menu" && "Pembayaran Sekolah"}
              {step === "spp" && "Bayar SPP"}
              {step === "koperasi" && "Koperasi Sekolah"}
              {step === "koperasi-confirm" && "Konfirmasi Belanja"}
              {step === "success" && "Pembayaran Berhasil"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1"><X size={20} className="text-muted-foreground" /></button>
        </div>

        {/* Menu Utama */}
        {step === "menu" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4">Pilih jenis pembayaran ke sekolah</p>
            {bayarCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setStep(cat.id as BayarStep)}
                className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 border border-border hover:border-purple-200 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.bg }}>
                  <cat.icon size={22} color={cat.color} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{cat.label}</div>
                  <div className="text-xs text-muted-foreground">{cat.desc}</div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* SPP */}
        {step === "spp" && (
          <>
            <div className="bg-purple-50 rounded-2xl px-4 py-3 mb-4 flex gap-3">
              <Shield size={16} color="#7C3AED" className="flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-700">SPP dibayarkan langsung ke rekening Tabungan Swad. Pilih bulan yang ingin dibayar.</p>
            </div>
            <div className="space-y-2 mb-5">
              {spp.bulan.map((b) => {
                const lunas = b.includes("Lunas");
                const checked = selectedBulan.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => toggleBulan(b)}
                    disabled={lunas}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors"
                    style={{
                      borderColor: checked ? "#7C3AED" : "var(--border)",
                      backgroundColor: lunas ? "#F3F4F6" : checked ? "#F5F3FF" : "transparent",
                    }}
                  >
                    <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: lunas ? "#D1D5DB" : checked ? "#7C3AED" : "#D1D5DB", backgroundColor: checked ? "#7C3AED" : "transparent" }}>
                      {checked && <Check size={12} className="text-white" />}
                      {lunas && <Check size={12} color="#9CA3AF" />}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-semibold" style={{ color: lunas ? "#9CA3AF" : "var(--foreground)" }}>
                        {b.split(" — ")[0]}
                      </span>
                      <span className={`ml-2 text-xs font-medium ${lunas ? "text-green-500" : "text-red-400"}`}>
                        {b.split(" — ")[1]}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: lunas ? "#9CA3AF" : "#7C3AED" }}>{formatRupiah(spp.amount)}</span>
                  </button>
                );
              })}
            </div>
            {selectedBulan.length > 0 && (
              <div className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3 mb-4">
                <span className="text-sm text-purple-700 font-medium">{selectedBulan.length} bulan dipilih</span>
                <span className="text-sm font-bold text-purple-700">{formatRupiah(sppTotal)}</span>
              </div>
            )}
            <button
              onClick={handlePaySpp}
              disabled={selectedBulan.length === 0 || sppTotal > balance}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
            >
              Bayar SPP Sekarang
            </button>
          </>
        )}

        {/* Koperasi */}
        {step === "koperasi" && (
          <>
            <p className="text-xs text-muted-foreground mb-4">Pilih barang yang ingin dibeli di koperasi</p>
            <div className="space-y-2 mb-5">
              {(koperasi.items ?? []).map((item) => {
                const inCart = cart.find((c) => c.name === item.name);
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item)}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors text-left"
                    style={{
                      borderColor: inCart ? "#0369A1" : "var(--border)",
                      backgroundColor: inCart ? "#E0F2FE" : "transparent",
                    }}
                  >
                    <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: inCart ? "#0369A1" : "#D1D5DB", backgroundColor: inCart ? "#0369A1" : "transparent" }}>
                      {inCart && <Check size={12} className="text-white" />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-sm font-bold" style={{ color: "#0369A1" }}>{formatRupiah(item.price)}</span>
                  </button>
                );
              })}
            </div>
            {cart.length > 0 && (
              <div className="flex items-center justify-between bg-sky-50 rounded-xl px-4 py-3 mb-4">
                <span className="text-sm text-sky-700 font-medium">{cart.length} item dipilih</span>
                <span className="text-sm font-bold text-sky-700">{formatRupiah(cartTotal)}</span>
              </div>
            )}
            <button
              onClick={() => setStep("koperasi-confirm")}
              disabled={cart.length === 0}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #0369A1, #0EA5E9)" }}
            >
              Lanjut Bayar
            </button>
          </>
        )}

        {/* Konfirmasi Koperasi */}
        {step === "koperasi-confirm" && (
          <>
            <p className="text-xs text-muted-foreground mb-4">Rincian belanja koperasi</p>
            <div className="bg-card border border-border rounded-2xl px-4 py-3 mb-4 divide-y divide-border">
              {cart.map((c) => (
                <div key={c.name} className="flex justify-between py-2.5">
                  <span className="text-sm text-foreground">{c.name}</span>
                  <span className="text-sm font-semibold text-foreground">{formatRupiah(c.price)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-sm font-bold" style={{ color: "#0369A1" }}>{formatRupiah(cartTotal)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-sky-50 rounded-xl px-4 py-3 mb-5">
              <CreditCard size={14} color="#0369A1" />
              <p className="text-xs text-sky-700">Pembayaran dari saldo tabungan ke rekening Koperasi SMK Swadaya Semarang (Tabungan Swad)</p>
            </div>
            <button
              onClick={handlePayKoperasi}
              disabled={cartTotal > balance}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #0369A1, #0EA5E9)" }}
            >
              Konfirmasi Pembayaran
            </button>
          </>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={34} className="text-green-600" />
            </div>
            <p className="text-base font-bold text-foreground text-center">Pembayaran Berhasil!</p>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">{successMsg}</p>
            <button
              onClick={onClose}
              className="mt-3 w-full py-4 rounded-2xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeScreen({
  user,
  onTransfer,
  balance,
  transactions,
  lastUpdated,
  onRefresh,
  onTransaction,
  notifications,
  onNotificationsChange,
}: {
  user: AuthUser;
  onTransfer: () => void;
  balance: number;
  transactions: Transaction[];
  lastUpdated: Date;
  onRefresh: () => void;
  onTransaction: (entry: NewTransaction) => void;
  notifications: Notif[];
  onNotificationsChange: React.Dispatch<React.SetStateAction<Notif[]>>;
}) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [tabungOpen, setTabungOpen] = useState(false);
  const [bayarOpen, setBayarOpen] = useState(false);
  const [tarikOpen, setTarikOpen] = useState(false);
const [notifOpen, setNotifOpen] = useState(false);
    const [reminderOpen, setReminderOpen] = useState(false);
    const belumDibacaCount = notifications.filter((n) => !n.dibaca).length;
    const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({
      aktif: true,
      frekuensi: "mingguan",
      waktu: "07:00",
      hari: [1, 5],
      tanggal: 1,
    });
  const totalMasuk = transactions.filter((t) => t.type === "in").reduce((total, t) => total + t.amount, 0);
  const totalKeluar = transactions.filter((t) => t.type === "out").reduce((total, t) => total + t.amount, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-7 pb-5">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#2563EB" }}>TABUNGAN SWAD</p>
          <p className="text-xs text-muted-foreground font-medium">Halo, {user.name.split(" ")[0]} 👋</p>
          <h1 className="text-lg font-bold text-foreground leading-tight">{user.name}</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setNotifOpen(true)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm"
          >
            <Bell size={18} className="text-foreground/60" />
          </button>
          {belumDibacaCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 border-2 border-background flex items-center justify-center text-[9px] font-bold text-white px-0.5"
            >
              {belumDibacaCount}
            </span>
          )}
        </div>
      </div>

      {/* Balance Card - Menggunakan username sebagai nomor rekening dinamis */}
      <div className="mx-4 rounded-2xl overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #1A3A6B 0%, #2563EB 60%, #3B82F6 100%)" }}>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-blue-200 text-xs font-medium tracking-wide uppercase">Saldo Tabungan</span>
            <div className="flex items-center gap-1">
              <button onClick={onRefresh} aria-label="Perbarui saldo" className="text-blue-200 hover:text-white transition-colors p-1">
                <RefreshCw size={15} />
              </button>
              <button onClick={() => setBalanceVisible(!balanceVisible)} aria-label={balanceVisible ? "Sembunyikan saldo" : "Tampilkan saldo"} className="text-blue-200 hover:text-white transition-colors p-1">
                {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
          <div className="text-white text-3xl font-bold tracking-tight mt-1">
            {balanceVisible ? formatRupiah(balance) : "Rp ••••••"}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <CreditCard size={14} className="text-blue-300" />
            <span className="text-blue-200 text-xs font-mono tracking-widest">{user.username}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span>Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
        </div>
        <div className="flex border-t border-white/10">
          <div className="flex-1 px-6 py-3 text-center border-r border-white/10">
            <div className="text-blue-200 text-xs mb-0.5">Masuk Bulan Ini</div>
            <div className="text-white text-sm font-semibold">+{formatRupiah(totalMasuk)}</div>
          </div>
          <div className="flex-1 px-6 py-3 text-center">
            <div className="text-blue-200 text-xs mb-0.5">Keluar Bulan Ini</div>
            <div className="text-white text-sm font-semibold">-{formatRupiah(totalKeluar)}</div>
          </div>
        </div>
      </div>

      <QuickActions onTransfer={onTransfer} onTabung={() => setTabungOpen(true)} onBayar={() => setBayarOpen(true)} onTarik={() => setTarikOpen(true)} />

      {/* Live Balance Info */}
      <div className="mx-4 mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-4 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow-sm flex-shrink-0">
              <CreditCard size={18} color="#2563EB" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-blue-950">Saldo Real-Time</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> AKTIF
                </span>
              </div>
              <p className="text-xl font-bold tracking-tight text-foreground mt-1">{formatRupiah(balance)}</p>
            </div>
          </div>
          <div className="text-right pt-0.5 flex-shrink-0">
            <p className="text-[10px] text-muted-foreground">Diperbarui</p>
            <p className="text-xs font-semibold text-blue-800 mt-0.5">{lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Rekening Tabungan Swad</span>
          <span className="font-mono font-semibold text-blue-900">{user.username}</span>
        </div>
      </div>

      <ReminderCard config={reminderConfig} onOpen={() => setReminderOpen(true)} />

      {/* Promo Banner */}
      <div className="mx-4 mt-5 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(120deg, #7C3AED, #EC4899)" }}>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-white text-xs font-medium opacity-80 mb-1">Program Menabung</div>
            <div className="text-white text-sm font-bold">Tabung Rp 500rb,<br/>Dapat Hadiah!</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mx-4 mt-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-foreground">Transaksi Terbaru</h2>
          <button className="text-xs font-semibold" style={{ color: "#2563EB" }}>Lihat Semua</button>
        </div>
        <div className="bg-card rounded-2xl shadow-sm px-4 divide-y divide-border">
          {transactions.slice(0, 4).map((tx) => (
            <TransactionItem key={tx.id} tx={tx} />
          ))}
        </div>
      </div>

     {notifOpen && (
        <NotifPanel
          notifications={notifications}
          onNotificationsChange={onNotificationsChange}
          onClose={() => setNotifOpen(false)}
        />
      )}
      {bayarOpen && <BayarModal onClose={() => setBayarOpen(false)} balance={balance} onPayment={onTransaction} />}
 
      {tarikOpen && (
      <TarikModal
        user={user} 
        onClose={() => setTarikOpen(false)}
        onSubmit={async (nominal, alasan) => {
      
      const newNotif = {
        id: Date.now(),
        kategori: "transfer",
        judul: "Pengajuan Penarikan Terkirim",
        pesan: `Penarikan tunai senilai Rp ${nominal.toLocaleString("id-ID")} berhasil diajukan dan menunggu persetujuan petugas.`,
        waktu: "Baru saja",
        dibaca: false,
        nominal: nominal,
        positif: false,
      };

      const existingNotifs = JSON.parse(localStorage.getItem("myNotifs") || "[]");
      const updatedNotifs = [newNotif, ...existingNotifs];
      localStorage.setItem("myNotifs", JSON.stringify(updatedNotifs));

      // Segarkan halaman
      window.location.reload();
    }}
  />
)}    
      
      {tabungOpen && (
    <TabungModal
      onClose={() => setTabungOpen(false)}
      onDeposit={async (amount) => {
        await createDeposit(amount);
        await onRefresh();
      }}
    />
  )}
</div>
);
}

function TransferScreen({
  balance,
  onTransfer,
}: {
  balance: number;
  onTransfer: (entry: NewTransaction) => void;
}) {
  const [step, setStep] = useState<
    "select" | "amount" | "confirm" | "success"
  >("select");

  const [selected, setSelected] =
    useState<(typeof contacts)[0] | null>(null);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSelect = (contact: (typeof contacts)[0]) => {
    setSelected(contact);
    setStep("amount");
  };

  const handleConfirm = () => {
    if (!amount || Number(amount) <= 0) return;
    setStep("confirm");
  };

  const handleSend = () => {
    if (!selected) return;

    const transferAmount = Number(amount);

    if (!transferAmount || transferAmount <= 0) return;

    if (transferAmount > balance) return;

    onTransfer({
      name: `Transfer ke ${selected.name}`,
      type: "out",
      amount: transferAmount,
      category: "Transfer Keluar",
    });

    setStep("success");
  };

  const handleReset = () => {
    setStep("select");
    setSelected(null);
    setAmount("");
    setNote("");
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto pb-24"
      style={{ scrollbarWidth: "none" }}
    >
      {/* HEADER */}
      <div className="px-4 pt-7 pb-5">
        <h1 className="text-xl font-bold text-foreground">
          Transfer
        </h1>

        <p className="text-xs text-muted-foreground mt-0.5">
          Kirim uang ke teman sekolah
        </p>
      </div>

      {/* PILIH KONTAK */}
      {step === "select" && (
        <div className="px-4">
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Kontak Favorit
              </p>
            </div>

            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelect(contact)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <Avatar
                  initial={contact.initial}
                  color={contact.color}
                />

                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-foreground">
                    {contact.name}
                  </div>

                  <div className="text-xs text-muted-foreground font-mono">
                    {contact.account}
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className="text-muted-foreground"
                />
              </button>
            ))}
          </div>

          {/* CARI NOMOR REKENING */}
          <div className="bg-card rounded-2xl shadow-sm px-4 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Nomor Rekening
            </p>

            <div className="flex gap-2">
              <input
                className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-mono outline-none text-foreground"
                placeholder="Masukkan nomor rekening"
              />

              <button
                className="px-4 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#1A3A6B" }}
              >
                Cari
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT JUMLAH */}
      {step === "amount" && selected && (
        <div className="px-4">
          <div className="bg-card rounded-2xl shadow-sm px-4 py-4 mb-4 flex items-center gap-3">
            <Avatar
              initial={selected.initial}
              color={selected.color}
              size={44}
            />

            <div>
              <div className="text-sm font-bold text-foreground">
                {selected.name}
              </div>

              <div className="text-xs text-muted-foreground font-mono">
                {selected.account}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-sm px-4 py-5 mb-4">
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Jumlah Transfer
            </label>

            <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-3">
              <span className="text-sm font-semibold text-muted-foreground">
                Rp
              </span>

              <input
                className="flex-1 bg-transparent text-lg font-bold text-foreground outline-none"
                placeholder="0"
                type="number"
                min="0"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[5000, 10000, 20000, 50000, 100000, 200000].map(
                (value) => (
                  <button
                    key={value}
                    onClick={() => setAmount(String(value))}
                    className="text-xs font-semibold rounded-xl py-2 border transition-colors"
                    style={{
                      borderColor:
                        amount === String(value)
                          ? "#1A3A6B"
                          : "var(--border)",
                      backgroundColor:
                        amount === String(value)
                          ? "#D6E4F7"
                          : "transparent",
                      color:
                        amount === String(value)
                          ? "#1A3A6B"
                          : "var(--foreground)",
                    }}
                  >
                    {formatRupiah(value)}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* CATATAN */}
          <div className="bg-card rounded-2xl shadow-sm px-4 py-4 mb-5">
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Catatan (opsional)
            </label>

            <input
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none"
              placeholder="Misal: bayar iuran, dll."
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
            />
          </div>

          {/* TOMBOL */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("select")}
              className="flex-1 py-4 rounded-2xl text-sm font-bold border border-border text-foreground"
            >
              Kembali
            </button>

            <button
              onClick={handleConfirm}
              disabled={!amount || Number(amount) <= 0}
              className="flex-[2] py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, #1A3A6B, #2563EB)",
              }}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* KONFIRMASI */}
      {step === "confirm" && selected && (
        <div className="px-4">
          <div className="bg-card rounded-2xl shadow-sm px-5 py-5 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Konfirmasi Transfer
            </p>

            <div className="flex flex-col items-center mb-5">
              <Avatar
                initial={selected.initial}
                color={selected.color}
                size={56}
              />

              <div className="mt-2 text-base font-bold text-foreground">
                {selected.name}
              </div>

              <div className="text-xs text-muted-foreground font-mono">
                {selected.account}
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Jumlah
                </span>

                <span className="text-sm font-bold text-foreground">
                  {formatRupiah(Number(amount))}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Biaya Admin
                </span>

                <span className="text-sm font-bold text-green-600">
                  Gratis
                </span>
              </div>

              {note && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Catatan
                  </span>

                  <span className="text-sm font-medium text-foreground">
                    {note}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-sm font-bold text-foreground">
                  Total
                </span>

                <span
                  className="text-sm font-bold"
                  style={{ color: "#1A3A6B" }}
                >
                  {formatRupiah(Number(amount))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("amount")}
              className="flex-1 py-4 rounded-2xl text-sm font-bold border border-border text-foreground"
            >
              Kembali
            </button>

            <button
              onClick={handleSend}
              disabled={Number(amount) > balance}
              className="flex-[2] py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, #1A3A6B, #2563EB)",
              }}
            >
              Kirim Sekarang
            </button>
          </div>
        </div>
      )}

      {/* BERHASIL */}
      {step === "success" && selected && (
        <div className="px-4 flex flex-col items-center justify-center flex-1 pt-10">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check
              size={40}
              className="text-green-600"
            />
          </div>

          <h2 className="text-lg font-bold text-foreground mb-1">
            Transfer Berhasil!
          </h2>

          <p className="text-sm text-muted-foreground mb-1">
            {formatRupiah(Number(amount))} dikirim ke
          </p>

          <p className="text-sm font-semibold text-foreground mb-6">
            {selected.name}
          </p>

          <div className="bg-card rounded-2xl shadow-sm px-5 py-4 w-full mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Referensi
              </span>

              <span className="text-xs font-mono font-medium text-foreground">
                TRF-20240622-001
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">
                Waktu
              </span>

              <span className="text-xs font-medium text-foreground">
                {new Date().toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, #1A3A6B, #2563EB)",
            }}
          >
            Selesai
          </button>
        </div>
      )}
    </div>
  );
}

type ProfilePanel = "rekening" | "keamanan" | "aktivitas" | "bantuan" | null;

function ProfileScreen({ user, balance, onLogout }: { user: AuthUser; balance: number; onLogout: () => void }) {
  const [panel, setPanel] = useState<ProfilePanel>(null);
  const menuItems = [
    { id: "rekening" as const, label: "Informasi Rekening", subtitle: "Nomor rekening dan status akun", icon: CreditCard, color: "#2563EB" },
    { id: "keamanan" as const, label: "Keamanan & PIN", subtitle: "Kelola keamanan akun", icon: Shield, color: "#7C3AED" },
    { id: "aktivitas" as const, label: "Riwayat Aktivitas", subtitle: "Login dan aktivitas terbaru", icon: Clock, color: "#D97706" },
    { id: "bantuan" as const, label: "Bantuan", subtitle: "Hubungi petugas Tabungan Swad", icon: Bell, color: "#16A34A" },
  ];

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const panelContent: Record<Exclude<ProfilePanel, null>, { title: string; text: string; rows: { label: string; value: string }[] }> = {
    rekening: {
      title: "Informasi Rekening",
      text: "Data rekening Tabungan Swad kamu.",
      rows: [
        { label: "Nama pemilik", value: user.name },
        { label: "No. rekening", value: user.username },
        { label: "Jenis akun", value: "Tabungan Swad" },
        { label: "Status", value: user.active ? "Aktif" : "Menunggu" },
      ],
    },
    keamanan: {
      title: "Keamanan & PIN",
      text: "Jaga kerahasiaan PIN dan password akunmu.",
      rows: [
        { label: "PIN transaksi", value: "Aktif" },
        { label: "Password", value: "Terlindungi" },
        { label: "Perangkat ini", value: "Terverifikasi" },
      ],
    },
    aktivitas: {
      title: "Riwayat Aktivitas",
      text: "Aktivitas keamanan terbaru pada akun ini.",
      rows: [
        { label: "Login terakhir", value: "Baru saja" },
        { label: "Perangkat", value: "Android" },
        { label: "Status sesi", value: "Aktif" },
      ],
    },
    bantuan: {
      title: "Bantuan",
      text: "Butuh bantuan terkait akun atau transaksi? Hubungi petugas Tabungan Swad di sekolah.",
      rows: [
        { label: "Layanan", value: "Senin–Jumat, 08.00–12.00" },
        { label: "Lokasi", value: "Bank Mini SMK Swadaya" },
      ],
    },
  };

  const selectedPanel = panel ? panelContent[panel] : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24" style={{ scrollbarWidth: "none" }}>
      <div className="px-4 pt-7 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Profil</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola akun Tabungan Swad kamu</p>
        </div>
        <div className="px-2.5 py-1.5 rounded-full bg-green-100 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold text-green-700">AKUN AKTIF</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mx-4 rounded-2xl px-5 py-5 mb-3 flex items-center gap-4 text-white" style={{ background: "linear-gradient(135deg, #1A3A6B, #2563EB)" }}>
        <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-xl font-bold">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-base font-bold truncate">{user.name}</div>
          <div className="text-xs text-blue-100 mt-0.5">{user.className || "Siswa SMK Swadaya"}</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5">
            <Shield size={10} className="text-blue-100" />
            <span className="text-[10px] text-white font-semibold">Terverifikasi</span>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Saldo tabungan</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatRupiah(balance)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <CreditCard size={19} color="#2563EB" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">No. Rekening / NIS</span>
          <span className="text-xs font-mono font-bold text-foreground">{user.username}</span>
        </div>
      </div>

      {/* Account Info */}
      <div className="mx-4 bg-card rounded-2xl shadow-sm px-5 py-4 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Detail Rekening</p>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">No. Rekening / NIS</span>
            <span className="text-sm font-mono font-semibold text-foreground">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Kelas</span>
            <span className="text-sm font-semibold text-foreground">{user.className || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Jenis Akun</span>
            <span className="text-sm font-semibold text-foreground">Tabungan Swad</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">Status akun</span>
            <span className="text-sm font-bold text-green-600">Terverifikasi</span>
          </div>
        </div>
      </div>

      <p className="mx-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pengaturan Akun</p>

      {/* Menu */}
      <div className="mx-4 bg-card rounded-2xl shadow-sm overflow-hidden mb-4">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setPanel(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "1A" }}>
              <item.icon size={18} color={item.color} />
            </div>
            <span className="flex-1 text-left">
              <span className="block text-sm font-semibold text-foreground">{item.label}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">{item.subtitle}</span>
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      <div className="mx-4">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
          <LogOut size={16} />
          Keluar
        </button>
      </div>

      {selectedPanel && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setPanel(null)}>
          <div className="w-full bg-card rounded-t-3xl px-6 pt-6 pb-10" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-foreground">{selectedPanel.title}</h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selectedPanel.text}</p>
              </div>
              <button onClick={() => setPanel(null)} className="p-1 text-muted-foreground"><X size={20} /></button>
            </div>
            <div className="rounded-2xl border border-border divide-y divide-border mb-5">
              {selectedPanel.rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-semibold text-foreground text-right">{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setPanel(null)} className="w-full py-3.5 rounded-2xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #1A3A6B, #2563EB)" }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(null);

  const [balance, setBalance] = useState(0);

  const [liveTransactions, setLiveTransactions] =
    useState<Transaction[]>([]);

 const fetchServerData = async () => {
  try {
  
    const accountData = await getStudentAccount();
    if (accountData && accountData.account) {
      setBalance(accountData.account.balance);
    }

    const txData = await getStudentTransactions();
    if (txData && txData.transactions) {
      const formattedNotifs = txData.transactions.map((tx: any) => ({
        id: tx.id,
        kategori: tx.type === 'in' ? 'setoran' : 'transfer',
        judul: tx.status === 'pending' ? 'Pengajuan Diproses' : 'Transaksi Berhasil',
        pesan: `${tx.note || tx.category} senilai Rp ${tx.amount.toLocaleString("id-ID")}`,
        waktu: new Date(tx.created_at).toLocaleDateString("id-ID"),
        dibaca: true,
        nominal: tx.amount,
        positif: tx.type === 'in',
      }));
      
      setNotifications(formattedNotifs);
    }
  } catch (error) {
    console.error("Gagal mengambil data dari server", error);
  }
};  
 const applyTransaction = (transactionData: any) => {
  setLiveTransactions((prev) => [transactionData, ...prev]);
  const isIn = transactionData.type === "in";
  const newNotif: Notif = {
    id: Date.now(),
    kategori: isIn ? "setoran" : "transfer",
    judul: isIn ? "Transaksi Masuk Berhasil" : "Transaksi Keluar Berhasil",
    pesan: transactionData.name || `${transactionData.category} senilai ${formatRupiah(transactionData.amount)} berhasil diproses.`,
    waktu: "Baru saja",
    dibaca: false,
    nominal: transactionData.amount,
    positif: isIn,
  };

  setNotifications((prev) => [newNotif, ...prev]);

  console.log("Transaksi dan Notifikasi berhasil disinkronkan:", transactionData);
};

  const [lastUpdated, setLastUpdated] =
    useState(new Date());

 const [notifications, setNotifications] = useState<any[]>([]);

useEffect(() => {
    if (currentUser && currentUser.role === "student") {
      fetchServerData();
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (currentUser && currentUser.role === "student") {
      fetchServerData();
    }
  }, [currentUser]);
      
const handleConfirmDeposit = async (amount: number) => {
  try {
    await createDeposit(amount);
    
    if (typeof refreshBalance === "function") {
      await refreshBalance();
    }

    const txData = await getStudentTransactions();
    if (txData && txData.transactions) {
      setLiveTransactions(txData.transactions);
    }

    alert("Setoran berhasil diproses dan disinkronkan ke server!");
  } catch (error: any) {
    alert(error.message || "Gagal melakukan setoran");
  }
};
  useEffect(() => {
    if (!currentUser || currentUser.role !== "student") {
      return;
    }

    const loadStudentAccount = async () => {
      try {
        const result = await getStudentAccount();

        setBalance(result.account.balance);
        setLastUpdated(
          new Date(result.account.updatedAt)
        );
      } catch (error) {
        console.error(
          "Gagal mengambil data rekening siswa:",
          error
        );
      }
    };

    void loadStudentAccount();
  }, [currentUser]);

  const refreshBalance = async () => {
    if (!currentUser || currentUser.role !== "student") {
      return;
    }

    try {
      const result = await getStudentAccount();

      setBalance(result.account.balance);
      setLastUpdated(new Date(result.account.updatedAt));

      const transactionResult = await getStudentTransactions();

      const mappedTransactions: Transaction[] =
        transactionResult.transactions.map((tx) => ({
          id: tx.id,
          name: tx.note || tx.category,
          type: tx.type,
          amount: tx.amount,
          date: tx.created_at,
          category: tx.category,
        }));

      setLiveTransactions(mappedTransactions);

      // Tambahkan notifikasi otomatis jika ada transaksi terbaru
      if (transactionResult.transactions.length > 0) {
        const latestTx = transactionResult.transactions[0];
        const newNotif: Notif = {
          id: latestTx.id,
          kategori: latestTx.type === "in" ? "setoran" : "transfer",
          judul: latestTx.type === "in" ? "Transaksi Masuk Berhasil" : "Transaksi Keluar Berhasil",
          pesan: latestTx.note || `${latestTx.category} senilai ${latestTx.amount} berhasil diproses.`,
          waktu: "Baru saja",
          dibaca: false,
          nominal: latestTx.amount,
          positif: latestTx.type === "in",
        };

        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
      }
    } catch (error) {
      console.error("Gagal memperbarui data siswa:", error);
    } finally {
      setLastUpdated(new Date());
    }
  };
  
  const handleStudentLogout = () => {
    logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setScreen("home");
    setBalance(0);
    setLiveTransactions([]);
    setNotifications([]);
  };

  if (!isLoggedIn || !currentUser) {
    return (
      <LoginScreen
        onLogin={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          setScreen("home");
        }}
      />
    );
  }

  if (currentUser.role === "admin") {
    return (
      <AdminDashboard
        onLogout={() => {
          logout();
          setCurrentUser(null);
          setIsLoggedIn(false);
          setScreen("home");
        }}
      />
    );
  }

  return (
    <div
      className="min-h-[100dvh] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center p-0 sm:p-4"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Phone frame */}
      <div
        className="relative w-full h-[100dvh] sm:w-[375px] sm:h-[780px] bg-background overflow-hidden rounded-none sm:rounded-[40px] shadow-none sm:shadow-2xl"
        style={{
          boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
        }}
      >
        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden">
         {screen === "home" && (
            <HomeScreen
              user={currentUser}
              onTransfer={() =>
                setScreen("transfer")
              }
              balance={balance}
              transactions={liveTransactions}
              lastUpdated={lastUpdated}
              onRefresh={refreshBalance}
              onTransaction={applyTransaction}
              notifications={notifications}
              onNotificationsChange={setNotifications}
            />
          )}

          {screen === "transfer" && (
            <TransferScreen
              balance={balance}
              onTransfer={applyTransaction}
            />
          )}

          {screen === "history" && (
            <HistoryScreen
              transactions={liveTransactions}
            />
          )}

          {screen === "profile" && (
            <ProfileScreen
              user={currentUser}
              balance={balance}
              onLogout={handleStudentLogout}
            />
          )}
        </div>

        {/* Bottom navigation */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-card border-t border-border flex items-center"
          style={{
            height: 72,
            paddingBottom: 12,
          }}
        >
          {navItems.map((item) => {
            const active =
              screen === item.id;

            return (
              <button
                key={item.id}
                onClick={() =>
                  setScreen(item.id)
                }
                className="flex-1 flex flex-col items-center gap-1 pt-3"
              >
                <item.icon
                  size={22}
                  color={
                    active
                      ? "#1A3A6B"
                      : "#9CA3AF"
                  }
                  strokeWidth={
                    active ? 2.5 : 1.75
                  }
                />

                <span
                  className="text-[10px] font-semibold"
                  style={{
                    color: active
                      ? "#1A3A6B"
                      : "#9CA3AF",
                  }}
                >
                  {item.label}
                </span>

                {active && (
                  <div
                    className="absolute bottom-2 w-1 h-1 rounded-full"
                    style={{
                      backgroundColor:
                        "#1A3A6B",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
