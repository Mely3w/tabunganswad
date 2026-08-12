import "dotenv/config";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import XLSX from "xlsx";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3001);
const databasePath = resolve(__dirname, "data", "tabungan-swad.db");
const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "development-only-change-this-secret-32-chars");
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET wajib diatur dan minimal 32 karakter.");
}

mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec("PRAGMA foreign_keys = ON;");

const upload = multer({ dest: "uploads/" });

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
      active INTEGER NOT NULL DEFAULT 1,
      class_name TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      account_number TEXT NOT NULL UNIQUE,
      balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL CHECK (amount > 0),
      type TEXT NOT NULL CHECK (type IN ('in', 'out')),
      category TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function seed() {
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get("admin.swad");
  if (existing) return;

  const insertUser = db.prepare("INSERT INTO users (name, username, password_hash, role, active, class_name) VALUES (?, ?, ?, ?, ?, ?)");
  const insertAccount = db.prepare("INSERT INTO accounts (user_id, account_number, balance) VALUES (?, ?, ?)");
  const insertTransaction = db.prepare("INSERT INTO transactions (account_id, amount, type, category, note, status) VALUES (?, ?, ?, ?, ?, ?)");
  const passwordAdmin = await bcrypt.hash("Admin123!", 12);
  const passwordStudent = await bcrypt.hash("Siswa123!", 12);
  const passwordPending = await bcrypt.hash("Dimas123!", 12);

  insertUser.run("Petugas Tabungan Swad", "admin.swad", passwordAdmin, "admin", 1, null);
  const students = [
    ["Ahmad Rizki", "1023-4567", "XI RPL 1", 875000, passwordStudent, 1],
    ["Siti Nurhaliza", "1045-8901", "XI AKL 2", 640000, passwordStudent, 1],
    ["Budi Santoso", "1067-2345", "X TJKT 1", 320000, passwordStudent, 1],
    ["Dimas Prayoga", "1089-6789", "XII RPL 2", 0, passwordPending, 0],
  ];

  for (const [name, username, className, balance, passwordHash, active] of students) {
    const result = insertUser.run(name, username, passwordHash, "student", active, className);
    insertAccount.run(Number(result.lastInsertRowid), username, balance);
  }

  const accounts = db.prepare("SELECT id, account_number FROM accounts").all();
  const accountByNumber = new Map(accounts.map((account) => [account.account_number, account.id]));
  insertTransaction.run(accountByNumber.get("1023-4567"), 100000, "in", "Setoran tunai", "Setoran di petugas", "completed");
  insertTransaction.run(accountByNumber.get("1045-8901"), 50000, "out", "Penarikan", "Pengajuan penarikan", "pending");
  insertTransaction.run(accountByNumber.get("1067-2345"), 25000, "out", "Pembayaran koperasi", "Koperasi sekolah", "completed");
}

function publicUser(user) {
  return { id: user.id, name: user.name, username: user.username, role: user.role, className: user.class_name, active: Boolean(user.active) };
}

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: "8h", issuer: "tabungan-swad-api" });
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Sesi tidak ditemukan. Silakan masuk kembali." });
  try {
    req.auth = jwt.verify(token, jwtSecret, { issuer: "tabungan-swad-api" });
    return next();
  } catch {
    return res.status(401).json({ message: "Sesi tidak valid atau telah berakhir." });
  }
}

function allowRole(...roles) {
  return (req, res, next) => roles.includes(req.auth.role)
    ? next()
    : res.status(403).json({ message: "Anda tidak memiliki akses ke fitur ini." });
}

function getCurrentUser(userId) {
  return db.prepare("SELECT id, name, username, role, active, class_name FROM users WHERE id = ?").get(userId);
}

const app = express();
app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin tidak diizinkan oleh server."));
  },
}));
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/login", async (req, res) => {
  const usernameInput = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  const requestedRole = req.body?.role;
  
  if (!usernameInput || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi." });
  }

  const cleanInput = usernameInput.toLowerCase().replace(/[^a-z0-9]/g, "");
  const users = db.prepare("SELECT * FROM users").all();
  const user = users.find(u => {
    const dbClean = String(u.username || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return dbClean === cleanInput;
  });
  
  if (!user) {
    return res.status(401).json({ message: "Akun tidak ditemukan." });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Password salah." });
  }

  if (requestedRole && user.role !== requestedRole) {
    return res.status(401).json({ message: "Role akun tidak sesuai." });
  }

  if (!user.active && user.role === 'student') {
    db.prepare("UPDATE users SET active = 1 WHERE id = ?").run(user.id);
    user.active = 1;
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  const user = getCurrentUser(req.auth.sub);
  if (!user || !user.active) return res.status(401).json({ message: "Akun tidak aktif." });
  return res.json({ user: publicUser(user) });
});

app.get("/api/student/account", authenticate, allowRole("student"), (req, res) => {
  const account = db.prepare(`SELECT a.account_number, a.balance, a.updated_at, u.name, u.class_name
    FROM accounts a JOIN users u ON u.id = a.user_id WHERE u.id = ?`).get(req.auth.sub);
  return res.json({ account });
});

app.get("/api/student/transactions", authenticate, allowRole("student"), (req, res) => {
  const rows = db.prepare(`SELECT t.id, t.amount, t.type, t.category, t.note, t.status, t.created_at
    FROM transactions t JOIN accounts a ON a.id = t.account_id WHERE a.user_id = ? ORDER BY t.created_at DESC LIMIT 50`).all(req.auth.sub);
  return res.json({ transactions: rows });
});

app.get("/api/student/contacts", authenticate, allowRole("student"), (req, res) => {
  const contacts = db.prepare(`
    SELECT
      u.id,
      u.name,
      a.account_number AS accountNumber,
      u.class_name AS className
    FROM users u
    JOIN accounts a ON a.user_id = u.id
    WHERE u.role = 'student'
      AND u.active = 1
      AND u.id != ?
    ORDER BY u.name
  `).all(req.auth.sub);

  return res.json({ contacts });
});

app.get("/api/admin/dashboard", authenticate, allowRole("admin"), (_req, res) => {
  const totalBalance = db.prepare("SELECT COALESCE(SUM(balance), 0) AS total FROM accounts").get().total;
  const activeStudents = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'student' AND active = 1").get().count;
  const pendingAccounts = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'student' AND active = 0").get().count;
  const pendingTransactions = db.prepare("SELECT COUNT(*) AS count FROM transactions WHERE status = 'pending'").get().count;
  return res.json({ totalBalance, activeStudents, pendingAccounts, pendingTransactions });
});

app.get("/api/admin/students", authenticate, allowRole("admin"), (req, res) => {
  const query = `%${String(req.query.q || "").trim()}%`;
  const students = db.prepare(`SELECT u.id, u.name, u.username AS nis, u.class_name AS className, u.active,
      COALESCE(a.balance, 0) AS balance, a.account_number AS accountNumber
    FROM users u LEFT JOIN accounts a ON a.user_id = u.id
    WHERE u.role = 'student' AND (u.name LIKE ? OR u.username LIKE ? OR u.class_name LIKE ?)
    ORDER BY u.name`).all(query, query, query);
  return res.json({ students: students.map((student) => ({ ...student, active: Boolean(student.active) })) });
});

app.patch("/api/admin/students/:id/status", authenticate, allowRole("admin"), (req, res) => {
  const active = Boolean(req.body?.active);
  const result = db.prepare("UPDATE users SET active = ? WHERE id = ? AND role = 'student'").run(active ? 1 : 0, req.params.id);
  if (!result.changes) return res.status(404).json({ message: "Akun siswa tidak ditemukan." });
  return res.json({ message: active ? "Akun siswa telah diaktifkan." : "Akun siswa telah dinonaktifkan." });
});

app.post("/api/admin/students", authenticate, allowRole("admin"), async (req, res) => {
  const { name, username, className, password } = req.body;
  
  if (!name || !username || !className || !password) {
    return res.status(400).json({ message: "Semua data (Nama, NIS, Kelas, Password) wajib diisi." });
  }

  db.exec("BEGIN");
  try {
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existing) {
      db.exec("ROLLBACK");
      return res.status(400).json({ message: "NIS tersebut sudah terdaftar." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const insertUser = db.prepare("INSERT INTO users (name, username, password_hash, role, active, class_name) VALUES (?, ?, ?, 'student', 1, ?)");
    const result = insertUser.run(name, username, passwordHash, className);
    
    const insertAccount = db.prepare("INSERT INTO accounts (user_id, account_number, balance) VALUES (?, ?, 0)");
    insertAccount.run(result.lastInsertRowid, username);
    
    db.exec("COMMIT");
    return res.status(200).json({ message: "Siswa baru berhasil ditambahkan." });
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch (e) {}
    console.error(error);
    return res.status(500).json({ message: "Gagal menyimpan data siswa ke server." });
  }
});

// Endpoint Import Massal Siswa via Excel
app.post("/api/admin/import-students", authenticate, allowRole("admin"), upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File Excel wajib diunggah." });

  db.exec("BEGIN");
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rows.length) {
      db.exec("ROLLBACK");
      return res.status(400).json({ message: "File Excel kosong atau format tidak sesuai." });
    }

    const insertUser = db.prepare("INSERT INTO users (name, username, password_hash, role, active, class_name) VALUES (?, ?, ?, 'student', 1, ?)");
    const insertAccount = db.prepare("INSERT INTO accounts (user_id, account_number, balance) VALUES (?, ?, 0)");

    let count = 0;
    for (const row of rows) {
      const name = row.Nama || row.name;
      const nis = String(row.NIS || row.nis || "").trim();
      const className = row.Kelas || row.kelas;
      const rawPassword = String(row.Password || row.password || "Siswa123!");

      if (!name || !nis) continue;

      const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(nis);
      if (existing) continue;

      const passwordHash = await bcrypt.hash(rawPassword, 12);
      const resUser = insertUser.run(name, nis, passwordHash, className || "-");
      insertAccount.run(Number(resUser.lastInsertRowid), nis);
      count++;
    }

    db.exec("COMMIT");
    return res.json({ message: `Berhasil mengimpor ${count} data siswa baru.` });
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch (e) {}
    console.error(error);
    return res.status(500).json({ message: "Gagal memproses file Excel di server." });
  }
});

app.get("/api/admin/transactions", authenticate, allowRole("admin"), (_req, res) => {
  const transactions = db.prepare(`SELECT t.id, u.name AS student, t.amount, t.type, t.category, t.note, t.status, t.created_at
    FROM transactions t JOIN accounts a ON a.id = t.account_id JOIN users u ON u.id = a.user_id
    ORDER BY t.created_at DESC LIMIT 100`).all();
  return res.json({ transactions });
});

app.patch("/api/admin/transactions/:id/approve", authenticate, allowRole("admin"), (req, res) => {
  const transaction = db.prepare("SELECT * FROM transactions WHERE id = ? AND status = 'pending'").get(req.params.id);
  if (!transaction) return res.status(404).json({ message: "Transaksi menunggu tidak ditemukan." });
  const account = db.prepare("SELECT balance FROM accounts WHERE id = ?").get(transaction.account_id);
  if (transaction.type === "out" && account.balance < transaction.amount) return res.status(422).json({ message: "Saldo siswa tidak mencukupi." });

  db.exec("BEGIN");
  try {
    const delta = transaction.type === "in" ? transaction.amount : -transaction.amount;
    db.prepare("UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(delta, transaction.account_id);
    db.prepare("UPDATE transactions SET status = 'completed' WHERE id = ?").run(transaction.id);
    db.exec("COMMIT");
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch (e) {}
    throw error;
  }
  return res.json({ message: "Transaksi telah disetujui." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Terjadi kesalahan pada server." });
});

migrate();
const serverPort = Number(process.env.PORT) || port;
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`API Tabungan Swad berjalan di port ${serverPort}`);
});
