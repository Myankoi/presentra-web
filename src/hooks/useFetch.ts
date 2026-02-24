import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface UseFetchOptions {
    immediate?: boolean;
}

export function useFetch<T>(url: string, options: UseFetchOptions = { immediate: true }) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(url);
            setData(res.data.data ?? res.data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (options.immediate) {
            fetchData();
        }
    }, [fetchData, options.immediate]);

    return { data, loading, error, refetch: fetchData, setData };
}
