import api from '@/lib/api';
import type { User } from '@/types';

export const penggunaService = {
    getAll: () => api.get<{ data: User[] }>('/admin/pengguna'),

    create: (data: { nama: string; email: string; role: string }) =>
        api.post('/users', data),

    update: (id: number, data: Partial<User>) =>
        api.put(`/admin/pengguna/${id}`, data),

    delete: (id: number) => api.delete(`/admin/pengguna/${id}`),

    bulkImport: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/users/bulk-import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
