import api from '@/lib/api';
import type { DashboardSummary, ChartData } from '@/types';

export const dashboardService = {
    getSummary: () => api.get<{ data: DashboardSummary }>('/dashboard/summary'),
    getChart: (params?: { dari?: string; sampai?: string }) =>
        api.get<{ data: ChartData[] }>('/dashboard/chart', { params }),
};
