# Backend Tabungan Swad

Backend menggunakan Express, SQLite bawaan Node.js, JWT, dan `bcryptjs` untuk hash password.

## Menjalankan

1. Salin `.env.example` menjadi `.env`, lalu ganti `JWT_SECRET` dengan nilai acak minimal 32 karakter.
2. Jalankan API: `npm.cmd run server`
3. Di terminal lain, jalankan aplikasi: `npm.cmd run dev`

Database dibuat otomatis di `server/data/tabungan-swad.db` saat server pertama dijalankan.

## Akun demo

| Peran | Username | Password |
| --- | --- | --- |
| Admin | `admin.swad` | `Admin123!` |
| Siswa aktif | `1023-4567` | `Siswa123!` |
| Siswa menunggu aktivasi | `1089-6789` | `Dimas123!` |

Ganti atau hapus akun demo sebelum aplikasi dipakai oleh pengguna sungguhan.

## Endpoint utama

- `POST /api/auth/login` — login dan penerbitan JWT.
- `GET /api/auth/me` — data pemegang sesi.
- `GET /api/student/account` dan `/api/student/transactions` — data siswa yang sedang masuk.
- `GET /api/admin/dashboard`, `/api/admin/students`, dan `/api/admin/transactions` — data petugas.
- `PATCH /api/admin/students/:id/status` — aktivasi/nonaktif akun siswa.
- `PATCH /api/admin/transactions/:id/approve` — menyetujui transaksi tertunda.
