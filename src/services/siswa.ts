import api from '@/lib/api';
import type { Siswa } from '@/types';

export const siswaService = {
    getAll: (params?: { kelasId?: number }) =>
        api.get<{ data: Siswa[] }>('/admin/siswa', { params }),

    create: (data: { nis: string; nama: string; jenisKelamin: 'L' | 'P'; kelasId: number }) =>
        api.post('/admin/siswa', data),

    update: (id: number, data: Partial<Siswa>) =>
        api.put(`/admin/siswa/${id}`, data),

    delete: (id: number) => api.delete(`/admin/siswa/${id}`),
};
