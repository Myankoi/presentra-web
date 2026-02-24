// ============ Auth & User ============
export type UserRole = 'admin' | 'guru' | 'sekretaris' | 'bk';

export interface User {
    id: number;
    nama: string;
    email: string;
    role: UserRole;
    firebaseUid: string;
    linkedSiswaId?: number | null;
    createdAt: string;
    updatedAt: string;
}

// ============ Kelas ============
export interface Kelas {
    id: number;
    namaKelas: string;
    tahunAjaran: string;
    createdAt: string;
}

export interface QrKelas {
    id: number;
    kelasId: number;
    tokenQr: string;
    isActive: boolean;
}

// ============ Siswa ============
export interface Siswa {
    id: number;
    nis: string;
    nama: string;
    jenisKelamin: 'L' | 'P';
    kelasId: number;
    createdAt: string;
    deletedAt?: string | null;
    // joined
    kelas?: Kelas;
}

// ============ Mapel ============
export interface Mapel {
    id: number;
    namaMapel: string;
    kodeMapel: string;
}

// ============ Jadwal Mengajar ============
export type Hari = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat';

export interface JadwalMengajar {
    id: number;
    guruId: number;
    kelasId: number;
    mapelId: number;
    hari: Hari;
    jamMulai: string;
    jamSelesai: string;
    // joined
    guru?: User;
    kelas?: Kelas;
    mapel?: Mapel;
}

// ============ Jadwal Piket ============
export interface JadwalPiket {
    id: number;
    guruId: number;
    hari: Hari;
    keterangan?: string;
    // joined
    guru?: User;
}

// ============ Absensi ============
export type StatusAbsenGuru = 'hadir' | 'tidak_hadir';
export type StatusAbsenSiswa = 'hadir' | 'izin' | 'sakit' | 'alfa';

export interface AbsenGuru {
    id: number;
    guruId: number;
    kelasId: number;
    tanggal: string;
    waktuScan: string;
    status: StatusAbsenGuru;
}

export interface AbsenSiswa {
    id: number;
    siswaId: number;
    kelasId: number;
    tanggal: string;
    status: StatusAbsenSiswa;
    keterangan?: string;
    recordedBy: number;
    createdAt: string;
}

// ============ Dashboard ============
export interface DashboardSummary {
    totalSiswa: number;
    totalGuru: number;
    totalKelas: number;
    absensiHariIni: {
        hadir: number;
        alfa: number;
        terlambat: number;
    };
    guruHadirHariIni: number;
}

export interface ChartData {
    tanggal: string;
    hadir: number;
    izin: number;
    sakit: number;
    alfa: number;
}

// ============ BK ============
export interface BkStatistik {
    totalSiswa: number;
    hadir: number;
    izin: number;
    sakit: number;
    alfa: number;
}

export interface TopAlfa {
    siswaId: number;
    nama: string;
    nis: string;
    namaKelas: string;
    totalAlfa: number;
}

// ============ Notification ============
export interface Notification {
    id: number;
    userId: number;
    judul: string;
    pesan: string;
    isRead: boolean;
    createdAt: string;
}

// ============ API Response ============
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total?: number;
    page?: number;
    limit?: number;
}

// ============ Laporan ============
export interface LaporanRekap {
    tanggal: string;
    kelas: string;
    hadir: number;
    izin: number;
    sakit: number;
    alfa: number;
    total: number;
}
