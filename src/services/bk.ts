import api from '@/lib/api';
import type { BkStatistik, TopAlfa } from '@/types';

export const bkService = {
    getStatistikHariIni: () =>
        api.get<{ data: BkStatistik }>('/bk/statistik-hari-ini'),

    getTopAlfa: (params?: { limit?: number }) =>
        api.get<{ data: TopAlfa[] }>('/bk/top-alfa', { params }),
};
