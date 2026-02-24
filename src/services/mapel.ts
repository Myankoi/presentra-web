import api from '@/lib/api';
import type { Mapel } from '@/types';

export const mapelService = {
    getAll: () => api.get<{ data: Mapel[] }>('/admin/mapel'),

    create: (data: { namaMapel: string; kodeMapel: string }) =>
        api.post('/admin/mapel', data),

    update: (id: number, data: Partial<Mapel>) =>
        api.put(`/admin/mapel/${id}`, data),

    delete: (id: number) => api.delete(`/admin/mapel/${id}`),
};
