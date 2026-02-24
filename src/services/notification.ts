import api from '@/lib/api';
import type { Notification } from '@/types';

export const notificationService = {
    getAll: () => api.get<{ data: Notification[] }>('/notifications'),

    markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
};
