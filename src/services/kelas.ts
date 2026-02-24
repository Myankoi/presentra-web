import api from '@/lib/api';
import type { Kelas, QrKelas } from '@/types';

export const kelasService = {
    getAll: () => api.get<{ data: Kelas[] }>('/admin/kelas'),

    create: (data: { namaKelas: string; tahunAjaran: string }) =>
        api.post('/admin/kelas', data),

    update: (id: number, data: Partial<Kelas>) =>
        api.put(`/admin/kelas/${id}`, data),

    delete: (id: number) => api.delete(`/admin/kelas/${id}`),

    getQr: (id: number) => api.get<{ data: QrKelas }>(`/admin/kelas/${id}/qr`),

    regenerateQr: (id: number) =>
        api.post(`/admin/kelas/${id}/qr/regenerate`),
};
