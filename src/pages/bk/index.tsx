import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { bkService } from '@/services/bk';
import type { BkStatistik, TopAlfa } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const STAT_COLORS = [
    { label: 'Hadir', key: 'hadir' as const, color: '#22c55e', bg: '#dcfce7' },
    { label: 'Izin', key: 'izin' as const, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Sakit', key: 'sakit' as const, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Alfa', key: 'alfa' as const, color: '#ef4444', bg: '#fee2e2' },
];

function DonutChart({ statistik }: { statistik: BkStatistik | null }) {
    if (!statistik) return <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Memuat...</div>;

    const total = statistik.hadir + statistik.izin + statistik.sakit + statistik.alfa;

    if (total === 0) return (
        <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
            Belum ada data absensi hari ini
        </div>
    );

    // Build conic-gradient segments
    let accumulated = 0;
    const segments = STAT_COLORS.map(s => {
        const value = statistik[s.key];
        const pct = total > 0 ? (value / total) * 100 : 0;
        const start = accumulated;
        accumulated += pct;
        return { ...s, value, pct, start };
    }).filter(s => s.value > 0);

    const gradient = segments
        .map(s => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
        .join(', ');

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
                <div
                    className="rounded-full"
                    style={{
                        width: 180,
                        height: 180,
                        background: `conic-gradient(${gradient})`,
                    }}
                />
                {/* hole */}
                <div className="absolute rounded-full bg-background flex flex-col items-center justify-center" style={{ width: 90, height: 90 }}>
                    <p className="text-2xl font-bold">{total}</p>
                    <p className="text-[10px] text-muted-foreground">siswa</p>
                </div>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {segments.map(s => (
                    <div key={s.key} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className="text-xs font-semibold ml-auto">{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function BkPage() {
    const [statistik, setStatistik] = useState<BkStatistik | null>(null);
    const [topAlfa, setTopAlfa] = useState<TopAlfa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statRes, alfaRes] = await Promise.all([
                    bkService.getStatistikHariIni(),
                    bkService.getTopAlfa({ limit: 10 }),
                ]);
                setStatistik(statRes.data.data);
                setTopAlfa(((alfaRes.data.data as unknown) as { topAlfa: TopAlfa[] })?.topAlfa || []);
            } catch (err) {
                console.error('BK fetch error:', err);
                toast.error('Gagal memuat data BK');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: 'Hadir', value: statistik?.hadir ?? 0, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' },
        { label: 'Izin', value: statistik?.izin ?? 0, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
        { label: 'Sakit', value: statistik?.sakit ?? 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
        { label: 'Alfa', value: statistik?.alfa ?? 0, icon: UserX, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' },
    ];

    return (
        <PageContainer
            title="Bimbingan Konseling"
            description="Statistik kehadiran hari ini dan siswa dengan alfa terbanyak"
        >
            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                    : statCards.map((s) => (
                        <Card key={s.label} className={s.bg}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                                <s.icon className={`h-5 w-5 ${s.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    dari {statistik?.totalSiswa ?? 0} siswa
                                </p>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Donut Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Distribusi Kehadiran Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-4">
                        {loading
                            ? <Skeleton className="h-[220px] w-[220px] rounded-full" />
                            : <DonutChart statistik={statistik} />
                        }
                    </CardContent>
                </Card>

                {/* Top Alfa */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Top 10 Siswa Alfa Terbanyak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : topAlfa.length === 0 ? (
                            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                                Tidak ada data alfa
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead className="text-right">Total Alfa</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topAlfa.map((s, i) => (
                                        <TableRow key={s.siswaId}>
                                            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{s.nama}</p>
                                                    <p className="text-xs text-muted-foreground">{s.nis}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{s.namaKelas}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="destructive">{s.totalAlfa}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
