import api from '@/lib/api';
import type { LaporanRekap } from '@/types';

export const laporanService = {
    getRekap: (params?: { dari?: string; sampai?: string; kelasId?: number }) =>
        api.get<{ data: LaporanRekap[] }>('/laporan/rekap', { params }),

    exportExcel: (params?: { dari?: string; sampai?: string; kelasId?: number }) =>
        api.get('/laporan/export', {
            params,
            responseType: 'blob',
        }),
};
