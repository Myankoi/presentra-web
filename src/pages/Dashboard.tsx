import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { dashboardService } from '@/services/dashboard';
import type { DashboardSummary, ChartData } from '@/types';
import {
    Users,
    GraduationCap,
    School,
    UserCheck,
    UserX,
    UserCog,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { toast } from 'sonner';

export default function Dashboard() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [chart, setChart] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sumRes, chartRes] = await Promise.all([
                    dashboardService.getSummary(),
                    dashboardService.getChart(),
                ]);
                console.log('[Dashboard] Summary:', sumRes.data);
                console.log('[Dashboard] Chart:', chartRes.data);
                setSummary(sumRes.data.data);
                setChart(chartRes.data.data || []);
            } catch (err) {
                console.error('[Dashboard] Error:', err);
                toast.error('Gagal memuat data dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = summary
        ? [
            { label: 'Total Siswa', value: summary.totalSiswa ?? 0, icon: GraduationCap, color: 'text-blue-600' },
            { label: 'Total Guru', value: summary.totalGuru ?? 0, icon: Users, color: 'text-emerald-600' },
            { label: 'Total Kelas', value: summary.totalKelas ?? 0, icon: School, color: 'text-amber-600' },
            { label: 'Siswa Hadir', value: summary.absensiHariIni?.hadir ?? 0, icon: UserCheck, color: 'text-green-600' },
            { label: 'Siswa Alfa', value: summary.absensiHariIni?.alfa ?? 0, icon: UserX, color: 'text-red-600' },
            { label: 'Guru Hadir', value: summary.guruHadirHariIni ?? 0, icon: UserCog, color: 'text-purple-600' },
        ]
        : [];

    return (
        <PageContainer
            title="Dashboard"
            description="Ringkasan data presensi dan statistik"
        >
            {/* Stats cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                    : statCards.map((stat) => (
                        <Card key={stat.label} className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{(stat.value ?? 0).toLocaleString('id-ID')}</div>
                            </CardContent>
                            {/* subtle accent bar */}
                            <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${stat.color}`} />
                        </Card>
                    ))}
            </div>

            {/* Attendance trend chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Tren Kehadiran Siswa</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                            Memuat grafik...
                        </div>
                    ) : chart.length === 0 ? (
                        <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                            Belum ada data kehadiran
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chart}>
                                <defs>
                                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorIzin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSakit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAlfa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis
                                    dataKey="tanggal"
                                    className="text-xs"
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--popover)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                    }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="hadir" stroke="#22c55e" fill="url(#colorHadir)" strokeWidth={2} />
                                <Area type="monotone" dataKey="izin" stroke="#3b82f6" fill="url(#colorIzin)" strokeWidth={2} />
                                <Area type="monotone" dataKey="sakit" stroke="#f59e0b" fill="url(#colorSakit)" strokeWidth={2} />
                                <Area type="monotone" dataKey="alfa" stroke="#ef4444" fill="url(#colorAlfa)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </PageContainer>
    );
}
