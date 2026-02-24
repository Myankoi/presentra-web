import api from '@/lib/api';
import type { JadwalMengajar, JadwalPiket } from '@/types';

export const jadwalMengajarService = {
    getAll: (params?: { guruId?: number; kelasId?: number; hari?: string }) =>
        api.get<{ data: JadwalMengajar[] }>('/admin/jadwal-mengajar', { params }),

    create: (data: {
        guruId: number;
        kelasId: number;
        mapelId: number;
        hari: string;
        jamMulai: string;
        jamSelesai: string;
    }) => api.post('/admin/jadwal-mengajar', data),

    delete: (id: number) => api.delete(`/admin/jadwal-mengajar/${id}`),
};

export const jadwalPiketService = {
    getAll: (params?: { hari?: string }) =>
        api.get<{ data: JadwalPiket[] }>('/admin/jadwal-piket', { params }),

    create: (data: { guruId: number; hari: string; keterangan?: string }) =>
        api.post('/admin/jadwal-piket', data),

    delete: (id: number) => api.delete(`/admin/jadwal-piket/${id}`),
};
