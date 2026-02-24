# Presentra Web — Admin Dashboard

Aplikasi web admin untuk sistem **Presentra**, platform manajemen absensi berbasis QR code untuk sekolah. Dibangun dengan React + Vite + TypeScript, terintegrasi dengan Firebase Authentication dan REST API backend.

---

## ✨ Fitur Utama

| Halaman | Path | Deskripsi |
|---|---|---|
| Dashboard | `/` | Ringkasan data: total siswa, guru, kelas, absensi hari ini, dan grafik mingguan |
| Pengguna | `/pengguna` | Manajemen akun guru, sekretaris, dan BK |
| Kelas | `/kelas` | Manajemen kelas beserta QR code presensi |
| Siswa | `/siswa` | Manajemen data siswa per kelas |
| Mata Pelajaran | `/mapel` | Manajemen daftar mata pelajaran |
| Jadwal Mengajar | `/jadwal-mengajar` | Timetable jadwal mengajar guru per kelas per hari |
| Jadwal Piket | `/jadwal-piket` | Jadwal piket guru harian |
| Laporan | `/laporan` | Rekapitulasi absensi siswa dengan export |
| BK | `/bk` | Statistik absensi untuk keperluan Bimbingan Konseling |
| Notifikasi | `/notifikasi` | Inbox notifikasi pengguna |

**Akses:** Hanya pengguna dengan role `admin` atau `bk` yang dapat login ke dashboard ini.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite 7
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI)
- **Routing:** React Router DOM v7
- **Auth:** Firebase Authentication
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Notifications:** Sonner

---

## 🚀 Instalasi & Menjalankan

### Prasyarat

- Node.js >= 18
- Backend API **presentra-api** berjalan di `localhost:3000`

### Langkah-langkah

```bash
# 1. Clone repo & masuk ke direktori
cd presentra-web

# 2. Install dependensi
npm install

# 3. Salin file environment dan isi konfigurasi
cp .env.example .env

# 4. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di **http://localhost:5173**.

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root project berdasarkan variabel berikut:

```env
# URL REST API backend
VITE_API_URL=http://localhost:3000/api

# Firebase Web Config (dari Firebase Console > Project Settings)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **Catatan:** Semua variabel wajib diisi. Pastikan Firebase project yang digunakan sama dengan yang dipakai di backend.

---

## 📦 Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview hasil build production |
| `npm run lint` | Jalankan ESLint |

---

## 📁 Struktur Folder

```
src/
├── components/
│   ├── layout/        # Sidebar, TopBar, PageContainer
│   ├── shared/        # ProtectedRoute, komponen bersama
│   └── ui/            # shadcn/ui components
├── hooks/             # useAuth, custom hooks
├── lib/               # Axios instance, Firebase config, utils
├── pages/             # Satu folder per halaman
├── services/          # Fungsi API call per domain
└── types/             # TypeScript interfaces & types global
```

---

## 🔐 Autentikasi

Login menggunakan **Firebase Authentication** (email & password). Setelah login, token Firebase dikirim ke backend untuk verifikasi dan mendapatkan data pengguna beserta role-nya.

Middleware `ProtectedRoute` akan otomatis redirect ke `/login` jika:
- Pengguna belum login, atau
- Role pengguna bukan `admin` atau `bk`

---

## 🔗 Repositori Terkait

- **Backend API:** `presentra-api` — REST API dengan Express.js + Prisma
- **Mobile App:** `presentra-app` — Aplikasi Flutter untuk guru & siswa
